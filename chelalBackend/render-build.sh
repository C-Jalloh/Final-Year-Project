#!/bin/bash
# Render build script for Django backend

set -e

echo "Starting Render build process..."

# Install system dependencies if needed
# apt-get update && apt-get install -y libpq-dev gcc

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

# Create superuser if needed (optional)
# echo "Creating superuser..."
# python manage.py createsuperuser --noinput --username admin --email admin@example.com || true

echo "Build completed successfully!"