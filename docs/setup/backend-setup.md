# Backend Setup Guide

## Prerequisites

### System Requirements

- **Python**: 3.10 or 3.11 (3.12+ not recommended for Django 4.2)
- **PostgreSQL**: 15+
- **Redis**: 6+
- **Git**: 2.30+
- **Node.js**: 18+ (for frontend development)

### Hardware Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **CPU**: 2 cores minimum, 4 cores recommended
- **Storage**: 10GB free space
- **Network**: Stable internet connection

## Installation Steps

### 1. Clone Repository

```bash
git clone <repository-url>
cd chelalBackend
```

### 2. Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Database Setup

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
```

```sql
CREATE DATABASE chelal_db;
CREATE USER chelal_user WITH PASSWORD 'chelal_password';
GRANT ALL PRIVILEGES ON DATABASE chelal_db TO chelal_user;
\q
```

#### Option B: Docker PostgreSQL

```bash
# Start PostgreSQL container
docker run --name chelal-postgres \
  -e POSTGRES_DB=chelal_db \
  -e POSTGRES_USER=chelal_user \
  -e POSTGRES_PASSWORD=chelal_password \
  -p 5432:5432 \
  -d postgres:15

# Start Redis container
docker run --name chelal-redis \
  -p 6379:6379 \
  -d redis:6
```

### 5. Environment Configuration

Create `.env` file in the project root:

```bash
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=chelal_db
DATABASE_USER=chelal_user
DATABASE_PASSWORD=chelal_password

# Django Configuration
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Twilio Configuration (optional)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
```

### 6. Database Migration

```bash
# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### 7. Load Initial Data (Optional)

```bash
# Load sample data
python manage.py loaddata initial_data.json
```

### 8. Start Development Server

```bash
# Start Django development server
python manage.py runserver

# In another terminal, start Celery worker
celery -A Backend worker --loglevel=info

# Start Celery beat scheduler
celery -A Backend beat --loglevel=info
```

The backend will be available at `http://localhost:8000`

## Docker Setup (Alternative)

### Using Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: chelal_db
      POSTGRES_USER: chelal_user
      POSTGRES_PASSWORD: chelal_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"

  backend:
    build: .
    environment:
      - DATABASE_HOST=db
      - REDIS_HOST=redis
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis
    volumes:
      - .:/app
    command: python manage.py runserver 0.0.0.0:8000

volumes:
  postgres_data:
```

```bash
# Build and start services
docker-compose up --build

# Run migrations in container
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

## Configuration Details

### Django Settings

#### Security Settings

```python
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

# HTTPS settings
SECURE_SSL_REDIRECT = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
```

#### Database Configuration

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DATABASE_NAME'),
        'USER': os.environ.get('DATABASE_USER'),
        'PASSWORD': os.environ.get('DATABASE_PASSWORD'),
        'HOST': os.environ.get('DATABASE_HOST', 'localhost'),
        'PORT': os.environ.get('DATABASE_PORT', '5432'),
        'OPTIONS': {
            'connect_timeout': 10,
        }
    }
}
```

#### Cache Configuration

```python
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': f"redis://{REDIS_HOST}:{REDIS_PORT}/1",
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
```

### Celery Configuration

```python
# celery.py
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')

app = Celery('Backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# celerybeat_schedule.py
from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    'send-appointment-reminders': {
        'task': 'core.tasks.send_appointment_reminders',
        'schedule': crontab(hour=9, minute=0),  # Daily at 9 AM
    },
    'cleanup-old-notifications': {
        'task': 'core.tasks.cleanup_old_notifications',
        'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
    },
}
```

## Testing

### Run Tests

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test core

# Run with coverage
coverage run manage.py test
coverage report
```

### Test Configuration

```python
# Use test database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}
```

## Troubleshooting

### Common Issues

#### Database Connection Error

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database connectivity
python manage.py dbshell
```

#### Redis Connection Error

```bash
# Check Redis status
redis-cli ping

# Start Redis service
sudo systemctl start redis
```

#### Migration Errors

```bash
# Show migration status
python manage.py showmigrations

# Revert problematic migration
python manage.py migrate core 0001

# Reapply migrations
python manage.py migrate
```

#### Static Files Issues

```bash
# Collect static files
python manage.py collectstatic --noinput
```

### Logs

```bash
# View Django logs
tail -f logs/django.log

# View Celery logs
tail -f logs/celery.log
```

## Production Deployment

### Gunicorn Configuration

```bash
# Install Gunicorn
pip install gunicorn

# Start with Gunicorn
gunicorn Backend.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /path/to/static/files/;
    }
}
```

### SSL Configuration

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## Backup and Recovery

### Database Backup

```bash
# Create backup
pg_dump -U chelal_user -h localhost chelal_db > backup.sql

# Restore backup
psql -U chelal_user -h localhost chelal_db < backup.sql
```

### Automated Backup Script

```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/chelal_db_$DATE.sql"

pg_dump -U chelal_user -h localhost chelal_db > $BACKUP_FILE

# Keep only last 7 days
find $BACKUP_DIR -name "chelal_db_*.sql" -mtime +7 -delete
```

## Monitoring

### Health Checks

```python
# views.py
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({'status': 'healthy'})

def database_health_check(request):
    from django.db import connection
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        return JsonResponse({'database': 'healthy'})
    except:
        return JsonResponse({'database': 'unhealthy'}, status=500)
```

### Logging Configuration

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'logs/django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```
