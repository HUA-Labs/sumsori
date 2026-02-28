#!/bin/bash
set -euo pipefail

# ── Sumsori → Cloud Run Deploy ──
# Usage: ./scripts/deploy-gcp.sh

# Config — edit these
PROJECT_ID="${GCP_PROJECT_ID:?Set GCP_PROJECT_ID env var}"
REGION="${GCP_REGION:-asia-northeast3}"  # Seoul
SERVICE_NAME="sumsori"
IMAGE="asia-northeast3-docker.pkg.dev/${PROJECT_ID}/sumsori/${SERVICE_NAME}"

echo "🚀 Deploying Sumsori to Cloud Run"
echo "   Project:  ${PROJECT_ID}"
echo "   Region:   ${REGION}"
echo "   Service:  ${SERVICE_NAME}"
echo ""

# 1. Create Artifact Registry repo (idempotent)
echo "📦 Ensuring Artifact Registry repo exists..."
gcloud artifacts repositories create sumsori \
  --repository-format=docker \
  --location="${REGION}" \
  --project="${PROJECT_ID}" 2>/dev/null || true

# 2. Configure Docker auth
echo "🔐 Configuring Docker auth..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# 3. Build & push image
echo "🏗️  Building Docker image..."
docker build -t "${IMAGE}:latest" .

echo "📤 Pushing image..."
docker push "${IMAGE}:latest"

# 4. Deploy to Cloud Run
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image="${IMAGE}:latest" \
  --platform=managed \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --allow-unauthenticated \
  --port=8080 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=3 \
  --set-env-vars="NODE_ENV=production"

echo ""
echo "✅ Done! Service URL:"
gcloud run services describe "${SERVICE_NAME}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --format="value(status.url)"
