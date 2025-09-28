# Quick Start Guide - Chelal HMS

## One Command Setup

To run the entire Chelal Hospital Management System with one command:

```bash
# Navigate to project root and start all services
cd /path/to/your/project && docker-compose up -d --build
```

This command will:
- Build all Docker images (React frontend, Vue frontend, Django backend, Celery)
- Start PostgreSQL database and Redis
- Launch all services in background mode
- Set up Nginx reverse proxy

## System Architecture

The system consists of:
- **React Frontend** (Next.js) - Port 3000
- **Vue Frontend** (Vite) - Port 5173  
- **Django Backend** (REST API) - Port 8000
- **PostgreSQL Database** - Port 5433
- **Redis** (Caching/Celery) - Port 6379
- **Nginx Reverse Proxy** - Port 80
- **Celery Workers** (Background tasks)

## Prerequisites

- Docker and Docker Compose installed
- Git (for cloning)
- 8GB+ RAM recommended

## Complete Setup Process

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd chelal-hms
```

### 2. Environment Setup
```bash
# Copy environment template (if exists)
cp .env.example .env

# Edit environment variables as needed
nano .env
```

### 3. Start All Services
```bash
# Build and start everything
docker-compose up -d --build

# View logs (optional)
docker-compose logs -f
```

### 4. Verify Services
```bash
# Check all containers are running
docker-compose ps

# Test endpoints
curl http://localhost:8000/api/health/    # Backend
curl http://localhost:3000               # React frontend
curl http://localhost:5173               # Vue frontend
curl http://localhost                    # Nginx proxy
```

## Service URLs

After successful startup:
- **Main Application**: http://localhost (Nginx)
- **React Frontend**: http://localhost:3000
- **Vue Frontend**: http://localhost:5173
- **Django Admin**: http://localhost:8000/admin/
- **API Documentation**: http://localhost:8000/api/docs/
- **Database**: localhost:5433 (PostgreSQL)

## Common Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# View logs
docker-compose logs -f [service-name]

# Execute commands in containers
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

## Troubleshooting

### Port Conflicts
If you get "port already in use" errors:

```bash
# Find and stop conflicting containers
docker ps | grep <port>
docker stop <container-name>

# Or change ports in docker-compose.yml
```

### Container Build Failures
```bash
# Clean rebuild
docker-compose down
docker system prune -f
docker-compose up -d --build
```

### Database Issues
```bash
# Reset database
docker-compose down -v
docker-compose up -d
```

## Development Workflow

1. **Make code changes** in your editor
2. **Rebuild specific service**: `docker-compose build <service-name>`
3. **Restart service**: `docker-compose restart <service-name>`
4. **View logs**: `docker-compose logs -f <service-name>`

## Production Deployment

For production, update:
- Environment variables (DEBUG=False, etc.)
- Database credentials
- Redis configuration
- Nginx SSL certificates
- Domain names in configuration

## Support

- Check logs: `docker-compose logs -f`
- Restart services: `docker-compose restart`
- Full reset: `docker-compose down -v && docker-compose up -d --build`
