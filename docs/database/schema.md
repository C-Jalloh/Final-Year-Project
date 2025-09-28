# Database Schema Documentation

## Overview

The Chelal HMS uses PostgreSQL as the primary database with Django ORM for schema management and migrations.

## Database Configuration

### Connection Settings

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'chelal_db',
        'USER': 'chelal_user',
        'PASSWORD': 'chelal_password',
        'HOST': os.environ.get('DATABASE_HOST', 'localhost'),
        'PORT': '5432',
    }
}
```

### Environment Variables

- `DATABASE_HOST`: Database server hostname (default: localhost)
- `DATABASE_PORT`: Database server port (default: 5432)
- `DATABASE_NAME`: Database name
- `DATABASE_USER`: Database username
- `DATABASE_PASSWORD`: Database password

## Core Tables

### auth_user (Custom User Model)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | User ID |
| username | VARCHAR(150) | UNIQUE, NOT NULL | Username |
| email | VARCHAR(254) | UNIQUE, NOT NULL | Email address |
| password | VARCHAR(128) | NOT NULL | Hashed password |
| first_name | VARCHAR(150) |  | First name |
| last_name | VARCHAR(150) |  | Last name |
| is_active | BOOLEAN | DEFAULT TRUE | Account status |
| date_joined | TIMESTAMP | NOT NULL | Registration date |
| role_id | INTEGER | FOREIGN KEY | User role |
| language_preference | VARCHAR(10) | DEFAULT 'en' | Language preference |
| preferences | JSONB |  | User preferences |
| profile_image | VARCHAR(100) |  | Profile image path |
| two_factor_enabled | BOOLEAN | DEFAULT FALSE | 2FA status |
| two_factor_secret | VARCHAR(64) |  | 2FA secret |

### core_role

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Role ID |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Role name |
| description | TEXT |  | Role description |

### core_patient

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Patient ID |
| unique_id | VARCHAR(32) | UNIQUE, NOT NULL | Unique patient identifier |
| first_name | VARCHAR(100) | NOT NULL | First name |
| last_name | VARCHAR(100) | NOT NULL | Last name |
| date_of_birth | DATE | NOT NULL | Date of birth |
| gender | VARCHAR(10) | NOT NULL | Gender |
| contact_info | VARCHAR(255) |  | Contact information |
| address | VARCHAR(255) |  | Address |
| known_allergies | TEXT |  | Known allergies |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

### core_appointment

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Appointment ID |
| patient_id | INTEGER | FOREIGN KEY, NOT NULL | Patient reference |
| doctor_id | INTEGER | FOREIGN KEY, NOT NULL | Doctor reference |
| date | DATE | NOT NULL | Appointment date |
| time | TIME | NOT NULL | Appointment time |
| status | VARCHAR(20) | DEFAULT 'scheduled' | Appointment status |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

### core_encounter

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Encounter ID |
| patient_id | INTEGER | FOREIGN KEY, NOT NULL | Patient reference |
| appointment_id | INTEGER | FOREIGN KEY | Appointment reference |
| doctor_id | INTEGER | FOREIGN KEY, NOT NULL | Doctor reference |
| notes | TEXT | NOT NULL | Encounter notes |
| diagnosis | TEXT |  | Diagnosis |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

### core_prescription

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Prescription ID |
| encounter_id | INTEGER | FOREIGN KEY, NOT NULL | Encounter reference |
| medication_name | VARCHAR(255) | NOT NULL | Medication name |
| dosage | VARCHAR(100) | NOT NULL | Dosage instructions |
| frequency | VARCHAR(100) | NOT NULL | Frequency |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

### core_vitals

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Vitals ID |
| encounter_id | INTEGER | FOREIGN KEY, NOT NULL | Encounter reference |
| systolic_bp | INTEGER | NOT NULL | Systolic blood pressure |
| diastolic_bp | INTEGER | NOT NULL | Diastolic blood pressure |
| heart_rate | INTEGER | NOT NULL | Heart rate |
| respiratory_rate | INTEGER | NOT NULL | Respiratory rate |
| temperature | DECIMAL | NOT NULL | Temperature |
| oxygen_saturation | DECIMAL | NOT NULL | Oxygen saturation |
| height | DECIMAL |  | Height in cm |
| weight | DECIMAL |  | Weight in kg |
| bmi | DECIMAL |  | Body mass index |
| recorded_at | TIMESTAMP | NOT NULL | Recording timestamp |

## Pharmacy Tables

### core_inventoryitem

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Inventory item ID |
| name | VARCHAR(255) | UNIQUE, NOT NULL | Item name |
| description | TEXT |  | Item description |
| quantity | INTEGER | DEFAULT 0 | Current quantity |
| unit | VARCHAR(50) | DEFAULT 'tablet' | Unit of measurement |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

### core_medicationitem

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Medication ID |
| name | VARCHAR(255) | UNIQUE, NOT NULL | Medication name |
| description | TEXT |  | Description |
| category_id | INTEGER | FOREIGN KEY, NOT NULL | Category reference |
| strength | VARCHAR(100) | NOT NULL | Medication strength |
| form | VARCHAR(100) | NOT NULL | Medication form |
| requires_prescription | BOOLEAN | DEFAULT TRUE | Prescription required |
| stock_quantity | INTEGER | DEFAULT 0 | Stock quantity |
| reorder_level | INTEGER | DEFAULT 10 | Reorder threshold |
| unit_price | DECIMAL | NOT NULL | Unit price |
| expiry_date | DATE |  | Expiry date |

## Billing Tables

### core_bill

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Bill ID |
| patient_id | INTEGER | FOREIGN KEY, NOT NULL | Patient reference |
| total_amount | DECIMAL | NOT NULL | Total bill amount |
| paid_amount | DECIMAL | DEFAULT 0 | Amount paid |
| status | VARCHAR(20) | DEFAULT 'pending' | Bill status |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| due_date | DATE | NOT NULL | Payment due date |

### core_billitem

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Bill item ID |
| bill_id | INTEGER | FOREIGN KEY, NOT NULL | Bill reference |
| service_catalog_id | INTEGER | FOREIGN KEY, NOT NULL | Service reference |
| quantity | INTEGER | DEFAULT 1 | Quantity |
| unit_price | DECIMAL | NOT NULL | Unit price |
| total_price | DECIMAL | NOT NULL | Total price |
| description | TEXT |  | Item description |

### core_payment

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Payment ID |
| bill_id | INTEGER | FOREIGN KEY, NOT NULL | Bill reference |
| amount | DECIMAL | NOT NULL | Payment amount |
| payment_method | VARCHAR(50) | NOT NULL | Payment method |
| transaction_id | VARCHAR(100) |  | Transaction reference |
| payment_date | TIMESTAMP | NOT NULL | Payment timestamp |
| notes | TEXT |  | Payment notes |

## System Tables

### core_notification

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Notification ID |
| user_id | INTEGER | FOREIGN KEY, NOT NULL | User reference |
| title | VARCHAR(255) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| notification_type | VARCHAR(50) | NOT NULL | Notification type |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |

### core_auditlog

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Audit log ID |
| user_id | INTEGER | FOREIGN KEY | User reference |
| action | VARCHAR(100) | NOT NULL | Action performed |
| model_name | VARCHAR(100) | NOT NULL | Model affected |
| object_id | INTEGER | NOT NULL | Object ID |
| changes | JSONB | NOT NULL | Changes made |
| timestamp | TIMESTAMP | NOT NULL | Action timestamp |
| ip_address | INET |  | Client IP address |

## Indexes

### Performance Indexes

```sql
-- Patient search optimization
CREATE INDEX idx_patient_name ON core_patient (first_name, last_name);
CREATE INDEX idx_patient_unique_id ON core_patient (unique_id);

