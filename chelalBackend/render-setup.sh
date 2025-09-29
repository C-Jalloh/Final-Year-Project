#!/bin/bash
# Render Initial Setup Script
# This script helps set up the CHELAL HMS backend after deployment

echo "=== CHELAL HMS Backend Initial Setup ==="
echo "Setting up initial data for production deployment..."
echo ""

# Change to the backend directory
cd chelalBackend || exit 1

# Run migrations
echo "Running database migrations..."
python manage.py migrate

# Create initial roles
echo "Creating initial user roles..."
python manage.py shell -c "
from core.models import Role
roles = ['admin', 'doctor', 'nurse', 'patient', 'receptionist']
for role_name in roles:
    Role.objects.get_or_create(name=role_name)
    print(f'Created role: {role_name}')
"

# Create superuser if it doesn't exist
echo "Checking for superuser..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    print('No superuser found. Please create one manually:')
    print('python manage.py createsuperuser')
else:
    print('Superuser already exists.')
"

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

echo ""
echo "=== Setup Complete ==="
echo "Your CHELAL HMS backend is ready!"
echo ""
echo "Next steps:"
echo "1. Create a superuser if not already done: python manage.py createsuperuser"
echo "2. Access your API at: https://your-service-name.onrender.com"
echo "3. Update CORS settings with your frontend URL"
echo "4. Test the API endpoints"