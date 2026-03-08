"""
Live Agent router - Real-time audio/vision interaction via Gemini Live API.
Handles WebSocket connections for bidirectional streaming with interruption support.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import asyncio

from app.services.live_session import LiveSession
from app.services.gemini import translate_speech_to_sign_guidance

router = APIRouter()


@router.websocket("/stream")
async def live_stream(websocket: WebSocket):
    """
    WebSocket endpoint for Gemini Live API real-time interaction.

    Supports:
    - Video frames (sign language → speech/text)
    - Audio input (speech → sign guidance)
    - Text input (text → sign guidance)
    - Interruption handling (user can interrupt agent mid-response)

    Message types from client:
    - {"type": "frame", "data": {"image": "base64..."}}
    - {"type": "audio", "data": {"audio": "base64...", "mime_type": "audio/pcm;rate=16000"}}
    - {"type": "text", "data": {"text": "hello"}}
    - {"type": "interrupt"}
    - {"type": "ping"}
    """
    await websocket.accept()

    session = None

    async def send_to_client(message: dict):
        """Send a message back to the WebSocket client."""
        try:
            await websocket.send_json(message)
        except Exception:
            pass

    try:
        # Initialize Live API session
        session = LiveSession(
            on_audio=send_to_client,
            on_text=send_to_client,
        )
        await session.start()

        # Start receiving responses in background
        receive_task = asyncio.create_task(session.receive_responses())

        await websocket.send_json({
            "type": "session_started",
            "data": {"message": "Live agent session ready"},
        })

        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            msg_type = message.get("type")

            if msg_type == "frame":
                # Video frame - sign language to translate
                image_data = message.get("data", {}).get("image")
                if image_data:
                    await session.send_frame(image_data)

            elif msg_type == "audio":
                # Audio input - speech to process
                audio_data = message.get("data", {}).get("audio")
                mime_type = message.get("data", {}).get("mime_type", "audio/pcm;rate=16000")
                if audio_data:
                    await session.send_audio(audio_data, mime_type)

            elif msg_type == "text":
                # Text input - convert to sign guidance
                text = message.get("data", {}).get("text")
                if text:
                    await session.send_text(f"How do you sign this in ASL: {text}")

            elif msg_type == "interrupt":
                # User is interrupting (e.g., started signing while agent speaks)
                session.interrupt()
                await websocket.send_json({
                    "type": "interrupt_ack",
                    "data": {"message": "Interruption acknowledged"},
                })

            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        print("Live session client disconnected")
    except Exception as e:
        print(f"Live session error: {e}")
        try:
            await websocket.send_json({
                "type": "error",
                "data": {"error": str(e)},
            })
        except Exception:
            pass
    finally:
        if session:
            await session.close()


@router.websocket("/stream-fallback")
async def live_stream_fallback(websocket: WebSocket):
    """
    Fallback WebSocket endpoint using standard Gemini API (non-Live).
    Used when Live API is unavailable or for simpler interactions.

    Same message format as /stream but uses REST-based translation.
    """
    await websocket.accept()

    try:
        from app.services.gemini import translate_sign_language, translate_speech_to_sign_guidance
        from app.services.video import decode_base64_image, process_frame

        await websocket.send_json({
            "type": "session_started",
            "data": {"message": "Fallback session ready (standard API)"},
        })

        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            msg_type = message.get("type")

            if msg_type == "frame":
                image_data = message.get("data", {}).get("image")
                if not image_data:
                    continue

                try:
                    decoded_image = decode_base64_image(image_data)
                    if decoded_image is None:
                        continue

                    processed_image = process_frame(decoded_image)
                    result = await translate_sign_language(
                        processed_image,
                        language=message.get("data", {}).get("language", "ASL"),
                    )

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
                        "data": {"error": str(e)},
                    })

            elif msg_type == "text":
                text = message.get("data", {}).get("text")
                if text:
                    try:
                        result = await translate_speech_to_sign_guidance(text)
                        await websocket.send_json({
                            "type": "sign_guidance",
                            "data": result,
                        })
                    except Exception as e:
                        await websocket.send_json({
                            "type": "error",
                            "data": {"error": str(e)},
                        })

            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        print("Fallback session client disconnected")
    except Exception as e:
        print(f"Fallback session error: {e}")
        await websocket.close()
