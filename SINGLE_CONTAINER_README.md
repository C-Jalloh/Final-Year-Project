# CHELAL HMS Single Container Deployment

Run your entire CHELAL HMS application in a single Docker container!

## 🚀 Quick Start

```bash
# Make script executable
chmod +x run-single.sh

# Run the application
./run-single.sh
```

Or manually:

```bash
# Build and run
docker-compose -f docker-compose.single.yml up --build

# Run in background
docker-compose -f docker-compose.single.yml up -d --build
```

## 📋 What's Included

### ✅ Services Running in Container:
- **PostgreSQL Database** - Data storage
- **Redis** - Caching (in-memory)
- **Django Backend** - API server with Gunicorn
- **React Frontend** - Built and served by Nginx
- **Nginx** - Reverse proxy and static file server

### ✅ Ports Exposed:
- **Port 80** - Main application (React frontend + API)

## 🌐 Access Your Application

After starting the container:

- **Main Application**: `http://localhost`
- **API Endpoints**: `http://localhost/api/`
- **Admin Panel**: `http://localhost/admin/`
- **Health Check**: `http://localhost/api/health/`

### Default Admin Credentials:
- **Username**: admin
- **Password**: admin123
- **Email**: admin@chelal-hms.local

## 📁 File Structure

```
CHELAL HMS Single Container/
├── Dockerfile.single          # Single container Dockerfile
├── docker-compose.single.yml  # Docker Compose for single container
├── supervisord.conf          # Process manager config
├── nginx-single.conf         # Nginx config for single container
├── run-single.sh            # Quick start script
└── [your existing code]     # Django backend, React frontend, etc.
```

## 🔧 Development Mode

For development with hot reload:

```bash
# Run in development mode (mounts source code)
docker-compose -f docker-compose.single.yml up --build

# Access development URLs
# Frontend dev server: http://localhost:3000 (if configured)
# Backend API: http://localhost/api
```

## 🛠️ Troubleshooting

### Container Won't Start:
```bash
# Check logs
docker-compose -f docker-compose.single.yml logs

# Check container status
docker ps -a

# Clean rebuild
docker-compose -f docker-compose.single.yml down
docker system prune -f
docker-compose -f docker-compose.single.yml up --build
```

### Database Issues:
```bash
# Access container shell
docker exec -it chelal-hms_chelal-hms_1 bash

# Check PostgreSQL
su postgres
psql -d chelal_db
```

### Permission Issues:
```bash
# Fix permissions
sudo chown -R $USER:$USER .
```

## 📊 Resource Usage

### Recommended System Requirements:
- **RAM**: 2GB minimum, 4GB recommended
- **CPU**: 1 core minimum, 2 cores recommended
- **Storage**: 5GB free space

### Container Resources:
- **PostgreSQL**: ~200MB RAM
- **Redis**: ~50MB RAM
- **Django + Gunicorn**: ~300MB RAM
- **React Build**: ~100MB storage
- **Total**: ~550MB RAM, ~2GB storage

## 🔒 Security Notes

⚠️ **This single-container setup is for development/demo purposes only!**

For production, use:
- Separate containers for each service
- Proper networking and secrets management
- External database and Redis instances
- SSL/TLS certificates
- Regular security updates

## 🚀 Production Deployment

For production, consider:

1. **Multi-container deployment** (original docker-compose.yml)
2. **Kubernetes** or **Docker Swarm**
3. **Cloud hosting** (AWS, GCP, Azure)
4. **Load balancers** and **CDN**

## 📞 Support

### Check Service Status:
```bash
# Inside container
supervisorctl status
```

### View Logs:
```bash
# Container logs
docker-compose -f docker-compose.single.yml logs -f

# Service-specific logs
docker-compose -f docker-compose.single.yml logs django-backend
docker-compose -f docker-compose.single.yml logs nginx
```

### Health Check:
```bash
curl http://localhost/api/health/
```

---

**Happy deploying! 🎉**

Your CHELAL HMS is now containerized and ready to run anywhere Docker is available!