# API Endpoints Documentation

## Overview

The Chelal HMS API is built with Django REST Framework and provides comprehensive endpoints for hospital management operations. All endpoints require JWT authentication except for authentication endpoints.

## Authentication Endpoints

### POST /api/auth/
**Login endpoint**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token",
  "user": {
    "id": 1,
    "username": "user",
    "email": "user@example.com",
    "role": {"name": "Doctor"}
  }
}
```

### POST /api/auth/refresh/
**Refresh access token**
```json
{
  "refresh": "jwt_refresh_token"
}
```

### POST /api/register/
**User registration**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password",
  "first_name": "John",
  "last_name": "Doe",
  "role_id": 2
}
```

## User Management

### GET /api/users/
**List all users** (Admin only)
- Query parameters: `?role=Doctor`, `?is_active=true`

### GET /api/users/me/
**Get current user profile**

### POST /api/users/
**Create new user** (Admin only)

### PUT /api/users/{id}/
**Update user** (Admin or self)

### DELETE /api/users/{id}/
**Deactivate user** (Admin only)

### POST /api/users/{id}/deactivate/
**Deactivate user account**

### POST /api/users/{id}/activate/
**Activate user account**

### POST /api/users/{id}/reset_password/
**Reset user password** (Admin only)

### POST /api/users/{id}/assign_role/
**Assign role to user** (Admin only)
```json
{
  "role_id": 2
}
```

## Patient Management

### GET /api/patients/
**List patients**
- Query parameters: `?search=john`, `?gender=male`

### POST /api/patients/
**Create new patient**

### GET /api/patients/{id}/
**Get patient details**

### PUT /api/patients/{id}/
**Update patient**

### DELETE /api/patients/{id}/
**Delete patient**

## Appointment Management

### GET /api/appointments/
**List appointments**
- Query parameters: `?date=2025-01-15`, `?doctor=1`, `?status=scheduled`

### POST /api/appointments/
**Create appointment**
```json
{
  "patient": 1,
  "doctor": 2,
  "date": "2025-01-15",
  "time": "10:00:00",
  "status": "scheduled"
}
```

### GET /api/appointments/{id}/
**Get appointment details**

### PUT /api/appointments/{id}/
**Update appointment**

### DELETE /api/appointments/{id}/
**Cancel appointment**

## Medical Encounters

### GET /api/encounters/
**List encounters**
- Query parameters: `?patient=1`, `?doctor=2`, `?date_from=2025-01-01`

### POST /api/encounters/
**Create encounter**
```json
{
  "patient": 1,
  "appointment": 1,
  "doctor": 2,
  "notes": "Patient presented with fever",
  "diagnosis": "Viral infection"
}
```

### GET /api/encounters/{id}/
**Get encounter details**

### PUT /api/encounters/{id}/
**Update encounter**

## Prescriptions

### GET /api/prescriptions/
**List prescriptions**
- Query parameters: `?encounter=1`, `?patient=1`

### POST /api/prescriptions/
**Create prescription**
```json
{
  "encounter": 1,
  "medication_name": "Paracetamol",
  "dosage": "500mg",
  "frequency": "3 times daily"
}
```

### PUT /api/prescriptions/{id}/
**Update prescription**

### DELETE /api/prescriptions/{id}/
**Delete prescription**

## Vitals

### GET /api/vitals/
**List vitals**
- Query parameters: `?encounter=1`, `?patient=1`

### POST /api/vitals/
**Record vitals**
```json
{
  "encounter": 1,
  "systolic_bp": 120,
  "diastolic_bp": 80,
  "heart_rate": 72,
  "respiratory_rate": 16,
  "temperature": 36.5,
  "oxygen_saturation": 98,
  "height": 170,
  "weight": 70
}
```

## Pharmacy Management

### GET /api/inventory/
**List inventory items**

### POST /api/inventory/
**Add inventory item**

### GET /api/medications/
**List medications**

### POST /api/medications/
**Add medication**

### GET /api/purchase-orders/
**List purchase orders**

### POST /api/purchase-orders/
**Create purchase order**

### GET /api/goods-received-notes/
**List GRNs**

### POST /api/goods-received-notes/
**Create GRN**

## Billing

### GET /api/bills/
**List bills**
- Query parameters: `?patient=1`, `?status=pending`

### POST /api/bills/
**Create bill**

### GET /api/bills/{id}/
**Get bill details**

### PUT /api/bills/{id}/
**Update bill**

### GET /api/payments/
**List payments**

### POST /api/payments/
**Record payment**

## Notifications

### GET /api/notifications/
**List user notifications**

### POST /api/notifications/
**Create notification**

### PUT /api/notifications/{id}/
**Mark as read**

## Audit Logs

### GET /api/audit_logs/
**List audit logs** (Admin only)
- Query parameters: `?user=1`, `?action=CREATE`, `?date_from=2025-01-01`

## Reporting Endpoints

### GET /api/report/patient_count/
**Patient count report**

### GET /api/report/appointments_today/
**Today's appointments**

### GET /api/report/appointments_by_doctor/
**Appointments by doctor**

### GET /api/report/top_prescribed_medications/
**Top prescribed medications**

## Patient Portal (Restricted Access)

### GET /api/patient-portal/appointments/
**Patient's appointments**

### GET /api/patient-portal/laborders/
**Patient's lab orders**

### GET /api/patient-portal/prescriptions/
**Patient's prescriptions**

### GET /api/patient-portal/bills/
**Patient's bills**

## WebSocket Endpoints

### /ws/notifications/
**Real-time notifications**

### /ws/appointments/
**Real-time appointment updates**

## Error Responses

All endpoints return standard HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

Error response format:
```json
{
  "detail": "Error message",
  "errors": {
    "field": ["Error details"]
  }
}
```

## Rate Limiting

- Authenticated requests: 1000/hour
- Unauthenticated requests: 100/hour
- Login attempts: 5/minute per IP

## Pagination

List endpoints support pagination:
```json
{
  "count": 100,
  "next": "http://api.example.com/endpoint/?page=2",
  "previous": null,
  "results": [...]
}
```

Use `?page_size=50` to customize page size (max 100).
