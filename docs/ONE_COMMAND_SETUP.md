# 🏃‍♂️ ONE-COMMAND STARTUP

Run the entire Chelal Hospital Management System with a single command:

```bash
docker-compose up -d --build
```

## What This Command Does

1. **Builds all Docker images** (if not already built)
2. **Starts PostgreSQL database** (port 5433)
3. **Starts Redis cache** (port 6379)  
4. **Launches Django backend** (port 8000)
5. **Starts Celery workers** (background tasks)
6. **Runs React frontend** (port 3000)
7. **Runs Vue frontend** (port 5173)
8. **Configures Nginx proxy** (port 80)

## Verify Everything is Running

```bash
# Check all containers are up
docker-compose ps

# Should show 7 services running:
# code-db-1, code-redis-1, code-backend-1, 
# code-celery-1, code-react-frontend-1, 
# code-vue-frontend-1, code-nginx-1
```

## Access Your Application

After startup (30-60 seconds), visit:

- **🌐 Main Application**: <http://localhost>
- **⚛️ React Frontend**: <http://localhost:3000>
- **🖼️ Vue Frontend**: <http://localhost:5173>
- **🐍 Django Backend**: <http://localhost:8000>
- **⚙️ Admin Panel**: <http://localhost:8000/admin/>

## Common Issues & Quick Fixes

### Port Already in Use

```bash
# If you get "port already allocated" errors:
docker ps -a | grep "5433\|6379\|3000\|8000\|80"
docker stop <container-name>
docker rm <container-name>

# Then retry:
docker-compose up -d --build
```

### Services Not Starting

```bash
# View logs to see what's wrong:
docker-compose logs -f

# Or check specific service:
docker-compose logs backend
docker-compose logs react-frontend
```

### Complete Reset

```bash
# Nuclear option - reset everything:
docker-compose down -v
docker system prune -f
docker-compose up -d --build
```

## Development Workflow

```bash
# Make code changes, then:
docker-compose build <service-name>    # Rebuild specific service
docker-compose restart <service-name>  # Restart service
docker-compose logs -f <service-name>  # View logs
```

## Stop Everything

```bash
# Stop all services (keeps data):
docker-compose down

# Stop and remove volumes (deletes data):
docker-compose down -v
```

---

**That's it!** One command gets you a complete hospital management system with multiple frontends, REST API, database, caching, and background workers.

For detailed setup instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).
