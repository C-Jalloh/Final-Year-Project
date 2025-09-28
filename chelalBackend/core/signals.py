from django.db.models.signals import post_save, post_delete
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver
from django.forms.models import model_to_dict
from django.utils import timezone
from django.conf import settings
from datetime import date, time
from decimal import Decimal

from .models import AuditLog, Patient, Prescription, User, Appointment, Bill, Payment

@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    AuditLog.objects.create(
        user=user,
        action="login",
        description=f'User {user.username} logged in.'
    )

@receiver(user_logged_out)
def log_user_logout(sender, request, user, **kwargs):
    if user:
        AuditLog.objects.create(
            user=user,
            action="logout",
            description=f'User {user.username} logged out.'
        )

@receiver(post_save, sender=Patient)
@receiver(post_save, sender=Prescription)
@receiver(post_save, sender=Appointment)
@receiver(post_save, sender=Bill)
@receiver(post_save, sender=Payment)
def log_model_save(sender, instance, created, **kwargs):
    action = "create" if created else "edit"
    description = f'{sender.__name__} {action}d: {instance}'
    details = model_to_dict(instance)

    # Convert date objects to strings for JSON serialization
    for key, value in details.items():
        if isinstance(value, timezone.datetime):
            details[key] = value.isoformat()
        elif isinstance(value, date):
            details[key] = value.strftime('%Y-%m-%d')
        elif isinstance(value, time):
            details[key] = value.strftime('%H:%M:%S')
        elif isinstance(value, Decimal):
            details[key] = str(value)  # Convert Decimal to string for JSON serialization
        # Fix: Convert FieldFile (e.g., profile_image, result_file) to string path or None, but only if file exists
        elif hasattr(value, 'name'):
            details[key] = str(value.name) if value and value.name else None

    # Attempt to get the user from kwargs or request context if available
    user = kwargs.get('user', None)

    AuditLog.objects.create(
        user=user,
        action=action,
        object_type=sender.__name__,
        object_id=instance.pk,
        description=description,
        details=details
    )

@receiver(post_delete, sender=Patient)
@receiver(post_delete, sender=Prescription)
@receiver(post_delete, sender=Appointment)
@receiver(post_delete, sender=Bill)
@receiver(post_delete, sender=Payment)
def log_model_delete(sender, instance, **kwargs):
    AuditLog.objects.create(
        user=None,  # No user context for deletions
        action="delete",
        object_type=sender.__name__,
        object_id=instance.pk,
        description=f'{sender.__name__} deleted: {instance}'
    )
