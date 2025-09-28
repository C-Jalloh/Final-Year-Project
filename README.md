# 🏥 Chelal Hospital Management System

## 🚀 **ONE COMMAND TO RUN EVERYTHING**

```bash
docker-compose up -d --build
```

**That's it!** This single command will:
- Build all 7 services 
- Start the complete hospital management system
- Make it available at multiple URLs

## 📍 **Access Your System**

After running the command above (wait 1-2 minutes for startup):

| Service | URL | Purpose |
|---------|-----|---------|
| **Main App** | http://localhost | Nginx reverse proxy |
| **React Frontend** | http://localhost:3000 | Modern UI (Next.js) |
| **Vue Frontend** | http://localhost:5173 | Alternative UI (Vue) |
| **Django Backend** | http://localhost:8000 | REST API server |
| **Admin Panel** | http://localhost:8000/admin/ | Django admin |
| **API Docs** | http://localhost:8000/api/docs/ | API documentation |

## ✅ **What You Get**

- ✅ **Complete Hospital Management System**
- ✅ **Two Frontend Options** (React + Vue)
- ✅ **REST API Backend** (Django)
- ✅ **Database** (PostgreSQL)
- ✅ **Caching** (Redis)
- ✅ **Background Tasks** (Celery)
- ✅ **Load Balancer** (Nginx)

## 🛠 **Prerequisites**

- Docker Desktop or Docker Engine
- Docker Compose
- 8GB+ RAM recommended
- 10GB+ free disk space

## 📋 **Quick Commands**

```bash
# Start everything
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Reset everything (deletes data)
docker-compose down -v
```

## 🔧 **Troubleshooting**

### Port Conflicts?
```bash
# Find conflicting containers
docker ps | grep "3000\|5173\|8000\|5433\|6379\|80"

# Stop conflicting container
docker stop <container-name>
docker rm <container-name>

# Retry
docker-compose up -d --build
```

### Services Not Starting?
```bash
# Check logs for errors
docker-compose logs backend
docker-compose logs react-frontend
docker-compose logs vue-frontend

# Complete reset
docker-compose down -v
docker system prune -f
docker-compose up -d --build
```

### Health Check
```bash
# Test all endpoints
curl http://localhost:8000/api/health/  # Backend
curl http://localhost:3000             # React
curl http://localhost:5173             # Vue
curl http://localhost                  # Nginx
```

## 📚 **Documentation**

- **[📋 Quick Start](docs/ONE_COMMAND_SETUP.md)** - Detailed startup guide
- **[🚀 Deployment](docs/setup/DEPLOYMENT.md)** - Production setup
- **[🔧 Troubleshooting](docs/setup/TROUBLESHOOTING.md)** - Fix common issues
- **[📖 Full Docs](docs/README.md)** - Complete documentation
- **[🏗 Backend API](docs/backend.md)** - Comprehensive API documentation with UML diagrams
- **[🏛 System Architecture](docs/architecture.md)** - Detailed architecture diagrams
- **[🗄 Database Schema](docs/database.md)** - Complete database documentation
- **[📊 Project Status](docs/PROJECT_STATUS.md)** - Current development status

## 🏗 **System Architecture**

```
┌─────────────────┐    ┌─────────────────┐
│  React Frontend │    │  Vue Frontend   │
│   (Next.js)     │    │    (Vite)       │
│   Port 3000     │    │   Port 5173     │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────── Nginx ───────┘  (Port 80)
                      │
            ┌─────────────────┐
            │ Django Backend  │
            │   (REST API)    │
            │   Port 8000     │
            └─────────────────┘
                     │
        ┌─────────────────┐    ┌─────────────────┐
        │   PostgreSQL    │    │     Redis       │
        │   Port 5433     │    │   Port 6379     │
        └─────────────────┘    └─────────────────┘
                 │                       │
        ┌─────────────────┐              │
        │ Celery Workers  │──────────────┘
        │  (Background)   │
        └─────────────────┘
```

## 📊 **Project Status**

- ✅ **Build Status**: All services build successfully
- ✅ **Container Status**: 7/7 services ready
- ✅ **Documentation**: Complete setup guides with UML diagrams
- ✅ **One-Command Deploy**: `docker-compose up -d --build`
- ✅ **Development Ready**: Hot-reload enabled
- ✅ **Production Ready**: Nginx + health checks
- ✅ **API Endpoints**: Complete REST API with billing and role management
- ✅ **Database Schema**: Fully documented with relationships

---

## 🎯 **Getting Started**

1. **Clone this repository**
2. **Run: `docker-compose up -d --build`**
3. **Wait 1-2 minutes for startup**
4. **Visit: [http://localhost](http://localhost)**
5. **Develop and enjoy!**

**Questions?** Check the [troubleshooting guide](docs/setup/TROUBLESHOOTING.md) or [full documentation](docs/README.md).

---

## Built with ❤️

Using Docker, React, Vue, Django, PostgreSQL, Redis, and Nginx
