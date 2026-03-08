from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
import base64
import json

from app.models.schemas import TranslationRequest, TranslationResponse
from app.services.gemini import translate_sign_language
from app.services.video import process_frame, decode_base64_image

router = APIRouter()


@router.post("/frame", response_model=TranslationResponse)
async def translate_frame(request: TranslationRequest):
    """
    Translate a single frame containing sign language.

    Accepts a base64 encoded image and returns the detected sign language text.
    """
    try:
        # Decode and process the image
        image_data = decode_base64_image(request.image)

        if image_data is None:
            raise HTTPException(status_code=400, detail="Invalid image data")

        # Process frame (optional preprocessing with MediaPipe)
        processed_image = process_frame(image_data)

        # Translate using Gemini
        result = await translate_sign_language(
            processed_image,
            language=request.language,
        )

        return TranslationResponse(
            text=result["text"],
            confidence=result["confidence"],
            language=request.language,
            raw_response=result.get("raw_response"),
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")


@router.post("/video")
async def translate_video():
    """
    Translate a video clip containing sign language.

    Accepts a video file and returns translations with timestamps.
    """
    # TODO: Implement video upload and processing
    return JSONResponse(
        status_code=501,
        content={"message": "Video translation not yet implemented"},
    )


@router.websocket("/stream")
async def translate_stream(websocket: WebSocket):
    """
    WebSocket endpoint for real-time sign language translation.

    Accepts continuous video frames and returns translations in real-time.
    """
    await websocket.accept()

    try:
        while True:
            # Receive frame data
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "frame":
                image_data = message.get("data", {}).get("image")

                if not image_data:
                    await websocket.send_json({
                        "type": "error",
                        "error": "No image data provided",
                    })
                    continue

                try:
                    # Decode and process
                    decoded_image = decode_base64_image(image_data)
                    if decoded_image is None:
                        continue

                    processed_image = process_frame(decoded_image)

                    # Translate
                    result = await translate_sign_language(
                        processed_image,
                        language=message.get("data", {}).get("language", "ASL"),
                    )

                    # Send translation
                    await websocket.send_json({
                        "type": "translation",
                        "data": {
                            "text": result["text"],
                            "confidence": result["confidence"],
                        },
                    })

                except Exception as e:
                    await websocket.send_json({
                        "type": "error",
                        "error": str(e),
                    })

            elif message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close()
