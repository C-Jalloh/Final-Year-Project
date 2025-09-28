# Deployment Guide - Chelal HMS

## Complete Deployment Instructions

### Single Command Deployment

```bash
# Clone, build, and start the entire system
git clone <repository-url> && cd chelal-hms && docker-compose up -d --build
```

## Manual Step-by-Step Deployment

### Prerequisites Check

```bash
# Verify Docker installation
docker --version
docker-compose --version

# Ensure sufficient resources
docker system df
```

### 1. Project Setup

```bash
# Clone repository
git clone <repository-url>
cd chelal-hms

# Create environment file
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` file with your settings:

```env
# Database Configuration
POSTGRES_DB=chelal_hms
POSTGRES_USER=chelal_user
POSTGRES_PASSWORD=secure_password
DATABASE_URL=postgresql://chelal_user:secure_password@db:5432/chelal_hms

# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Redis Configuration
REDIS_URL=redis://redis:6379/1

# API Keys (Optional)
GOOGLE_CALENDAR_API_KEY=your-google-api-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

### 3. Build and Deploy

```bash
# Build all services
docker-compose build

# Start infrastructure services first
docker-compose up -d db redis

# Wait for database to be ready
sleep 10

# Run database migrations
docker-compose exec backend python manage.py migrate

# Create superuser (optional)
docker-compose exec backend python manage.py createsuperuser

# Start all services
docker-compose up -d
```

### 4. Verify Deployment

```bash
# Check container status
docker-compose ps

# Verify service health
curl -f http://localhost:8000/api/health/ || echo "Backend not ready"
curl -f http://localhost:3000 || echo "React frontend not ready"
curl -f http://localhost:5173 || echo "Vue frontend not ready"
curl -f http://localhost || echo "Nginx not ready"
```

## Service Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  React Frontend │    │  Vue Frontend   │    │     Nginx       │
│   (Port 3000)   │    │   (Port 5173)   │    │   (Port 80)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Django Backend  │
                    │   (Port 8000)   │
                    └─────────────────┘
                             │
                    ┌─────────────────┐    ┌─────────────────┐
                    │   PostgreSQL    │    │     Redis       │
                    │   (Port 5433)   │    │   (Port 6379)   │
                    └─────────────────┘    └─────────────────┘
                             │                       │
                    ┌─────────────────┐              │
                    │ Celery Workers  │──────────────┘
                    │ (Background)    │
                    └─────────────────┘
```

## Production Deployment

### Security Configuration

```bash
# Generate secure secret key
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Update production environment
cat > .env.production << EOF
DEBUG=False
SECRET_KEY=<generated-secret-key>
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:password@db:5432/chelal_hms
REDIS_URL=redis://redis:6379/1
EOF
```

### SSL Certificate Setup

```bash
# Add SSL certificates to nginx/certs/
mkdir -p nginx/certs
# Copy your SSL certificates here

# Update nginx configuration for HTTPS
# Edit nginx/nginx.conf to include SSL settings
```

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    environment:
      - DEBUG=False
    env_file:
      - .env.production

  nginx:
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/certs:/etc/nginx/certs:ro
```

## Monitoring and Maintenance

### Health Checks

```bash
# Create monitoring script
cat > health_check.sh << 'EOF'
#!/bin/bash
echo "=== Chelal HMS Health Check ==="
echo "Backend API: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/health/)"
echo "React Frontend: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)"
echo "Vue Frontend: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)"
echo "Nginx Proxy: $(curl -s -o /dev/null -w "%{http_code}" http://localhost)"
echo "Database: $(docker-compose exec -T db pg_isready -U chelal_user)"
echo "Redis: $(docker-compose exec -T redis redis-cli ping)"
EOF

chmod +x health_check.sh
```

### Backup Scripts

```bash
# Database backup
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T db pg_dump -U chelal_user chelal_hms > $BACKUP_DIR/database.sql

# Backup media files
docker-compose exec -T backend tar -czf - /app/media > $BACKUP_DIR/media.tar.gz

echo "Backup completed: $BACKUP_DIR"
EOF

chmod +x backup.sh
```

### Log Management

```bash
# View live logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f react-frontend
docker-compose logs -f vue-frontend

# Log rotation (add to crontab)
echo "0 2 * * * docker system prune -f" | crontab -
```

## Troubleshooting

### Common Issues

**Port Conflicts:**
```bash
# Find conflicting processes
sudo lsof -i :80 :3000 :5173 :8000 :5433 :6379

# Stop conflicting Docker containers
docker stop $(docker ps -q --filter "publish=80" --filter "publish=3000")
```

**Database Connection Issues:**
```bash
# Reset database
docker-compose down -v
docker-compose up -d db
sleep 10
docker-compose exec backend python manage.py migrate
```

**Build Failures:**
```bash
# Clean Docker cache
docker system prune -af
docker-compose build --no-cache
```

### Performance Optimization

```bash
# Increase Docker resources in Docker Desktop
# Recommended: 4+ CPU cores, 8+ GB RAM

# Monitor resource usage
docker stats
```

## Rollback Procedure

```bash
# Stop current deployment
docker-compose down

# Restore from backup
./restore.sh /backups/20241201

# Start with previous configuration
git checkout HEAD~1
docker-compose up -d --build
```
