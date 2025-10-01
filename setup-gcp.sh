#!/bin/bash
# Google Cloud Platform Setup Script for CHELAL HMS

echo "🔧 Setting up Google Cloud Platform for CHELAL HMS..."
echo "======================================================"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed."
    echo ""
    echo "📦 Please install Google Cloud SDK first:"
    echo "   Linux/Mac: curl https://sdk.cloud.google.com | bash"
    echo "   Windows: Download from https://cloud.google.com/sdk/docs/install"
    echo ""
    echo "   Then restart your terminal and run this script again."
    exit 1
fi

echo "✅ Google Cloud SDK found"

# Check if user is logged in
echo ""
echo "🔐 Checking authentication..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n 1 > /dev/null; then
    echo "❌ You are not logged in to Google Cloud."
    echo ""
    echo "🌐 Opening browser for authentication..."
    gcloud auth login

    if [ $? -ne 0 ]; then
        echo "❌ Authentication failed. Please try again."
        exit 1
    fi
fi

echo "✅ Authentication successful"

# List available projects
echo ""
echo "📋 Available projects:"
gcloud projects list --format="table(project_id, name, project_number)"

echo ""
echo "🔍 Enter your Google Cloud Project ID:"
echo "(Choose from the list above, or create a new one)"
read -p "Project ID: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Project ID cannot be empty."
    exit 1
fi

# Validate project exists
echo ""
echo "🔍 Validating project..."
if ! gcloud projects describe "$PROJECT_ID" &> /dev/null; then
    echo "❌ Project '$PROJECT_ID' not found."
    echo ""
    echo "💡 To create a new project:"
    echo "   1. Go to https://console.cloud.google.com/"
    echo "   2. Click 'Create Project'"
    echo "   3. Enter project name and ID"
    echo "   4. Run this script again"
    exit 1
fi

# Set the project
echo "✅ Setting project to: $PROJECT_ID"
gcloud config set project "$PROJECT_ID"

# Enable billing check
echo ""
echo "💳 Checking billing status..."
BILLING_ENABLED=$(gcloud billing projects describe "$PROJECT_ID" --format="value(billingEnabled)" 2>/dev/null)

if [ "$BILLING_ENABLED" != "true" ]; then
    echo "⚠️  Billing is not enabled for this project."
    echo ""
    echo "💡 To enable billing:"
    echo "   1. Go to https://console.cloud.google.com/billing"
    echo "   2. Link a billing account to your project"
    echo "   3. Run this script again"
    echo ""
    echo "   Note: Cloud Run has a generous free tier, but billing is required for production use."
else
    echo "✅ Billing is enabled"
fi

# Enable required APIs
echo ""
echo "🔧 Enabling required APIs..."
echo "   This may take a few minutes..."

gcloud services enable cloudbuild.googleapis.com --quiet
if [ $? -ne 0 ]; then
    echo "❌ Failed to enable Cloud Build API"
    exit 1
fi

gcloud services enable run.googleapis.com --quiet
if [ $? -ne 0 ]; then
    echo "❌ Failed to enable Cloud Run API"
    exit 1
fi

gcloud services enable containerregistry.googleapis.com --quiet
if [ $? -ne 0 ]; then
    echo "❌ Failed to enable Container Registry API"
    exit 1
fi

echo "✅ All required APIs enabled"

# Verify setup
echo ""
echo "🎯 Setup verification:"
echo "   Project: $(gcloud config get-value project)"
echo "   Account: $(gcloud auth list --filter=status:ACTIVE --format="value(account)")"
echo "   Cloud Build: $(gcloud services list --enabled --filter="name:cloudbuild.googleapis.com" --format="value(name)" | wc -l) API(s)"
echo "   Cloud Run: $(gcloud services list --enabled --filter="name:run.googleapis.com" --format="value(name)" | wc -l) API(s)"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 Ready to deploy CHELAL HMS backend:"
echo "   Run: ./deploy-gcp.sh"
echo ""
echo "📚 For manual deployment:"
echo "   gcloud builds submit --config cloudbuild.yaml ."