-- Appointment optimization
CREATE INDEX idx_appointment_date ON core_appointment (date);
CREATE INDEX idx_appointment_doctor_date ON core_appointment (doctor_id, date);
CREATE INDEX idx_appointment_patient ON core_appointment (patient_id);

-- Encounter optimization
CREATE INDEX idx_encounter_patient ON core_encounter (patient_id);
CREATE INDEX idx_encounter_doctor ON core_encounter (doctor_id);
CREATE INDEX idx_encounter_date ON core_encounter (created_at);

-- Audit log optimization
CREATE INDEX idx_audit_user ON core_auditlog (user_id);
CREATE INDEX idx_audit_timestamp ON core_auditlog (timestamp);
CREATE INDEX idx_audit_model ON core_auditlog (model_name, object_id);
```

## Relationships

### Entity Relationship Diagram

```
User (Doctor) --1:N-- Appointment --1:1-- Encounter --1:N-- Prescription
User (Doctor) --1:N-- Encounter --1:N-- Vitals
Patient --1:N-- Appointment
Patient --1:N-- Encounter
Patient --1:N-- Bill --1:N-- BillItem --1:N-- Payment
Patient --1:N-- Notification
Role --1:N-- User
MedicationCategory --1:N-- MedicationItem
ServiceCatalog --1:N-- BillItem
AuditLog -- tracks all changes
```

## Data Integrity

### Foreign Key Constraints

- All foreign keys have CASCADE or SET NULL delete behavior
- Role-based constraints on user assignments
- Status validation through Django model choices

### Unique Constraints

- Patient unique_id
- User email and username
- Inventory item names
- Medication names

### Check Constraints

- Positive quantities and amounts
- Valid date ranges
- Status value validation

## Backup Strategy

### Automated Backups

- Daily full database backups
- Hourly incremental backups during business hours
- Point-in-time recovery capability
- Offsite backup storage

### Backup Verification

- Regular restore testing
- Backup integrity checks
- Monitoring and alerting

## Migration History

### Key Migrations

- `0001_initial.py`: Core models creation
- `0002_add_audit_log.py`: Audit logging system
- `0003_pharmacy_models.py`: Pharmacy management
- `0004_billing_system.py`: Billing and payments
- `0005_notifications.py`: Notification system
- `0006_telemedicine.py`: Telemedicine support

### Migration Commands

```bash
# Create new migration
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migration status
python manage.py showmigrations

# Rollback migration
python manage.py migrate core 0001
```

## Performance Considerations

### Query Optimization

- Use `select_related()` for foreign key access
- Use `prefetch_related()` for reverse foreign keys
- Implement database indexes for common queries
- Use database views for complex aggregations

### Connection Pooling

- Configure PostgreSQL connection pooling
- Use Django's database connection persistence
- Monitor connection usage and timeouts

### Caching Strategy

- Redis for session storage
- Database query result caching
- API response caching
- Static file caching
