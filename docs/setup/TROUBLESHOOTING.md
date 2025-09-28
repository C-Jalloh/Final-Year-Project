# 🔧 Port Configuration & Troubleshooting

## Default Port Mapping

| Service | Internal Port | External Port | Purpose |
|---------|---------------|---------------|---------|
| PostgreSQL | 5432 | 5433 | Database |
| Redis | 6379 | 6379 | Cache/Queue |
| Django Backend | 8000 | 8000 | REST API |
| React Frontend | 3000 | 3000 | Next.js Dev |
| Vue Frontend | 5173 | 5173 | Vite Dev |
| Nginx Proxy | 80 | 80 | Load Balancer |
| Celery | N/A | N/A | Background Tasks |

## Port Conflict Resolution

### Quick Fix Script

```bash
#!/bin/bash
# save as fix_ports.sh

echo "🔍 Checking for port conflicts..."

# Check each port and offer to stop conflicting containers
PORTS=(5433 6379 8000 3000 5173 80)

for port in "${PORTS[@]}"; do
    echo "Checking port $port..."
    CONFLICT=$(docker ps --format '{{.Names}}\t{{.Ports}}' | grep ":$port")
    
    if [ ! -z "$CONFLICT" ]; then
        echo "⚠️  Port $port conflict found:"
        echo "$CONFLICT"
        read -p "Stop conflicting container? [y/N]: " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            CONTAINER=$(echo "$CONFLICT" | cut -f1)
            docker stop "$CONTAINER" && docker rm "$CONTAINER"
            echo "✅ Stopped $CONTAINER"
        fi
    else
        echo "✅ Port $port is free"
    fi
done

echo "🚀 Ready to run: docker-compose up -d --build"
```

### Manual Port Conflict Resolution

```bash
# Find what's using each port
sudo lsof -i :5433  # PostgreSQL
sudo lsof -i :6379  # Redis  
sudo lsof -i :8000  # Django
sudo lsof -i :3000  # React
sudo lsof -i :5173  # Vue
sudo lsof -i :80    # Nginx

# Stop specific Docker containers
docker ps | grep "5433\|6379\|8000\|3000\|5173\|80"
docker stop <container-name>
docker rm <container-name>
```

### Alternative Port Configuration

If you need to use different ports, edit `docker-compose.yml`:

```yaml
services:
  db:
    ports:
      - "5434:5432"  # Change external port to 5434
  
  redis:
    ports:
      - "6380:6379"  # Change external port to 6380
  
  backend:
    ports:
      - "8001:8000"  # Change external port to 8001
  
  react-frontend:
    ports:
      - "3001:3000"  # Change external port to 3001
  
  vue-frontend:
    ports:
      - "5174:5173"  # Change external port to 5174
  
  nginx:
    ports:
      - "8080:80"    # Change external port to 8080
```

## System Resource Requirements

### Minimum Requirements

- **RAM**: 4GB available
- **CPU**: 2 cores
- **Disk**: 10GB free space
- **Docker**: 20.10.0+
- **Docker Compose**: 2.0.0+

### Recommended Requirements

- **RAM**: 8GB+ available
- **CPU**: 4+ cores
- **Disk**: 20GB+ free space
- **SSD**: Recommended for database

### Check Current Resources

```bash
# Check Docker resources
docker system df
docker system info

# Check available memory
free -h

# Check disk space
df -h

# Monitor resource usage during startup
docker stats
```

## Network Troubleshooting

### Container Communication Issues

```bash
# Check Docker network
docker network ls
docker network inspect code_chelal-network

# Test container connectivity
docker-compose exec backend ping db
docker-compose exec backend ping redis
```

### DNS Resolution

```bash
# Test internal DNS
docker-compose exec backend nslookup db
docker-compose exec backend nslookup redis

# Test external connectivity
docker-compose exec backend ping google.com
```

## Service Health Checks

### Automated Health Check Script

```bash
#!/bin/bash
# save as health_check.sh

echo "🏥 Chelal HMS Health Check"
echo "=========================="

# Function to check HTTP endpoint
check_http() {
    local url=$1
    local service=$2
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$status" = "200" ] || [ "$status" = "302" ]; then
        echo "✅ $service: OK ($status)"
    else
        echo "❌ $service: FAILED ($status)"
    fi
}

# Function to check TCP port
check_tcp() {
    local host=$1
    local port=$2
    local service=$3
    
    if nc -z "$host" "$port" 2>/dev/null; then
        echo "✅ $service: OK"
    else
        echo "❌ $service: FAILED"
    fi
}

# Check all services
check_tcp localhost 5433 "PostgreSQL"
check_tcp localhost 6379 "Redis"
check_http "http://localhost:8000/api/health/" "Django Backend"
check_http "http://localhost:3000" "React Frontend"
check_http "http://localhost:5173" "Vue Frontend"
check_http "http://localhost" "Nginx Proxy"

# Check container status
echo ""
echo "📦 Container Status:"
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# Check resource usage
echo ""
echo "💾 Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
```

### Manual Health Checks

```bash
# Check containers are running
docker-compose ps

# Test database connection
docker-compose exec backend python manage.py dbshell -c "SELECT 1;"

# Test Redis connection
docker-compose exec redis redis-cli ping

# Test API endpoints
curl http://localhost:8000/api/health/
curl http://localhost:8000/admin/
curl http://localhost:3000
curl http://localhost:5173
curl http://localhost
```

## Performance Optimization

### Database Performance

```bash
# Check database performance
docker-compose exec db psql -U chelal_user -d chelal_hms -c "
SELECT schemaname,tablename,attname,n_distinct,correlation 
FROM pg_stats 
WHERE schemaname = 'public' 
ORDER BY n_distinct DESC;"
```

### Container Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.5'
  
  react-frontend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

### Log Management

```bash
# Limit log size
docker-compose down
# Add to docker-compose.yml:
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"

# Clean old logs
docker system prune -f
```

## Emergency Procedures

### Complete System Reset

```bash
#!/bin/bash
echo "🚨 EMERGENCY RESET - This will delete ALL data!"
read -p "Are you sure? Type 'YES' to continue: " confirm

if [ "$confirm" = "YES" ]; then
    echo "Stopping all containers..."
    docker-compose down -v
    
    echo "Removing images..."
    docker rmi $(docker images -q code-*)
    
    echo "Cleaning system..."
    docker system prune -af
    
    echo "Rebuilding everything..."
    docker-compose up -d --build
    
    echo "✅ Reset complete!"
else
    echo "❌ Reset cancelled"
fi
```

### Backup Before Reset

```bash
# Backup database
docker-compose exec db pg_dump -U chelal_user chelal_hms > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup volumes
docker run --rm -v code_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup_$(date +%Y%m%d_%H%M%S).tar.gz /data
```

---

**Need more help?** Check the main [DEPLOYMENT.md](DEPLOYMENT.md) guide or [QUICK_START.md](QUICK_START.md).
