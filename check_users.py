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

from django.contrib.auth.models import User
from core.models import Role

def check_users():
    print("=== CHECKING USERS IN DATABASE ===")

    # Check total users
    users = User.objects.all()
    print(f"Total users: {users.count()}")

    if users.count() > 0:
        print("\nExisting users:")
        for user in users:
            print(f"  Username: {user.username}")
            print(f"  Email: {user.email}")
            print(f"  Is Staff: {user.is_staff}")
            print(f"  Is Superuser: {user.is_superuser}")
            if user.role:
                print(f"  Role: {user.role.name}")
            print("  ---")
    else:
        print("No users found in database.")

    # Check roles
    print("\n=== CHECKING ROLES ===")
    roles = Role.objects.all()
    print(f"Total roles: {roles.count()}")

    if roles.count() > 0:
        print("Existing roles:")
        for role in roles:
            print(f"  {role.name}: {role.description}")
    else:
        print("No roles found in database.")

if __name__ == "__main__":
    try:
        check_users()
    except Exception as e:
        print(f"Error: {e}")
        print("Make sure the database is running and accessible.")
