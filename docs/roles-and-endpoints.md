# Roles and API Endpoint Access Matrix

This document lists the application roles and the backend API endpoints each role should be allowed to interact with. It is intended as documentation and a reference for frontend role-based UI, backend permission checks, and automated tests.

Current roles:
- ADMIN
- DOCTOR
- NURSE
- PHARMACIST
- RECEPTIONIST
- PATIENT

Notes:
- "Allowed" indicates the role may call the API endpoint and perform the standard CRUD actions documented.
- Specific action-level restrictions (e.g., only Admin can DELETE users) are highlighted where applicable.
- The backend enforces permissions in views/permission classes; this document is a mapping for consistency and UI wiring.

---

## Authentication

- POST /api/auth/ (login)
  - Allowed: All (unauthenticated)
- POST /api/auth/refresh/
  - Allowed: All (with refresh token)
- POST /api/register/
  - Allowed: Admin (create users) or self-registration if enabled

## User Management

- GET /api/users/ (list users)
  - Allowed: ADMIN
- GET /api/users/me/
  - Allowed: All authenticated users (returns own profile)
- POST /api/users/ (create user)
  - Allowed: ADMIN
- PUT /api/users/{id}/ (update user)
  - Allowed: ADMIN or the user themself
- DELETE /api/users/{id}/ (deactivate)
  - Allowed: ADMIN
- POST /api/users/{id}/assign_role/
  - Allowed: ADMIN

## Patient Management

- GET /api/patients/
  - Allowed: ADMIN, DOCTOR, NURSE, RECEPTIONIST
- POST /api/patients/
  - Allowed: ADMIN, RECEPTIONIST, NURSE
- GET /api/patients/{id}/
  - Allowed: ADMIN, DOCTOR, NURSE, RECEPTIONIST, PATIENT (own record)
- PUT /api/patients/{id}/
  - Allowed: ADMIN, DOCTOR, NURSE, RECEPTIONIST (partial access), PATIENT (limited/self)
- DELETE /api/patients/{id}/
  - Allowed: ADMIN

## Appointment Management

- GET /api/appointments/
  - Allowed: ADMIN, DOCTOR, NURSE, RECEPTIONIST, PATIENT (own)
- POST /api/appointments/
  - Allowed: ADMIN, RECEPTIONIST, PATIENT (self-booking if enabled)
- GET /api/appointments/{id}/
  - Allowed: ADMIN, DOCTOR, NURSE, RECEPTIONIST, PATIENT (own)
- PUT /api/appointments/{id}/
  - Allowed: ADMIN, DOCTOR (reschedule/confirm), RECEPTIONIST (reschedule), PATIENT (cancel/modify own)
- DELETE /api/appointments/{id}/
  - Allowed: ADMIN, RECEPTIONIST, PATIENT (cancel own)

## Encounters (Clinical Notes)

- GET /api/encounters/
  - Allowed: ADMIN, DOCTOR, NURSE
- POST /api/encounters/
  - Allowed: DOCTOR, NURSE
- GET /api/encounters/{id}/
  - Allowed: ADMIN, DOCTOR, NURSE
- PUT /api/encounters/{id}/
  - Allowed: DOCTOR (owner) or ADMIN

## Prescriptions

- GET /api/prescriptions/
  - Allowed: ADMIN, DOCTOR, NURSE, PHARMACIST
- POST /api/prescriptions/
  - Allowed: DOCTOR (create), NURSE (assist/create per policy)
- PUT /api/prescriptions/{id}/
  - Allowed: DOCTOR, ADMIN
- DELETE /api/prescriptions/{id}/
  - Allowed: ADMIN

## Vitals

- GET /api/vitals/
  - Allowed: ADMIN, DOCTOR, NURSE
- POST /api/vitals/
  - Allowed: NURSE, DOCTOR
- PUT /api/vitals/{id}/
  - Allowed: DOCTOR, NURSE

## Pharmacy / Inventory / Dispensing

- GET /api/inventory/
  - Allowed: ADMIN, PHARMACIST
- POST /api/inventory/
  - Allowed: ADMIN, PHARMACIST
- GET /api/medications/
  - Allowed: ADMIN, DOCTOR, PHARMACIST
- POST /api/medications/
  - Allowed: ADMIN, PHARMACIST
- GET /api/dispensing-logs/
  - Allowed: ADMIN, PHARMACIST
- POST /api/dispensing-logs/
  - Allowed: PHARMACIST
- GET /api/purchase-orders/, /api/goods-received-notes/
  - Allowed: ADMIN, PHARMACIST
- POST /api/purchase-orders/, /api/goods-received-notes/
  - Allowed: PHARMACIST, ADMIN

## Billing

- GET /api/bills/
  - Allowed: ADMIN, RECEPTIONIST, PATIENT (own)
- POST /api/bills/
  - Allowed: ADMIN, RECEPTIONIST
- PUT /api/bills/{id}/
  - Allowed: ADMIN, RECEPTIONIST
- GET /api/payments/
  - Allowed: ADMIN, RECEPTIONIST
- POST /api/payments/
  - Allowed: RECEPTIONIST, PATIENT (payment)

## Lab Orders & Results

- GET /api/lab_orders/
  - Allowed: ADMIN, DOCTOR, NURSE, PHARMACIST (if integrated), PATIENT (own)
- POST /api/lab_orders/
  - Allowed: DOCTOR, NURSE
- GET /api/lab_order_items/, /api/lab_result_values/
  - Allowed: ADMIN, DOCTOR, NURSE, LAB_TECH (if present)

## Telemedicine / Secure Messaging

- Telemedicine sessions: ADMIN, DOCTOR, PATIENT (participant)
- Secure messages: ADMIN, DOCTOR, NURSE, RECEPTIONIST, PATIENT (participant)

## Notifications

- GET /api/notifications/
  - Allowed: All authenticated users (returns notifications relevant to the user)
- POST /api/notifications/
  - Allowed: ADMIN, SYSTEM
- PUT /api/notifications/{id}/
  - Allowed: The target user (mark as read) or ADMIN

## Audit Logs / Admin Reports

- GET /api/audit_logs/
  - Allowed: ADMIN only
- Reporting endpoints (patient_count, appointments_today, appointments_by_doctor, top_prescribed_medications)
  - Allowed: ADMIN, DOCTOR (some reports), PHARMACIST (medication reports), NURSE (operational reports)

## Patient Portal Endpoints

- GET /api/patient-portal/appointments, /laborders, /prescriptions, /bills
  - Allowed: PATIENT (own data)

---

## Action items / Next steps

1. Wire the new roles into the frontend `ROLES` constant (done). Verify that components and `RoleGuard`/`hasAnyRole` checks use the new roles.
2. Add explicit permission classes in backend viewsets if stricter enforcement is required (e.g., `IsPharmacist` for dispensing endpoints).
3. Create automated tests verifying each role can/cannot access the listed endpoints.
4. Optionally add role management UI (Admin) to create/update role permissions.

If you want, I can:
- Generate a CSV matrix of roles vs endpoints for easier import into permission management.
- Create backend permission classes (Django REST Framework) and apply them to viewsets that need role-based enforcement (I can implement the `IsNurse`, `IsPharmacist` permissions and apply to endpoints such as `vitals`, `dispensing-logs`, `inventory`).

---

Document created/updated by automation on 2025-09-21.
