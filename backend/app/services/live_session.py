"""
Gemini Live API session manager for real-time audio/vision interaction.
Handles bidirectional streaming with interruption support.
"""

import asyncio
import base64
import json
from typing import Optional, Callable, Any
from google import genai
from google.genai import types

from app.config import get_settings


class LiveSession:
    """Manages a Gemini Live API session for real-time sign language translation."""

    def __init__(self, on_audio: Optional[Callable] = None, on_text: Optional[Callable] = None):
        self.on_audio = on_audio
        self.on_text = on_text
        self._session = None
        self._client = None
        self._active = False
        self._interrupted = False

    async def start(self):
        """Start a new Live API session."""
        settings = get_settings()
        self._client = genai.Client(api_key=settings.gemini_api_key)

        config = types.LiveConnectConfig(
            response_modalities=["AUDIO", "TEXT"],
            system_instruction=types.Content(
                parts=[types.Part(text="""You are GestureAI, a real-time sign language interpreter AI agent.

Your role:
1. When you receive video frames showing sign language gestures, translate them to spoken English.
2. When you receive audio/speech, provide guidance on how to sign that in ASL.
3. Speak naturally and clearly - your audio output will be played to deaf/hearing users.
4. Handle interruptions gracefully - if a user starts signing while you're speaking, stop and process the new sign.
5. Be concise in real-time mode. Say the translation clearly, then briefly explain the sign if helpful.
6. If you can't identify a sign, say so honestly rather than guessing.

You are bridging communication between deaf and hearing communities in real-time.""")]
            ),
        )

        self._session = await self._client.aio.live.connect(
            model=settings.gemini_live_model,
            config=config,
        )
        self._active = True

    async def send_frame(self, image_base64: str):
        """Send a video frame to the Live API session."""
        if not self._session or not self._active:
            return

        # Remove data URL prefix if present
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]

        image_bytes = base64.b64decode(image_base64)

        await self._session.send(
            input=types.LiveClientRealtimeInput(
                media_chunks=[
                    types.Blob(data=image_bytes, mime_type="image/jpeg")
                ]
            )
        )

    async def send_audio(self, audio_base64: str, mime_type: str = "audio/pcm;rate=16000"):
        """Send audio data to the Live API session."""
        if not self._session or not self._active:
            return

        audio_bytes = base64.b64decode(audio_base64)

        await self._session.send(
            input=types.LiveClientRealtimeInput(
                media_chunks=[
                    types.Blob(data=audio_bytes, mime_type=mime_type)
                ]
            )
        )

    async def send_text(self, text: str):
        """Send a text message to the Live API session."""
        if not self._session or not self._active:
            return

        await self._session.send(
            input=text,
            end_of_turn=True,
        )

    def interrupt(self):
        """Signal an interruption (user started signing while agent is speaking)."""
        self._interrupted = True

    async def receive_responses(self):
        """Generator that yields responses from the Live API session."""
        if not self._session:
            return

        try:
            async for response in self._session.receive():
                if not self._active:
                    break

                # Handle server content (audio/text responses)
                if response.server_content:
                    content = response.server_content

                    # Check if the model was interrupted
                    if content.interrupted:
                        self._interrupted = False
                        if self.on_text:
                            await self.on_text({"type": "interrupted", "data": {}})
                        continue

                    if content.model_turn and content.model_turn.parts:
                        for part in content.model_turn.parts:
                            if part.text:
                                if self.on_text:
                                    await self.on_text({
                                        "type": "translation",
                                        "data": {"text": part.text}
                                    })
                            elif part.inline_data:
                                if self.on_audio:
                                    audio_b64 = base64.b64encode(part.inline_data.data).decode("utf-8")
                                    await self.on_audio({
                                        "type": "audio",
                                        "data": {
                                            "audio": audio_b64,
                                            "mime_type": part.inline_data.mime_type,
                                        }
                                    })

                    # Turn complete signal
                    if content.turn_complete:
                        if self.on_text:
                            await self.on_text({"type": "turn_complete", "data": {}})

        except Exception as e:
            if self.on_text:
                await self.on_text({"type": "error", "data": {"error": str(e)}})

    async def close(self):
        """Close the Live API session."""
        self._active = False
        if self._session:
            await self._session.close()
            self._session = None
