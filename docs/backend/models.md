# Backend Models Documentation

## Overview

The Chelal HMS backend uses Django ORM with PostgreSQL. The core app contains all the main data models for the hospital management system.

## Core Models

### User Model (Custom AbstractUser)

```python
class User(AbstractUser):
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)
    language_preference = models.CharField(max_length=10, default='en')
    preferences = models.JSONField(default=dict, blank=True, null=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=64, blank=True, null=True)
```

**Fields:**
- `role`: Foreign key to Role model
- `language_preference`: User language choice (en/fr/sw)
- `preferences`: JSON field for user settings
- `profile_image`: User profile picture
- `two_factor_enabled/secret`: 2FA support

### Role Model

```python
class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
```

**Available Roles:**
- Admin: Full system access
- Doctor: Medical staff access
- Nurse: Nursing staff access
- Receptionist: Front desk access
- Pharmacist: Pharmacy management access

### Patient Model

```python
class Patient(models.Model):
    unique_id = models.CharField(max_length=32, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10)
    contact_info = models.CharField(max_length=255, blank=True)
    address = models.CharField(max_length=255, blank=True)
    known_allergies = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Key Features:**
- Unique patient ID generation
- Comprehensive contact information
- Allergy tracking
- Audit timestamps

### Appointment Model

```python
class Appointment(models.Model):
    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role__name': 'Doctor'})
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="scheduled")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Status Workflow:**
- Scheduled → Completed/Cancelled
- Doctor assignment with role validation

### Encounter Model

```python
class Encounter(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True)
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role__name': 'Doctor'})
    notes = models.TextField()
    diagnosis = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Purpose:** Medical visit documentation

### Prescription Model

```python
class Prescription(models.Model):
    encounter = models.ForeignKey(Encounter, on_delete=models.CASCADE)
    medication_name = models.CharField(max_length=255)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Integration:** Links to RxNorm for drug interactions

### Vitals Model

```python
class Vitals(models.Model):
    encounter = models.ForeignKey(Encounter, on_delete=models.CASCADE, related_name='vitals')
    systolic_bp = models.PositiveIntegerField()
    diastolic_bp = models.PositiveIntegerField()
    heart_rate = models.PositiveIntegerField()
    respiratory_rate = models.PositiveIntegerField()
    temperature = models.FloatField()
    oxygen_saturation = models.FloatField()
    height = models.FloatField(help_text="cm")
    weight = models.FloatField(help_text="kg")
    bmi = models.FloatField(blank=True, null=True)
    recorded_at = models.DateTimeField(auto_now_add=True)
```

**Auto-calculation:** BMI computed from height/weight

## Pharmacy Models

### InventoryItem Model

```python
class InventoryItem(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    quantity = models.PositiveIntegerField(default=0)
    unit = models.CharField(max_length=50, default="tablet")
    updated_at = models.DateTimeField(auto_now=True)
```

### MedicationItem Model

```python
class MedicationItem(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    category = models.ForeignKey(MedicationCategory, on_delete=models.CASCADE)
    strength = models.CharField(max_length=100)
    form = models.CharField(max_length=100)
    requires_prescription = models.BooleanField(default=True)
    stock_quantity = models.PositiveIntegerField(default=0)
    reorder_level = models.PositiveIntegerField(default=10)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    expiry_date = models.DateField(null=True, blank=True)
```

## Billing Models

### Bill Model

```python
class Bill(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('partially_paid', 'Partially Paid'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue')
    ], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField()
```

### BillItem Model

```python
class BillItem(models.Model):
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='items')
    service_catalog = models.ForeignKey(ServiceCatalog, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
```

## Additional Models

### Notification Model

```python
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=50)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
```

### AuditLog Model

```python
class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=100)
    model_name = models.CharField(max_length=100)
    object_id = models.PositiveIntegerField()
    changes = models.JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True)
```

## Model Relationships

```
User (Doctor) --1:N-- Appointment --1:1-- Encounter --1:N-- Prescription
User (Doctor) --1:N-- Encounter --1:N-- Vitals
Patient --1:N-- Appointment
Patient --1:N-- Encounter
Patient --1:N-- Bill --1:N-- BillItem
Patient --1:N-- Notification
Role --1:N-- User
MedicationCategory --1:N-- MedicationItem
ServiceCatalog --1:N-- BillItem
```

## Database Configuration

- **Engine**: PostgreSQL
- **Host**: Configurable via environment variables
- **Database**: chelal_db
- **User**: chelal_user
- **Migrations**: Django ORM migrations

## Key Features

- **Audit Trail**: All changes tracked via AuditLog
- **Soft Deletes**: No hard deletes, status changes instead
- **Role-based Access**: Foreign key constraints with role validation
- **Auto-timestamps**: created_at/updated_at on all models
- **JSON Fields**: Flexible storage for preferences and changes
- **Unique Constraints**: Prevent duplicate entries where needed
