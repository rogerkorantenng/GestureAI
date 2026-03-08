# GestureAI

> A real-time AI live agent that bridges communication between deaf and hearing communities — using voice, vision, and sign language simultaneously.

---

## The Problem

466 million people worldwide have disabling hearing loss. For the 70+ million who use sign language daily, every interaction with the hearing world becomes a negotiation — writing notes, relying on interpreters, or simply going without.

Professional interpreters cost $50-150/hour and require advance booking. Real-time communication? Nearly impossible without one.

We asked: *What if a Gemini-powered live agent could be that interpreter?*

---

## What GestureAI Does

GestureAI is a **live agent** that provides real-time, bidirectional translation between sign language and spoken language — going beyond text-in/text-out to deliver a truly multimodal experience.

**Sign → Speech:** Point your webcam at someone signing ASL. GestureAI's live agent interprets their gestures in real-time and **speaks the translation aloud** through your speakers.

**Speech → Sign:** A hearing person speaks into the microphone. The agent instantly provides step-by-step signing guidance so a deaf person can understand what was said.

**Interruption Handling:** Start signing while the agent is speaking — it stops immediately, processes your new sign, and responds. Just like a real interpreter.

**Learn:** Type any word. Get visual instructions for signing it — hand shapes, palm orientation, movement patterns, facial expressions — plus 3D hand visualization.

No accounts. No data stored. Just communication.

---

## How Gemini Powers GestureAI

### Gemini Live API — Real-Time Agent

The core of GestureAI is a Gemini Live API session that handles bidirectional audio and vision streaming simultaneously:

```python
from google import genai
from google.genai import types

client = genai.Client(api_key=api_key)

config = types.LiveConnectConfig(
    response_modalities=["AUDIO", "TEXT"],
    system_instruction=types.Content(
        parts=[types.Part(text="""You are GestureAI, a real-time
        sign language interpreter AI agent. Translate signs to
        speech and handle interruptions gracefully.""")]
    ),
)

session = await client.aio.live.connect(
    model="gemini-2.0-flash-live-001",
    config=config,
)
```

The agent receives video frames showing sign language, processes them through Gemini's vision understanding, and responds with both text and audio — enabling deaf users to communicate with hearing people in real-time.

### Multimodal Vision for Translation

When a user signs in front of their webcam, we stream frames to the Live API session. Gemini analyzes hand shapes, positions, movements, and facial expressions (grammatically important in ASL) to identify signs and speak the translation.

### Instructional Content Generation

For the learning side, Gemini generates pedagogically-sound signing instructions with hand shape descriptions, palm orientation, movement trajectories, and required facial grammar.

### 3D Pose Data Generation

Gemini generates precise finger curl, spread, and wrist rotation values for our Three.js hand visualization — dynamic 3D hands that show exactly how each sign should look.

**Gemini Features Utilized:**
- Live API for real-time bidirectional audio/vision streaming
- Multimodal image analysis (vision + language)
- Audio response generation (text-to-speech)
- Interruption handling (graceful mid-response stops)
- Zero-shot visual recognition
- Structured JSON generation

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Cloud Run)                     │
│  Next.js 14 · TypeScript · Three.js · Tailwind · Zustand   │
│  WebRTC Camera + Microphone → WebSocket Streaming           │
└──────────────────────────┬──────────────────────────────────┘
                           │ WebSocket (bidirectional)
┌──────────────────────────▼──────────────────────────────────┐
│                  Backend (Cloud Run)                         │
│  FastAPI · MediaPipe · Live Session Manager                 │
│                                                              │
│  ┌──────────────┐  ┌─────────────────┐  ┌───────────────┐  │
│  │ REST API     │  │ Live WebSocket  │  │ Fallback WS   │  │
│  │ /translate   │  │ /live/stream    │  │ /live/fallback │  │
│  └──────┬───────┘  └──────┬──────────┘  └──────┬────────┘  │
└─────────┼─────────────────┼─────────────────────┼───────────┘
          │                 │                     │
┌─────────▼─────────────────▼─────────────────────▼───────────┐
│               Gemini API (Google Cloud)                      │
│  gemini-2.5-flash          │  gemini-2.0-flash-live-001     │
│  (Standard generation)     │  (Real-time audio/vision)      │
└─────────────────────────────────────────────────────────────┘
```

**Frontend Stack:**
- Next.js 14 with App Router
- React Three Fiber for 3D hand visualization
- WebRTC for camera + microphone capture
- Web Audio API for playing Gemini's audio responses
- Zustand for persistent state

**Backend Stack:**
- FastAPI with async endpoints and WebSocket support
- Google GenAI SDK for Gemini API integration
- Live Session Manager for Gemini Live API connections
- MediaPipe for hand landmark preprocessing
- Graceful fallback to standard API when Live API is unavailable

**Google Cloud Infrastructure:**
- Cloud Run (serverless containers, scale-to-zero, cost-optimized)
- Cloud Build (CI/CD pipeline)
- Artifact Registry (Docker image storage)

---

## Challenges & Solutions

**Challenge:** Real-time bidirectional communication requires simultaneous audio output and vision input.

**Solution:** Gemini Live API handles both modalities in a single streaming session. The agent receives video frames and responds with audio — no separate TTS service needed.

---

**Challenge:** Users might start signing while the agent is still speaking a previous translation.

**Solution:** Built-in interruption handling — when the agent detects new input mid-response, it stops speaking and processes the new sign. The frontend sends explicit interrupt signals and the Live API supports graceful interruption.

---

**Challenge:** Live API might be unavailable or rate-limited.

**Solution:** Automatic fallback to standard Gemini API via a separate WebSocket endpoint. The frontend detects connection failures and switches seamlessly.

---

**Challenge:** Latency kills real-time translation.

**Solution:** Image preprocessing (resize, JPEG compression), 3-second capture intervals, async processing, and Cloud Run's auto-scaling keep translations feeling instant.

---

## Impact

**Accessibility:** A deaf person can communicate in real-time with hearing people — the agent speaks their signs aloud and shows them what others are saying.

**Education:** Anyone can learn to sign without expensive classes. Type a phrase, see exactly how to sign it, practice with 3D visualization.

**Privacy:** GestureAI stores nothing. Every frame is processed and discarded. Your conversations stay yours.

**Cost:** Free and open source vs. $50-150/hour for human interpreters.

---

## What's Next

1. **More Sign Languages** — BSL, LSF, JSL with different grammar and vocabulary
2. **Continuous Signing** — Sentence-level understanding beyond isolated signs
3. **Mobile Native** — iOS and Android for true portability
4. **AR Integration** — Overlay translations in real-world view via AR glasses

---

## Built With

`Gemini 2.5 Flash` `Gemini Live API` `Google GenAI SDK` `Google Cloud Run` `Cloud Build` `Artifact Registry` `Next.js` `FastAPI` `TypeScript` `Python` `Three.js` `MediaPipe` `OpenCV` `Tailwind CSS` `Docker`

---

## Links

- **Live Demo:** https://gestureai-frontend-95953931159.us-central1.run.app
- **Backend API:** https://gestureai-backend-95953931159.us-central1.run.app
- **Source Code:** [GitHub repository URL]
- **Demo Video:** [YouTube/Vimeo link]

---

*GestureAI — Because communication is a right, not a privilege.*
