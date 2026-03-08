#!/bin/bash
# GestureAI - Google Cloud Deployment Script (Cost-Optimized)
# Deploys backend and frontend to Cloud Run with minimal cost settings

set -euo pipefail

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:?Set GCP_PROJECT_ID environment variable}"
REGION="${GCP_REGION:-us-central1}"
GEMINI_API_KEY="${GEMINI_API_KEY:?Set GEMINI_API_KEY environment variable}"

echo "=== GestureAI Cloud Deployment (Cost-Optimized) ==="
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Set project
gcloud config set project "$PROJECT_ID"

# Enable required APIs
echo "Enabling Google Cloud APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  --project="$PROJECT_ID"

# Create Artifact Registry repo if not exists (free tier, replaces deprecated gcr.io)
echo "Setting up Artifact Registry..."
gcloud artifacts repositories create gestureai \
  --repository-format=docker \
  --location="$REGION" \
  --project="$PROJECT_ID" 2>/dev/null || echo "Repository already exists"

AR_REPO="$REGION-docker.pkg.dev/$PROJECT_ID/gestureai"

# Deploy Backend
echo ""
echo "=== Building Backend ==="
cd backend
gcloud builds submit \
  --tag "$AR_REPO/backend" \
  --project="$PROJECT_ID" \
  --region="$REGION"

echo "=== Deploying Backend ==="
gcloud run deploy gestureai-backend \
  --image "$AR_REPO/backend" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=$GEMINI_API_KEY" \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --min-instances 0 \
  --max-instances 2 \
  --concurrency 80 \
  --cpu-throttling \
  --project="$PROJECT_ID"

BACKEND_URL=$(gcloud run services describe gestureai-backend \
  --region "$REGION" \
  --project="$PROJECT_ID" \
  --format="value(status.url)")

echo "Backend deployed at: $BACKEND_URL"

# Update backend CORS with the backend URL
gcloud run services update gestureai-backend \
  --region "$REGION" \
  --platform managed \
  --update-env-vars "CORS_ORIGINS=$BACKEND_URL" \
  --project="$PROJECT_ID"

cd ..

# Deploy Frontend
echo ""
echo "=== Building Frontend ==="
cd frontend
gcloud builds submit \
  --tag "$AR_REPO/frontend" \
  --project="$PROJECT_ID" \
  --region="$REGION"

echo "=== Deploying Frontend ==="
gcloud run deploy gestureai-frontend \
  --image "$AR_REPO/frontend" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_API_URL=$BACKEND_URL" \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 2 \
  --concurrency 80 \
  --cpu-throttling \
  --project="$PROJECT_ID"

FRONTEND_URL=$(gcloud run services describe gestureai-frontend \
  --region "$REGION" \
  --project="$PROJECT_ID" \
  --format="value(status.url)")

# Update backend CORS to include frontend URL
echo ""
echo "=== Updating Backend CORS ==="
gcloud run services update gestureai-backend \
  --region "$REGION" \
  --platform managed \
  --update-env-vars "CORS_ORIGINS=$FRONTEND_URL,$BACKEND_URL" \
  --project="$PROJECT_ID"

echo ""
echo "========================================="
echo "  GestureAI Deployment Complete!"
echo "========================================="
echo ""
echo "  Frontend: $FRONTEND_URL"
echo "  Backend:  $BACKEND_URL"
echo ""
echo "  Cost: Scale-to-zero enabled"
echo "  Max instances: 2 (minimal)"
echo "  CPU throttled when idle"
echo "========================================="
