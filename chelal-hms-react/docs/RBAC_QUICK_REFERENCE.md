# Role-Based Access Control (RBAC) - Quick Reference

## Quick Start Guide

### Import Components
```typescript
// Import role guards and permissions
import { RoleGuard, AdminOnly, ConditionalRender } from '@/components/auth'
import { ROLES, hasRole, canManageUsers } from '@/lib/permissions'
```

### Basic Usage

#### Protect Entire Pages
```tsx
function SettingsPage() {
  return (
    <RoleGuard allowedRoles={[ROLES.ADMIN]} fallback={<AccessDenied />}>
      <SettingsContent />
    </RoleGuard>
  )
}
```

#### Show/Hide UI Elements
```tsx
<AdminOnly>
  <CreateUserButton />
</AdminOnly>

<ConditionalRender roles={[ROLES.ADMIN, ROLES.DOCTOR]}>
  <PatientDataPanel />
</ConditionalRender>
```

## Available Roles

- `ROLES.ADMIN` - System Administrator
- `ROLES.DOCTOR` - Medical Professional  
- `ROLES.RECEPTIONIST` - Front Desk Staff
- `ROLES.PATIENT` - Patient User

## Permission Functions

### Role Checking
- `hasRole(user, role)` - Check specific role
- `hasAnyRole(user, roles[])` - Check multiple roles
- `isAdmin(user)` - Check if admin
- `isDoctor(user)` - Check if doctor
- `isStaff(user)` - Check if staff member

### Feature Permissions
- `canManageUsers(user)` - User management
- `canAccessPatientData(user)` - Patient records
- `canManageAppointments(user)` - Scheduling
- `canManageMedications(user)` - Pharmacy
- `canAccessBilling(user)` - Financial data
- `canAccessReports(user)` - Analytics
- `canManageSettings(user)` - System config

## Components Reference

### RoleGuard
Route-level protection component.

**Props:**
- `allowedRoles: Role[]` - Required roles
- `fallback?: ReactNode` - Content when access denied
- `requireAuth?: boolean` - Require authentication (default: true)

### ConditionalRender
UI-level visibility control.

**Props:**
- `roles?: Role[]` - Allowed roles
- `permissions?: string[]` - Permission functions
- `fallback?: ReactNode` - Fallback content

### Convenience Components
- `AdminOnly` - Admin access only
- `DoctorOnly` - Doctor access only
- `StaffOnly` - Staff access only
- `CanManageUsers` - User management permission
- `CanAccessBilling` - Billing permission

## Permission Matrix

| Feature | Admin | Doctor | Receptionist | Patient |
|---------|-------|--------|--------------|---------|
| Dashboard | ✅ | ✅ | ✅ | ❌ |
| Patients | ✅ | ✅ | ✅ | ❌ |
| Appointments | ✅ | ✅ | ✅ | ❌ |
| Medications | ✅ | ✅ | ❌ | ❌ |
| Billing | ✅ | ❌ | ✅ | ❌ |
| Reports | ✅ | ✅ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ |

## Common Patterns

### Navigation Filtering
```tsx
const filteredNavigation = navigation.filter(item =>
  hasAnyRole(user, item.allowedRoles)
)
```

### Conditional API Calls
```tsx
useEffect(() => {
  if (canAccessReports(user)) {
    fetchReportsData()
  }
}, [user])
```

### Multiple Permission Levels
```tsx
<CanAccessPatientData>
  <PatientBasicInfo />
  
  <AdminOnly>
    <PatientAdminActions />
  </AdminOnly>
  
  <DoctorOnly>
    <MedicalHistory />
  </DoctorOnly>
</CanAccessPatientData>
```

## Best Practices

1. **Always validate on backend** - Frontend is for UX only
2. **Use TypeScript** - Leverage type safety
3. **Provide clear fallbacks** - Show meaningful access denied messages
4. **Test all roles** - Verify access control works for each user type
5. **Keep permissions granular** - Use specific permission functions

## Troubleshooting

### Common Issues
- **Wrong permissions**: Check `user?.role` value
- **Components not rendering**: Verify auth context wraps components
- **Navigation not filtering**: Check `allowedRoles` arrays

### Debug Tools
```tsx
// Debug current user permissions
console.log({
  role: user?.role,
  isAdmin: isAdmin(user),
  canManageUsers: canManageUsers(user)
})
```
