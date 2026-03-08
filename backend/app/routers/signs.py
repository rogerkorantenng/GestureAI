from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    SignGuidanceRequest,
    SignGuidanceResponse,
    VisualGuidanceRequest,
    VisualGuidanceResponse,
    HandPoseRequest,
    HandPoseResponse,
    SignGifRequest,
    SignGifResponse,
)
from app.services.gemini import get_sign_guidance, get_visual_sign_guidance, generate_hand_pose
from app.services.sign_resources import fetch_sign_gif

router = APIRouter()


@router.post("/guidance", response_model=SignGuidanceResponse)
async def get_text_to_sign_guidance(request: SignGuidanceRequest):
    """
    Get step-by-step guidance for signing text.

    Accepts text and returns detailed instructions for how to sign it.
    """
    try:
        result = await get_sign_guidance(
            text=request.text,
            language=request.language,
        )

        return SignGuidanceResponse(
            text=request.text,
            language=request.language,
            steps=result["steps"],
            notes=result.get("notes"),
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get guidance: {str(e)}")


@router.get("/alphabet/{letter}")
async def get_alphabet_sign(letter: str):
    """
    Get guidance for signing a single letter of the alphabet.
    """
    if len(letter) != 1 or not letter.isalpha():
        raise HTTPException(status_code=400, detail="Please provide a single letter")

    try:
        result = await get_sign_guidance(
            text=letter.upper(),
            language="ASL",
        )

        return {
            "letter": letter.upper(),
            "guidance": result["steps"][0] if result["steps"] else None,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/common")
async def get_common_signs():
    """
    Get a list of common signs and their meanings.
    """
    common_signs = [
        {"sign": "Hello", "description": "Wave hand side to side"},
        {"sign": "Thank you", "description": "Touch chin and move hand forward"},
        {"sign": "Please", "description": "Circular motion on chest with flat hand"},
        {"sign": "Sorry", "description": "Fist circles on chest"},
        {"sign": "Yes", "description": "Fist moves up and down like nodding"},
        {"sign": "No", "description": "Index and middle finger tap thumb"},
        {"sign": "Help", "description": "Thumbs up on flat palm, lift together"},
        {"sign": "I love you", "description": "Pinky, index, and thumb extended"},
    ]

    return {"signs": common_signs}


@router.post("/visual-guidance", response_model=VisualGuidanceResponse)
async def get_visual_sign_guidance_endpoint(request: VisualGuidanceRequest):
    """
    Get detailed visual guidance for signing text with video resources.

    Returns step-by-step visual instructions and links to video demonstrations.
    """
    try:
        result = await get_visual_sign_guidance(
            text=request.text,
            language=request.language,
        )

        return VisualGuidanceResponse(
            text=request.text,
            language=request.language,
            steps=result["steps"],
            video_resources=result.get("video_resources", []),
            tips=result.get("tips"),
            common_mistakes=result.get("common_mistakes"),
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get visual guidance: {str(e)}")


@router.post("/hand-pose", response_model=HandPoseResponse)
async def get_hand_pose(request: HandPoseRequest):
    """
    Generate 3D hand pose data for a sign.

    Uses AI to generate precise finger positions for 3D hand visualization.
    """
    try:
        result = await generate_hand_pose(
            sign=request.sign,
            language=request.language,
        )

        return HandPoseResponse(
            sign=result["sign"],
            pose=result["pose"],
            description=result["description"],
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate hand pose: {str(e)}")


@router.post("/gif", response_model=SignGifResponse)
async def get_sign_gif(request: SignGifRequest):
    """
    Fetch sign language GIF/video from external resources.

    Searches Lifeprint (ASL University) and HandSpeak for demonstration media.
    Returns either GIF images or MP4 videos depending on what's available.
    """
    try:
        result = await fetch_sign_gif(request.word)

        return SignGifResponse(
            word=result["word"],
            gif_url=result.get("gif_url"),
            page_url=result["page_url"],
            source=result["source"],
            found=result["found"],
            alt_sources=result.get("alt_sources", []),
            media_type=result.get("media_type", "image"),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sign media: {str(e)}")
