#!/bin/bash
# Single Container CHELAL HMS Runner

echo "🚀 Starting CHELAL HMS Single Container..."
echo "=========================================="

# Build and run the container
docker-compose -f docker-compose.single.yml up --build

echo "CHELAL HMS is running at: http://localhost"
echo "API available at: http://localhost/api"
echo "Admin panel at: http://localhost/admin"
echo "Frontend hosted separately on Vercel"