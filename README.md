# GestureAI

Real-time Sign Language Translation Agent powered by Gemini Live API on Google Cloud.

## Overview

GestureAI is an AI-powered live agent that bridges communication between deaf and hearing communities in real-time. Built for the **Gemini Live Agent Challenge**, it uses Gemini's multimodal Live API for bidirectional audio/vision interaction.

**Category: Live Agents** - Real-time audio/vision interaction with interruption handling.

### Features

- **Sign to Speech**: Real-time webcam translation of sign language gestures with spoken audio output via Gemini Live API
- **Speech to Sign**: Hearing users speak into the mic, and the agent provides real-time signing guidance
- **Interruption Handling**: Agent gracefully handles when users start signing mid-response
- **3D Visualization**: Interactive 3D hand models showing how each sign should look
- **Privacy First**: No data is stored - all processing happens in real-time

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Three.js |
| Backend | Python, FastAPI, MediaPipe |
| AI | Gemini 2.0 Flash, Gemini Live API (GenAI SDK) |
| Cloud | Google Cloud Run |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  Next.js 14 · TypeScript · Three.js · Tailwind · Zustand    │
│  WebRTC Camera + Microphone → WebSocket Streaming           │
└──────────────────────────┬──────────────────────────────────┘
                           │ WebSocket (bidirectional)
┌──────────────────────────▼──────────────────────────────────┐
│                 Backend (Cloud Run)                          │
│  FastAPI · MediaPipe · Live Session Manager                 │
│                                                              │
│  ┌──────────────┐  ┌─────────────────┐  ┌───────────────┐  │
│  │ REST API     │  │ Live WebSocket  │  │ Fallback WS   │  │
│  │ /translate   │  │ /live/stream    │  │ /live/fallback │  │
│  └──────┬───────┘  └──────┬──────────┘  └──────┬────────┘  │
│         │                 │                     │            │
└─────────┼─────────────────┼─────────────────────┼───────────┘
          │                 │                     │
┌─────────▼─────────────────▼─────────────────────▼───────────┐
│               Gemini API (Google Cloud)                      │
│  gemini-2.0-flash          │  gemini-2.0-flash-live-001     │
│  (Standard generation)     │  (Real-time audio/vision)      │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Gemini API Key ([Get one here](https://aistudio.google.com/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gestureai.git
   cd gestureai
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure environment variables**

   Backend (`backend/.env`):
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

   Frontend (`frontend/.env.local`):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run the development servers**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Google Cloud Deployment

### Deploy to Cloud Run

```bash
# Set required environment variables
export GCP_PROJECT_ID=your-project-id
export GEMINI_API_KEY=your-api-key

# Run the deployment script
./deploy.sh
```

Or use Cloud Build:
```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_GEMINI_API_KEY=$GEMINI_API_KEY,_BACKEND_URL=$BACKEND_URL
```

### Google Cloud Services Used

- **Cloud Run** - Serverless container hosting for both frontend and backend
- **Cloud Build** - CI/CD pipeline for building and deploying containers
- **Container Registry** - Docker image storage

## API Endpoints

### Live Agent (WebSocket)

| Endpoint | Description |
|----------|-------------|
| `/api/live/stream` | Gemini Live API real-time session (audio + vision) |
| `/api/live/stream-fallback` | Standard API fallback WebSocket |

### Translation (REST)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/translate/frame` | POST | Translate a single image frame |
| `/api/translate/stream` | WebSocket | Real-time video translation (legacy) |

### Sign Guidance

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/signs/guidance` | POST | Get signing instructions |
| `/api/signs/visual-guidance` | POST | Visual guidance with resources |
| `/api/signs/hand-pose` | POST | 3D hand pose generation |
| `/api/signs/gif` | POST | Sign demonstration media |

### Health

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check with model info |

## Gemini Integration

### Live API (Primary)
Real-time bidirectional streaming for simultaneous audio/vision processing:
- Receives video frames → identifies signs → speaks translation
- Receives audio input → processes speech → generates signing guidance
- Handles interruptions when user starts signing mid-response

### Standard API (Fallback)
Used for non-real-time features and when Live API is unavailable:
- Image analysis for sign translation
- Instructional content generation
- 3D hand pose data generation

## Project Structure

```
GestureAI/
├── frontend/                 # Next.js application
│   ├── app/                  # App router pages
│   ├── components/           # React components
│   ├── lib/                  # Utilities and store
│   ├── Dockerfile            # Frontend container
│   └── next.config.js        # Next.js config (standalone)
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── routers/          # API endpoints (translate, signs, live)
│   │   ├── services/         # Business logic (gemini, live_session, video)
│   │   └── models/           # Pydantic schemas
│   ├── Dockerfile            # Backend container (Cloud Run)
│   └── requirements.txt
├── cloudbuild.yaml           # Google Cloud Build config
├── deploy.sh                 # Deployment script
└── README.md
```

## License

MIT License

## Acknowledgments

- Google Cloud for Gemini API and Cloud Run
- MediaPipe team for hand detection models
- The deaf and hard-of-hearing community for inspiration

---

Built for the Gemini Live Agent Challenge 2026
