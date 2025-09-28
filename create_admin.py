#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append('/home/c_jalloh/Documents/School/Second Semester/ITCA Week/code/chelalBackend')

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')

# Setup Django
django.setup()

from django.contrib.auth import get_user_model
from core.models import Role

User = get_user_model()

def create_admin_user():
    print("=== CREATING ADMIN USER ===")

    # Check if admin role exists, create if not
    admin_role, created = Role.objects.get_or_create(
        name='Admin',
        defaults={'description': 'System Administrator with full access'}
    )
    if created:
        print("Created Admin role")
    else:
        print("Admin role already exists")

    # Check if user already exists
    if User.objects.filter(username='cjalloh').exists():
        print("User 'cjalloh' already exists!")
        user = User.objects.get(username='cjalloh')
        print(f"User details: {user.username}, Email: {user.email}, Staff: {user.is_staff}, Super: {user.is_superuser}")
        return

    # Create the admin user
    user = User.objects.create_user(
        username='cjalloh',
        email='cjalloh@admin.com',  # You can change this
        password='cjalloh25',
        first_name='Admin',
        last_name='User',
        is_staff=True,
        is_superuser=True
    )

    # Assign admin role
    user.role = admin_role
    user.save()

    print("✅ Admin user created successfully!")
    print(f"Username: {user.username}")
    print(f"Email: {user.email}")
    print(f"Password: cjalloh25")
    print(f"Is Staff: {user.is_staff}")
    print(f"Is Superuser: {user.is_superuser}")
    print(f"Role: {user.role.name if user.role else 'None'}")

def create_pharmacist_user():
    print("\n=== CREATING PHARMACIST USER ===")

    # Check if pharmacist role exists, create if not
    pharmacist_role, created = Role.objects.get_or_create(
        name='Pharmacist',
        defaults={'description': 'Pharmacy staff responsible for medication dispensing and inventory'}
    )
    if created:
        print("Created Pharmacist role")
    else:
        print("Pharmacist role already exists")

    # Check if user already exists
    if User.objects.filter(username='pharmacist').exists():
        print("User 'pharmacist' already exists!")
        user = User.objects.get(username='pharmacist')
        print(f"User details: {user.username}, Email: {user.email}, Role: {user.role.name if user.role else 'None'}")
        return

    # Create the pharmacist user
    user = User.objects.create_user(
        username='pharmacist',
        email='pharmacist@chelal.com',
        password='pharm123',
        first_name='John',
        last_name='Pharmacist',
        is_staff=True,
        is_superuser=False
    )

    # Assign pharmacist role
    user.role = pharmacist_role
    user.save()

    print("✅ Pharmacist user created successfully!")
    print(f"Username: {user.username}")
    print(f"Email: {user.email}")
    print(f"Password: pharm123")
    print(f"Role: {user.role.name if user.role else 'None'}")

def create_nurse_user():
    print("\n=== CREATING NURSE USER ===")

    # Check if nurse role exists, create if not
    nurse_role, created = Role.objects.get_or_create(
        name='Nurse',
        defaults={'description': 'Nursing staff responsible for patient care and vital monitoring'}
    )
    if created:
        print("Created Nurse role")
    else:
        print("Nurse role already exists")

    # Check if user already exists
    if User.objects.filter(username='nurse').exists():
        print("User 'nurse' already exists!")
        user = User.objects.get(username='nurse')
        print(f"User details: {user.username}, Email: {user.email}, Role: {user.role.name if user.role else 'None'}")
        return

    # Create the nurse user
    user = User.objects.create_user(
        username='nurse',
        email='nurse@chelal.com',
        password='nurse123',
        first_name='Jane',
        last_name='Nurse',
        is_staff=True,
        is_superuser=False
    )

    # Assign nurse role
    user.role = nurse_role
    user.save()

    print("✅ Nurse user created successfully!")
    print(f"Username: {user.username}")
    print(f"Email: {user.email}")
    print(f"Password: nurse123")
    print(f"Role: {user.role.name if user.role else 'None'}")

if __name__ == "__main__":
    try:
        create_admin_user()
        create_pharmacist_user()
        create_nurse_user()
        print("\n🎉 All users created successfully!")
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Make sure the database is running and Django is properly configured.")
