# 🏥 Chelal HMS - Complete Docker Setup

A complete Hospital Management System with React frontend, Vue.js frontend, and Django backend, all bundled in Docker containers for easy deployment.

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed
- Docker Compose (comes with Docker Desktop)
- At least 4GB RAM available
- Ports 3000, 5173, 8000, 5433, 6379, and 80 should be free

### One-Command Setup
```bash
./start-chelal-hms.sh
```

## 📋 What's Included

### Services
- **React Frontend** (Next.js) - Port 3000
- **Vue Frontend** (Vite) - Port 5173  
- **Django Backend** (REST API) - Port 8000
- **PostgreSQL Database** - Port 5433
- **Redis** (Celery broker) - Port 6379
- **Celery Worker** (Background tasks)
- **Nginx** (Reverse proxy) - Port 80

### Features
- 🔄 Hot reloading for both frontends
- 🗄️ Automatic database migrations
- 📊 Django admin interface
- 🔧 Background task processing
- 🌐 Reverse proxy routing
- 💾 Persistent data storage

## 🔧 Manual Setup

### 1. Clone and Navigate
```bash
cd "/home/c_jalloh/Documents/School/Second Semester/ITCA Week/code"
```

### 2. Start All Services
```bash
docker-compose up --build
```

### 3. Run Initial Setup
```bash
# Database migrations
docker-compose exec backend python manage.py migrate

# Create superuser (optional)
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic
```

## 🌐 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| React App | http://localhost:3000 | Main frontend application |
| Vue App | http://localhost:5173 | Alternative frontend |
| Django API | http://localhost:8000 | Backend REST API |
| Django Admin | http://localhost:8000/admin | Admin interface |
| Nginx Proxy | http://localhost:80 | Production routing |

## 📁 Project Structure

```
chelal-hms/
├── docker-compose.yml          # Main orchestration file
├── nginx.conf                  # Nginx configuration
├── start-chelal-hms.sh        # Quick start script
├── cleanup-chelal-hms.sh      # Cleanup script
├── chelal-hms-react/          # React frontend
│   ├── Dockerfile
│   └── ... (React files)
├── chelal-hms-vue/            # Vue frontend  
│   ├── Dockerfile
│   └── ... (Vue files)
└── chelalBackend/             # Django backend
    ├── Dockerfile
    └── ... (Django files)
```

## 🛠️ Development Commands

### Container Management
```bash
# View all services status
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f react-frontend
docker-compose logs -f vue-frontend

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### Backend Commands
```bash
# Django shell
docker-compose exec backend python manage.py shell

# Create migrations
docker-compose exec backend python manage.py makemigrations

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic

# Run tests
docker-compose exec backend python manage.py test
```

### Frontend Commands
```bash
# Access React container shell
docker-compose exec react-frontend sh

# Access Vue container shell  
docker-compose exec vue-frontend sh

# Install new packages (React)
docker-compose exec react-frontend npm install package-name

# Install new packages (Vue)
docker-compose exec vue-frontend npm install package-name
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env in chelalBackend/)
```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgres://chelal_user:chelal_password@db:5432/chelal_db
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### React (.env.local in chelal-hms-react/)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

#### Vue (.env in chelal-hms-vue/)
```env
VITE_API_URL=http://localhost:8000
VITE_BACKEND_URL=http://localhost:8000
```

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :3000
lsof -i :8000

# Kill process
kill -9 <PID>
```

#### Database Connection Issues
```bash
# Check database status
docker-compose logs db

# Restart database
docker-compose restart db

# Reset database (⚠️ deletes data)
docker-compose down -v
docker-compose up -d db
```

#### Frontend Not Loading
```bash
# Check frontend logs
docker-compose logs react-frontend
docker-compose logs vue-frontend

# Rebuild frontend
docker-compose up --build react-frontend
docker-compose up --build vue-frontend
```

#### Backend API Issues
```bash
# Check backend logs
docker-compose logs backend

# Check migrations
docker-compose exec backend python manage.py showmigrations

# Run migrations
docker-compose exec backend python manage.py migrate
```

### Performance Issues
```bash
# Check resource usage
docker stats

# Cleanup unused images/containers
docker system prune -f

# Restart Docker Desktop if needed
```

## 🧹 Cleanup

### Quick Cleanup
```bash
./cleanup-chelal-hms.sh
```

### Manual Cleanup
```bash
# Stop services
docker-compose down

# Remove with volumes (⚠️ deletes all data)
docker-compose down -v

# Clean up Docker system
docker system prune -f

# Remove all project images
docker rmi $(docker images "chelal*" -q)
```

## 📈 Production Deployment

For production deployment:

1. Change environment variables to production values
2. Set `DEBUG=False` in Django settings
3. Configure proper domain names
4. Set up SSL certificates
5. Use production-ready database
6. Configure proper logging

## 🤝 Contributing

1. Make changes to individual services
2. Test locally with Docker
3. Ensure all services start properly
4. Update documentation if needed

## 📞 Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify all ports are available
3. Ensure Docker has enough resources
4. Try rebuilding: `docker-compose up --build`

---

**Happy coding! 🚀**
