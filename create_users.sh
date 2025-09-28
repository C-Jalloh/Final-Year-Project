#!/bin/bash

# Script to create default users for Chelal HMS
# This script creates Admin, Pharmacist, and Nurse users

echo "=== CHELAL HMS USER CREATION SCRIPT ==="
echo "Creating default users for the healthcare management system..."
echo ""

# Check if Docker container is running
if ! docker ps | grep -q brikama-general-hospital-backend-1; then
    echo "❌ Error: Docker container 'brikama-general-hospital-backend-1' is not running"
    echo "Please start the containers first with: docker-compose up -d"
    exit 1
fi

# Copy the Python script to the container
echo "📋 Copying user creation script to container..."
docker cp /home/c_jalloh/Documents/School/Second\ Semester/ITCA\ Week/code/create_admin.py brikama-general-hospital-backend-1:/app/create_admin.py

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to copy script to container"
    exit 1
fi

# Run the user creation script
echo "👤 Creating users..."
docker exec -e REDIS_URL=redis://redis:6379/1 brikama-general-hospital-backend-1 python /app/create_admin.py

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ User creation completed successfully!"
    echo ""
    echo "📋 Created Users:"
    echo "   Admin:     cjalloh / cjalloh25"
    echo "   Pharmacist: pharmacist / pharm123"
    echo "   Nurse:      nurse / nurse123"
    echo ""
    echo "🔐 Use these credentials to log into the system"
    echo "🌐 API endpoints are available at: http://localhost:8000/api/"
else
    echo "❌ Error: User creation failed"
    exit 1
fi
