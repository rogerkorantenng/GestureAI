from pydantic import BaseModel, Field
from typing import Optional


class TranslationRequest(BaseModel):
    """Request model for sign language translation."""

    image: str = Field(..., description="Base64 encoded image data")
    language: str = Field(default="ASL", description="Sign language type (ASL, BSL, etc.)")


class TranslationResponse(BaseModel):
    """Response model for sign language translation."""

    text: str = Field(..., description="Translated text")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score")
    language: str = Field(..., description="Detected sign language")
    raw_response: Optional[str] = Field(None, description="Raw model response for debugging")


class SignGuidanceRequest(BaseModel):
    """Request model for text-to-sign guidance."""

    text: str = Field(..., min_length=1, max_length=500, description="Text to convert to sign language")
    language: str = Field(default="ASL", description="Target sign language")


class SignGuidanceStep(BaseModel):
    """A single step in sign language guidance."""

    step: int
    description: str
    hand_position: str
    movement: Optional[str] = None


class SignGuidanceResponse(BaseModel):
    """Response model for text-to-sign guidance."""

    text: str = Field(..., description="Original text")
    language: str = Field(..., description="Target sign language")
    steps: list[SignGuidanceStep] = Field(..., description="Step-by-step signing instructions")
    notes: Optional[str] = Field(None, description="Additional notes or tips")


class HandLandmarks(BaseModel):
    """Hand landmark data from MediaPipe."""

    landmarks: list[dict] = Field(..., description="List of landmark coordinates")
    handedness: str = Field(..., description="Left or Right hand")
    confidence: float = Field(..., ge=0, le=1, description="Detection confidence")


class WebSocketMessage(BaseModel):
    """WebSocket message format."""

    type: str = Field(..., description="Message type: frame, translation, error")
    data: Optional[dict] = Field(None, description="Message payload")
    error: Optional[str] = Field(None, description="Error message if type is error")


class VideoResource(BaseModel):
    """External video resource for sign language learning."""

    title: str = Field(..., description="Video title")
    url: str = Field(..., description="Video URL")
    source: str = Field(..., description="Source platform (YouTube, HandSpeak, etc.)")
    thumbnail: Optional[str] = Field(None, description="Thumbnail URL")


class VisualSignStep(BaseModel):
    """A step with visual guidance for signing."""

    step: int
    word: str = Field(..., description="The word or phrase being signed")
    description: str = Field(..., description="Detailed description of how to make the sign")
    hand_shape: str = Field(..., description="Description of the hand shape")
    palm_orientation: str = Field(..., description="Which direction the palm faces")
    location: str = Field(..., description="Where the sign is made (chest, face, neutral space)")
    movement: Optional[str] = Field(None, description="Movement required")
    facial_expression: Optional[str] = Field(None, description="Required facial expression")
    video_search_query: str = Field(..., description="Search query to find video demonstrations")


class VisualGuidanceRequest(BaseModel):
    """Request for visual sign guidance."""

    text: str = Field(..., min_length=1, max_length=200, description="Word or phrase to learn")
    language: str = Field(default="ASL", description="Target sign language")


class VisualGuidanceResponse(BaseModel):
    """Response with visual sign guidance and resources."""

    text: str = Field(..., description="Original text")
    language: str = Field(..., description="Target sign language")
    steps: list[VisualSignStep] = Field(..., description="Step-by-step visual guidance")
    video_resources: list[VideoResource] = Field(default=[], description="External video resources")
    tips: Optional[str] = Field(None, description="Additional learning tips")
    common_mistakes: Optional[str] = Field(None, description="Common mistakes to avoid")


class FingerPose(BaseModel):
    """Finger pose data for 3D hand model."""

    curl: float = Field(..., ge=0, le=1, description="Curl amount (0=straight, 1=fully curled)")
    spread: float = Field(..., ge=-1, le=1, description="Lateral spread (-1 to 1)")


class HandPoseData(BaseModel):
    """3D hand pose data for visualization."""

    thumb: FingerPose
    index: FingerPose
    middle: FingerPose
    ring: FingerPose
    pinky: FingerPose
    wrist_rotation: dict = Field(default={"x": 0, "y": 0, "z": 0}, description="Wrist rotation in radians")
    palm_direction: str = Field(default="forward", description="Direction the palm faces")


class HandPoseRequest(BaseModel):
    """Request for 3D hand pose generation."""

    sign: str = Field(..., min_length=1, max_length=50, description="Word or letter to generate pose for")
    language: str = Field(default="ASL", description="Sign language type")


class HandPoseResponse(BaseModel):
    """Response with 3D hand pose data."""

    sign: str = Field(..., description="The sign this pose represents")
    pose: HandPoseData = Field(..., description="3D hand pose data")
    description: str = Field(..., description="Description of the hand position")


class SignGifRequest(BaseModel):
    """Request to fetch sign language GIF."""

    word: str = Field(..., min_length=1, max_length=100, description="Word to find GIF for")


class SignGifResponse(BaseModel):
    """Response with sign language GIF/video URLs."""

    word: str = Field(..., description="The word searched for")
    gif_url: Optional[str] = Field(None, description="Direct URL to media (GIF or video)")
    page_url: str = Field(..., description="URL to the source page")
    source: str = Field(..., description="Source website name")
    found: bool = Field(..., description="Whether media was found")
    alt_sources: list[dict] = Field(default=[], description="Alternative video sources")
    media_type: str = Field(default="image", description="Type of media: 'image' or 'video'")
