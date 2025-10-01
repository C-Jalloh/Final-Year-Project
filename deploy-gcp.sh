#!/bin/bash
# Google Cloud Platform Deployment Script for CHELAL HMS Backend

echo "🚀 Deploying CHELAL HMS Backend to Google Cloud Platform..."
echo "=========================================================="

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n 1 > /dev/null; then
    echo "❌ You are not logged in to gcloud. Please run:"
    echo "   gcloud auth login"
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ No project set. Please set your project:"
    echo "   gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "✅ Using project: $PROJECT_ID"

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com --quiet
if [ $? -ne 0 ]; then
    echo "❌ Failed to enable Cloud Build API. Please check your permissions."
    exit 1
fi

gcloud services enable run.googleapis.com --quiet
if [ $? -ne 0 ]; then
    echo "❌ Failed to enable Cloud Run API. Please check your permissions."
    exit 1
fi

gcloud services enable containerregistry.googleapis.com --quiet
if [ $? -ne 0 ]; then
    echo "❌ Failed to enable Container Registry API. Please check your permissions."
    exit 1
fi

echo "✅ APIs enabled successfully"

# Build and deploy using Cloud Build
echo "🏗️ Building and deploying to Cloud Run..."
gcloud builds submit --config cloudbuild.yaml .

# Get the service URL
SERVICE_URL=$(gcloud run services describe chelal-hms-backend --region=us-central1 --format="value(status.url)")

if [ -n "$SERVICE_URL" ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Service URL: $SERVICE_URL"
    echo "📡 API available at: $SERVICE_URL/api"
    echo "👨‍💼 Admin panel at: $SERVICE_URL/admin"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Update your frontend to use: $SERVICE_URL/api"
    echo "   2. Set up a custom domain if needed"
    echo "   3. Configure environment variables in Cloud Run"
    echo "   4. Set up database backups and monitoring"
else
    echo "❌ Deployment may have failed. Check the logs above."
fi