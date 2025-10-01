# CHELAL HMS Backend - Google Cloud Platform Deployment

This guide explains how to deploy the CHELAL HMS Django backend to Google Cloud Platform using Cloud Run.

## Prerequisites

1. **Google Cloud Account**: Sign up at [https://cloud.google.com/](https://cloud.google.com/)
2. **Google Cloud SDK**: Install from [https://cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)
3. **Project**: Create a new GCP project or use an existing one
4. **Billing**: Enable billing for your project (Cloud Run has a generous free tier)

## Quick Start

### Step 1: Run Setup Script
```bash
# Make executable and run setup
chmod +x setup-gcp.sh
./setup-gcp.sh
```

This script will:
- Check Google Cloud SDK installation
- Authenticate with Google Cloud
- Help you select/create a project
- Enable required APIs
- Verify billing status

### Step 2: Deploy
```bash
# Deploy to Cloud Run
./deploy-gcp.sh
```

## Manual Setup (Alternative)

If you prefer manual setup:

### 1. Install Google Cloud SDK
```bash
# On Linux/Mac
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Verify installation
gcloud version
```

### 2. Authenticate and Configure
```bash
# Login to Google Cloud
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 3. Deploy Using the Script
```bash
# Make the script executable
chmod +x deploy-gcp.sh

# Run the deployment
./deploy-gcp.sh
```

## Manual Deployment

If you prefer to deploy manually:

```bash
# Build and submit to Cloud Build
gcloud builds submit --config cloudbuild.yaml .

# Or build and deploy separately
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/chelal-hms-backend
gcloud run deploy chelal-hms-backend \
  --image gcr.io/YOUR_PROJECT_ID/chelal-hms-backend \
  --platform managed \
  --region us-central1 \
  --port 8080 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 1
```

## Configuration

### Environment Variables

Set these environment variables in Cloud Run:

- `DJANGO_SETTINGS_MODULE`: `Backend.settings`
- `SECRET_KEY`: Generate a secure secret key
- `DEBUG`: `False` (for production)
- `DJANGO_ALLOWED_HOSTS`: `*` (or your specific domains)
- `PORT`: `8080` (automatically set by Cloud Run)

### Database

The current setup uses a local PostgreSQL database in the container. For production, consider:

1. **Cloud SQL**: Use Google Cloud SQL for PostgreSQL
2. **External Database**: Use a managed PostgreSQL service

To use Cloud SQL, update the `DATABASE_URL` environment variable.

## File Structure

- `Dockerfile.gcp`: Optimized Dockerfile for Cloud Run
- `cloudbuild.yaml`: Cloud Build configuration
- `deploy-gcp.sh`: Automated deployment script
- `nginx-gcp.conf`: Nginx configuration for Cloud Run
- `supervisord.conf`: Process manager configuration
- `.gcloudignore`: Files to exclude from deployment

## API Endpoints

Once deployed, your API will be available at:

- **API Base**: `https://your-service-url/api`
- **Admin Panel**: `https://your-service-url/admin`
- **Health Check**: `https://your-service-url/api/health`

## Frontend Integration

Update your Vercel frontend to use the Cloud Run service URL:

```javascript
// In your frontend configuration
const API_BASE_URL = 'https://your-cloud-run-service-url/api';
```

## Monitoring and Logging

- **Logs**: View in Google Cloud Console > Cloud Run > Logs
- **Metrics**: Monitor in Google Cloud Console > Cloud Run > Metrics
- **Health Checks**: Automatic health monitoring is configured

## Scaling

Cloud Run automatically scales based on traffic:

- **Min instances**: 0 (scales to zero when no traffic)
- **Max instances**: 10 (configurable in cloudbuild.yaml)
- **Memory**: 2GB per instance
- **CPU**: 1 vCPU per instance

## Security

- **HTTPS**: Automatically enabled by Cloud Run
- **Authentication**: Configure as needed for your API
- **Secrets**: Use Google Cloud Secret Manager for sensitive data
- **VPC**: Consider VPC networking for additional security

## Troubleshooting

### Common Issues

1. **Build Failures**: Check Cloud Build logs in GCP Console
2. **Runtime Errors**: Check Cloud Run logs
3. **Database Connection**: Ensure PostgreSQL is properly configured
4. **Port Issues**: Cloud Run requires listening on the PORT environment variable

### Useful Commands

```bash
# View service details
gcloud run services describe chelal-hms-backend --region=us-central1

# View logs
gcloud logs read --filter="resource.type=cloud_run_revision AND resource.labels.service_name=chelal-hms-backend"

# Update environment variables
gcloud run services update chelal-hms-backend --set-env-vars KEY=VALUE --region=us-central1

# Redeploy
gcloud builds submit --config cloudbuild.yaml .
```

## Cost Optimization

- **Cloud Run**: Pay only for actual usage (CPU time and memory)
- **Cloud Build**: Minimal cost for builds
- **Cloud Storage**: Used for container images

## Next Steps

1. Set up a custom domain
2. Configure proper database (Cloud SQL recommended)
3. Set up monitoring and alerting
4. Implement proper authentication and authorization
5. Configure backup strategies