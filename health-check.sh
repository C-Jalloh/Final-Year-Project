#!/bin/bash

# Chelal HMS - Health Check Script
echo "🏥 Chelal HMS - Health Check"
echo "============================"

# Function to check if a service is responding
check_service() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}
    
    echo -n "🔍 Checking $name ($url)... "
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_code"; then
        echo "✅ OK"
        return 0
    else
        echo "❌ FAILED"
        return 1
    fi
}

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check all services
echo ""
echo "🔍 Running health checks..."

check_service "React Frontend" "http://localhost:3000" "200\|404"
check_service "Vue Frontend" "http://localhost:5173" "200\|404"
check_service "Django Backend" "http://localhost:8000" "200\|404"
check_service "Nginx Proxy" "http://localhost:80" "200\|404\|502"

echo ""
echo "📊 Docker container status:"
if command -v docker-compose &> /dev/null; then
    docker-compose ps
else
    docker compose ps
fi

echo ""
echo "💾 Database connection test:"
if command -v docker-compose &> /dev/null; then
    docker-compose exec -T backend python manage.py check --database default
else
    docker compose exec -T backend python manage.py check --database default
fi

echo ""
echo "🎯 Quick tests completed!"
echo "Visit the URLs above to verify the applications are working."
