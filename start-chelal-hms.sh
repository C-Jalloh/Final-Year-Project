#!/bin/bash

# Chelal HMS - Docker Setup Script
# This script sets up and runs all services in Docker containers

echo "🏥 Chelal HMS - Docker Multi-Service Setup"
echo "=========================================="

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker-compose down 2>/dev/null || docker compose down 2>/dev/null || true

# Create .env file for backend if it doesn't exist
if [ ! -f "chelalBackend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cat > chelalBackend/.env << EOF
DEBUG=True
SECRET_KEY=your-secret-key-here-$(date +%s)
DATABASE_URL=postgres://chelal_user:chelal_password@db:5432/chelal_db
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_NAME=chelal_db
DATABASE_USER=chelal_user
DATABASE_PASSWORD=chelal_password
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend,0.0.0.0
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173,http://localhost:80
EOF
fi

# Create .env.local file for React frontend if it doesn't exist
if [ ! -f "chelal-hms-react/.env.local" ]; then
    echo "📝 Creating React frontend .env.local file..."
    cat > chelal-hms-react/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
EOF
fi

# Create .env file for Vue frontend if it doesn't exist
if [ ! -f "chelal-hms-vue/.env" ]; then
    echo "📝 Creating Vue frontend .env file..."
    cat > chelal-hms-vue/.env << EOF
VITE_API_URL=http://localhost:8000
VITE_BACKEND_URL=http://localhost:8000
EOF
fi

echo "🔧 Building and starting all services..."
echo "This may take a few minutes on first run..."

# Build and start all services
if command -v docker-compose &> /dev/null; then
    docker-compose up --build -d
else
    docker compose up --build -d
fi

echo "⏳ Waiting for services to start..."
sleep 45

# Check if backend is running
if docker-compose ps backend | grep -q "Up" || docker compose ps backend | grep -q "running"; then
    echo "🗄️  Running database migrations..."
    if command -v docker-compose &> /dev/null; then
        docker-compose exec backend python manage.py migrate --noinput
    else
        docker compose exec backend python manage.py migrate --noinput
    fi
    
    echo "� Collecting static files..."
    if command -v docker-compose &> /dev/null; then
        docker-compose exec backend python manage.py collectstatic --noinput || echo "Static files collection skipped"
    else
        docker compose exec backend python manage.py collectstatic --noinput || echo "Static files collection skipped"
    fi
else
    echo "⚠️  Backend service may not be running properly. Check logs with: docker-compose logs backend"
fi

echo ""
echo "🎉 Chelal HMS is now running!"
echo "=========================================="
echo "📱 React Frontend:    http://localhost:3000"
echo "🖥️  Vue Frontend:     http://localhost:5173"
echo "🔧 Django Backend:    http://localhost:8000"
echo "📊 Django Admin:      http://localhost:8000/admin"
echo "🌐 Nginx Proxy:       http://localhost:80"
echo "🗄️  PostgreSQL:       localhost:5433"
echo "🔴 Redis:             localhost:6379"
echo ""
echo "📋 Service Status:"
if command -v docker-compose &> /dev/null; then
    docker-compose ps
else
    docker compose ps
fi

echo ""
echo "📝 Useful Commands:"
echo "  • View logs:           docker-compose logs -f"
echo "  • Stop services:       docker-compose down"
echo "  • Restart services:    docker-compose restart"
echo "  • Shell into backend:  docker-compose exec backend bash"
echo "  • Shell into React:    docker-compose exec react-frontend sh"
echo "  • Shell into Vue:      docker-compose exec vue-frontend sh"
echo "  • Django shell:        docker-compose exec backend python manage.py shell"
echo "  • Django migrations:   docker-compose exec backend python manage.py makemigrations"
echo ""
echo "🔍 Quick Health Check:"
echo "  • Backend API:         curl http://localhost:8000/"
echo "  • React Frontend:      curl http://localhost:3000/"
echo "  • Vue Frontend:        curl http://localhost:5173/"
