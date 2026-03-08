import base64
import io
from PIL import Image
import numpy as np
from typing import Optional

try:
    import cv2
    import mediapipe as mp

    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False

from app.config import get_settings


def decode_base64_image(base64_string: str) -> Optional[Image.Image]:
    """
    Decode a base64 encoded image string to PIL Image.

    Args:
        base64_string: Base64 encoded image (may include data URL prefix)

    Returns:
        PIL Image or None if decoding fails
    """
    try:
        # Remove data URL prefix if present
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]

        # Decode base64
        image_bytes = base64.b64decode(base64_string)

        # Convert to PIL Image
        image = Image.open(io.BytesIO(image_bytes))

        # Convert to RGB if necessary
        if image.mode != "RGB":
            image = image.convert("RGB")

        return image

    except Exception as e:
        print(f"Error decoding image: {e}")
        return None


def process_frame(image: Image.Image) -> Image.Image:
    """
    Process a video frame for sign language detection.

    This function can optionally use MediaPipe to detect hands
    and crop/enhance the relevant region.

    Args:
        image: PIL Image to process

    Returns:
        Processed PIL Image
    """
    settings = get_settings()

    # Resize if too large
    max_size = settings.max_frame_size
    if max(image.size) > max_size:
        ratio = max_size / max(image.size)
        new_size = (int(image.size[0] * ratio), int(image.size[1] * ratio))
        image = image.resize(new_size, Image.Resampling.LANCZOS)

    # Optional: Use MediaPipe for hand detection and cropping
    if MEDIAPIPE_AVAILABLE:
        try:
            image = enhance_with_mediapipe(image)
        except Exception as e:
            print(f"MediaPipe processing failed: {e}")
            # Continue with original image

    return image


def enhance_with_mediapipe(image: Image.Image) -> Image.Image:
    """
    Use MediaPipe to detect hands and optionally enhance the image.

    Args:
        image: PIL Image

    Returns:
        Enhanced PIL Image with hand region highlighted
    """
    if not MEDIAPIPE_AVAILABLE:
        return image

    # Convert PIL to OpenCV format
    cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

    # Initialize MediaPipe Hands
    mp_hands = mp.solutions.hands

    with mp_hands.Hands(
        static_image_mode=True,
        max_num_hands=2,
        min_detection_confidence=0.5,
    ) as hands:
        # Process the image
        results = hands.process(cv2.cvtColor(cv_image, cv2.COLOR_BGR2RGB))

        if results.multi_hand_landmarks:
            # Draw hand landmarks for better visibility
            mp_drawing = mp.solutions.drawing_utils
            mp_drawing_styles = mp.solutions.drawing_styles

            for hand_landmarks in results.multi_hand_landmarks:
                mp_drawing.draw_landmarks(
                    cv_image,
                    hand_landmarks,
                    mp_hands.HAND_CONNECTIONS,
                    mp_drawing_styles.get_default_hand_landmarks_style(),
                    mp_drawing_styles.get_default_hand_connections_style(),
                )

    # Convert back to PIL
    return Image.fromarray(cv2.cvtColor(cv_image, cv2.COLOR_BGR2RGB))


def extract_hand_landmarks(image: Image.Image) -> Optional[dict]:
    """
    Extract hand landmark data from an image using MediaPipe.

    Args:
        image: PIL Image

    Returns:
        Dictionary with hand landmarks or None
    """
    if not MEDIAPIPE_AVAILABLE:
        return None

    # Convert PIL to numpy array
    np_image = np.array(image)

    mp_hands = mp.solutions.hands

    with mp_hands.Hands(
        static_image_mode=True,
        max_num_hands=2,
        min_detection_confidence=0.5,
    ) as hands:
        results = hands.process(np_image)

        if not results.multi_hand_landmarks:
            return None

        hands_data = []
        for idx, hand_landmarks in enumerate(results.multi_hand_landmarks):
            handedness = "Unknown"
            if results.multi_handedness:
                handedness = results.multi_handedness[idx].classification[0].label

            landmarks = []
            for landmark in hand_landmarks.landmark:
                landmarks.append({
                    "x": landmark.x,
                    "y": landmark.y,
                    "z": landmark.z,
                })

            hands_data.append({
                "handedness": handedness,
                "landmarks": landmarks,
                "confidence": results.multi_handedness[idx].classification[0].score
                if results.multi_handedness
                else 0.5,
            })

        return {"hands": hands_data}


def image_to_base64(image: Image.Image, quality: int = 85) -> str:
    """
    Convert a PIL Image to base64 string.

    Args:
        image: PIL Image
        quality: JPEG quality (1-100)

    Returns:
        Base64 encoded string
    """
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=quality)
    return base64.b64encode(buffer.getvalue()).decode("utf-8")
