# Django Backend Deployment on Render

This guide will help you deploy the CHELAL HMS Django backend to Render.

## Prerequisites

1. A [Render](https://render.com) account
2. Your project pushed to GitHub

## Deployment Steps

### 1. Create a New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository: `C-Jalloh/Final-Year-Project`
4. Configure the service:
   - **Name**: `chelal-hms-backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r chelalBackend/requirements.txt`
   - **Start Command**: `cd chelalBackend && gunicorn Backend.wsgi:application --bind 0.0.0.0:$PORT`

### 2. Environment Variables

Add these environment variables in Render:

#### Required

- `DEBUG`: `False`
- `SECRET_KEY`: Generate a secure key (or use Render's auto-generated)
- `DJANGO_SETTINGS_MODULE`: `Backend.settings`
- `PYTHONPATH`: `/opt/render/project/src/chelalBackend`

#### Database (PostgreSQL)

- `DATABASE_URL`: Will be auto-configured by Render when you add PostgreSQL

#### Optional Services

- `REDIS_URL`: For caching and Celery (if using Redis)
- `EMAIL_HOST`: SMTP server for emails
- `EMAIL_HOST_USER`: SMTP username
- `EMAIL_HOST_PASSWORD`: SMTP password
- `TWILIO_ACCOUNT_SID`: For SMS notifications
- `TWILIO_AUTH_TOKEN`: Twilio auth token
- `TWILIO_PHONE_NUMBER`: Twilio phone number

### 3. Add PostgreSQL Database

1. In Render Dashboard, click "New" → "PostgreSQL"
2. Name it: `chelal-hms-db`
3. Connect it to your web service
4. The `DATABASE_URL` will be automatically added to your environment

### 4. Optional: Add Redis (for caching/Celery)

1. Click "New" → "Redis"
2. Name it: `chelal-hms-redis`
3. Connect it to your web service

### 5. Deploy

1. Click "Create Web Service"
2. Wait for the build to complete
3. Your API will be available at: `https://your-service-name.onrender.com`

## Post-Deployment Setup

### 1. Run Migrations

After deployment, you may need to run migrations manually:

```bash
# Via Render's shell or add to build command
cd chelalBackend
python manage.py migrate
```

### 2. Create Superuser

```bash
# Via Render's shell
cd chelalBackend
python manage.py createsuperuser
```

### 3. CORS Configuration

Update your CORS settings in `Backend/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-url.onrender.com",  # Update with your frontend URL
]
```

## Troubleshooting

### Common Issues

1. **Import errors**: Make sure `PYTHONPATH` is set correctly
2. **Database connection**: Check `DATABASE_URL` is properly configured
3. **Static files**: WhiteNoise should handle static files automatically
4. **Migrations**: Run manually if auto-migration fails

### Logs

Check Render logs for detailed error messages:

- Go to your service → "Logs" tab

## File Structure for Render

Make sure your repository has this structure:

```text
/
├── chelalBackend/
│   ├── Backend/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── core/
│   ├── manage.py
│   └── requirements.txt
├── render.yaml (optional)
└── README.md
```

## Security Notes

- Never commit sensitive data to GitHub
- Use Render's environment variables for secrets
- Keep `DEBUG=False` in production
- Regularly update dependencies
- Monitor logs for security issues