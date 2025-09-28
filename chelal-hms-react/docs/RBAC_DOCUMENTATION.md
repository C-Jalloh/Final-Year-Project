# Role-Based Access Control (RBAC) Documentation

## Overview

The Chelal HMS implements a comprehensive Role-Based Access Control (RBAC) system that ensures users can only access features and data appropriate to their role within the hospital management system. This documentation covers the frontend implementation of the RBAC system.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Available Roles](#available-roles)
3. [Permission Matrix](#permission-matrix)
4. [Core Components](#core-components)
5. [Usage Examples](#usage-examples)
6. [Implementation Guide](#implementation-guide)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## System Architecture

The RBAC system is built on three main layers:

```
┌─────────────────────────────────────┐
│           UI Components             │
│  (ConditionalRender, RoleGuard)     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│        Permission Utilities        │
│   (hasRole, canAccess functions)    │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│         Authentication             │
│       (AuthContext, User)          │
└─────────────────────────────────────┘
```

## Available Roles

### Role Definitions

| Role | Code | Description | Access Level |
|------|------|-------------|--------------|
| **Administrator** | `ROLES.ADMIN` | System administrator with full access | Highest |
| **Doctor** | `ROLES.DOCTOR` | Medical professional with clinical access | High |
| **Receptionist** | `ROLES.RECEPTIONIST` | Front desk staff with patient management | Medium |
| **Patient** | `ROLES.PATIENT` | Patients with limited self-service access | Low |

### Role Hierarchy

```
Administrator (Full Access)
    ├── Doctor (Clinical Access)
    ├── Receptionist (Administrative Access)
    └── Patient (Self-Service Access)
```

## Permission Matrix

### Feature Access by Role

| Feature | Admin | Doctor | Receptionist | Patient |
|---------|-------|--------|--------------|---------|
| **Dashboard** | ✅ Full | ✅ Clinical | ✅ Basic | ❌ |
| **Patient Management** | ✅ Full CRUD | ✅ View/Edit | ✅ Register/View | ❌ |
| **Appointments** | ✅ Full CRUD | ✅ View/Manage | ✅ Schedule/Manage | ❌ |
| **Medications** | ✅ Full CRUD | ✅ Prescribe/View | ❌ | ❌ |
| **Billing** | ✅ Full CRUD | ❌ | ✅ Generate/Process | ❌ |
| **Reports & Analytics** | ✅ All Reports | ✅ Clinical Reports | ❌ | ❌ |
| **System Settings** | ✅ Full Access | ❌ | ❌ | ❌ |
| **User Management** | ✅ Full CRUD | ❌ | ❌ | ❌ |

### Detailed Permissions

#### Administrative Permissions
- `canManageUsers()` - Create, edit, delete users
- `canManageSettings()` - System configuration
- `canAccessAllData()` - Full data access

#### Clinical Permissions
- `canAccessPatientData()` - View/edit patient records
- `canManageMedications()` - Prescribe and manage medications
- `canAccessReports()` - View clinical reports

#### Operational Permissions
- `canManageAppointments()` - Schedule and manage appointments
- `canAccessBilling()` - Generate bills and process payments

## Core Components

### 1. Permission Utilities (`lib/permissions.ts`)

The foundation of the RBAC system, providing role checking and permission functions.

#### Role Constants
```typescript
export const ROLES = {
  ADMIN: 'Admin',
  DOCTOR: 'Doctor',
  RECEPTIONIST: 'Receptionist',
  PATIENT: 'Patient'
} as const
```

#### Core Functions
```typescript
// Basic role checking
hasRole(user, role: Role): boolean
hasAnyRole(user, roles: Role[]): boolean

// Role shortcuts
isAdmin(user): boolean
isDoctor(user): boolean
isReceptionist(user): boolean
isStaff(user): boolean

// Permission checking
canManageUsers(user): boolean
canAccessPatientData(user): boolean
canManageAppointments(user): boolean
canManageMedications(user): boolean
canAccessBilling(user): boolean
canAccessReports(user): boolean
canManageSettings(user): boolean
```

### 2. RoleGuard Component (`components/auth/RoleGuard.tsx`)

Provides route-level protection by conditionally rendering content based on user roles.

#### Props
- `children`: Content to render if user has required role
- `allowedRoles`: Array of roles that can access the content
- `fallback`: Content to show if access is denied (optional)
- `requireAuth`: Whether authentication is required (default: true)

#### Convenience Components
- `AdminOnly` - Restricts to administrators only
- `DoctorOnly` - Restricts to doctors only
- `ReceptionistOnly` - Restricts to receptionists only
- `StaffOnly` - Restricts to staff members (Admin, Doctor, Receptionist)
- `PatientOnly` - Restricts to patients only

### 3. ConditionalRender Component (`components/auth/ConditionalRender.tsx`)

Provides fine-grained UI visibility control based on roles and permissions.

#### Props
- `children`: Content to conditionally render
- `roles`: Array of roles that can see content (optional)
- `permissions`: Array of permission functions to check (optional)
- `fallback`: Content to show if conditions aren't met (optional)
- `requireAuth`: Whether authentication is required (default: true)

#### Permission-Based Components
- `CanManageUsers` - User management features
- `CanAccessPatientData` - Patient data access
- `CanManageAppointments` - Appointment management
- `CanManageMedications` - Medication management
- `CanAccessBilling` - Billing system access
- `CanAccessReports` - Reporting features
- `CanManageSettings` - System settings

## Usage Examples

### 1. Route Protection

```tsx
import { RoleGuard, ROLES } from '@/components/auth'

function SettingsPage() {
  return (
    <RoleGuard 
      allowedRoles={[ROLES.ADMIN]}
      fallback={<AccessDeniedMessage />}
    >
      <SettingsContent />
    </RoleGuard>
  )
}
```

### 2. UI Visibility Control

```tsx
import { AdminOnly, CanManageUsers } from '@/components/auth'

function UserManagementPanel() {
  return (
    <div>
      <h2>Users</h2>
      
      {/* Only admins can see user creation */}
      <AdminOnly>
        <CreateUserButton />
      </AdminOnly>
      
      {/* Permission-based visibility */}
      <CanManageUsers>
        <UserEditPanel />
      </CanManageUsers>
    </div>
  )
}
```

### 3. Navigation Filtering

```tsx
import { hasAnyRole, ROLES } from '@/lib/permissions'
import { useAuth } from '@/lib/auth-context'

function Navigation() {
  const { user } = useAuth()
  
  const navigationItems = [
    {
      name: "Billing",
      href: "/billing",
      allowedRoles: [ROLES.ADMIN, ROLES.RECEPTIONIST]
    },
    // ... other items
  ]
  
  const filteredItems = navigationItems.filter(item =>
    hasAnyRole(user, item.allowedRoles)
  )
  
  return (
    <nav>
      {filteredItems.map(item => (
        <NavLink key={item.name} to={item.href}>
          {item.name}
        </NavLink>
      ))}
    </nav>
  )
}
```

### 4. Conditional API Calls

```tsx
import { canAccessReports } from '@/lib/permissions'
import { useAuth } from '@/lib/auth-context'

function DashboardPage() {
  const { user } = useAuth()
  
  useEffect(() => {
    // Only fetch reports if user has permission
    if (canAccessReports(user)) {
      fetchReportsData()
    }
  }, [user])
  
  return (
    <div>
      <BasicDashboard />
      <CanAccessReports>
        <ReportsSection />
      </CanAccessReports>
    </div>
  )
}
```

## Implementation Guide

### Adding New Roles

1. **Update Role Constants**
```typescript
// lib/permissions.ts
export const ROLES = {
  ADMIN: 'Admin',
  DOCTOR: 'Doctor',
  RECEPTIONIST: 'Receptionist',
  PATIENT: 'Patient',
  NURSE: 'Nurse', // New role
} as const
```

2. **Add Role Checking Functions**
```typescript
export const isNurse = (user: User | null): boolean => {
  return hasRole(user, ROLES.NURSE)
}
```

3. **Update Permission Functions**
```typescript
export const canAccessPatientData = (user: User | null): boolean => {
  return hasAnyRole(user, [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE])
}
```

4. **Add Convenience Components**
```tsx
// components/auth/ConditionalRender.tsx
export function NurseOnly({ children, fallback }) {
  return (
    <ConditionalRender permissions={['isNurse']} fallback={fallback}>
      {children}
    </ConditionalRender>
  )
}
```

### Adding New Permissions

1. **Define Permission Function**
```typescript
// lib/permissions.ts
export const canManageInventory = (user: User | null): boolean => {
  return hasAnyRole(user, [ROLES.ADMIN, ROLES.NURSE])
}
```

2. **Add to Permission Checks**
```typescript
// components/auth/ConditionalRender.tsx
const permissionChecks = {
  'manageUsers': canManageUsers,
  'manageInventory': canManageInventory, // New permission
  // ... other permissions
}
```

3. **Create Component**
```tsx
export function CanManageInventory({ children, fallback }) {
  return (
    <ConditionalRender permissions={['manageInventory']} fallback={fallback}>
      {children}
    </ConditionalRender>
  )
}
```

### Page-Level Integration

1. **Wrap Entire Page**
```tsx
function BillingPage() {
  return (
    <AppLayout>
      <ConditionalRender
        roles={[ROLES.ADMIN, ROLES.RECEPTIONIST]}
        fallback={<AccessDeniedPage />}
      >
        <BillingContent />
      </ConditionalRender>
    </AppLayout>
  )
}
```

2. **Multiple Permission Levels**
```tsx
function PatientDetailsPage() {
  return (
    <AppLayout>
      <CanAccessPatientData fallback={<AccessDenied />}>
        <PatientBasicInfo />
        
        <AdminOnly>
          <PatientAdminActions />
        </AdminOnly>
        
        <ConditionalRender roles={[ROLES.DOCTOR]}>
          <MedicalHistory />
        </ConditionalRender>
      </CanAccessPatientData>
    </AppLayout>
  )
}
```

## Best Practices

### 1. Security Guidelines

- **Never rely solely on frontend access control** - Always validate permissions on the backend
- **Use the principle of least privilege** - Grant minimum necessary permissions
- **Implement defense in depth** - Multiple layers of access control
- **Regular permission audits** - Review and update permissions regularly

### 2. Code Organization

- **Centralize permission logic** - Keep all permission functions in `lib/permissions.ts`
- **Use descriptive names** - Make permission names clear and self-documenting
- **Group related permissions** - Organize by feature or role
- **Consistent naming** - Follow established patterns for new permissions

### 3. Component Design

- **Provide meaningful fallbacks** - Show appropriate messages for denied access
- **Keep components focused** - One permission check per component when possible
- **Use TypeScript** - Leverage type safety for role and permission checking
- **Test thoroughly** - Verify access control works for all user scenarios

### 4. User Experience

- **Clear error messages** - Explain why access was denied
- **Graceful degradation** - Hide unavailable features rather than showing errors
- **Consistent behavior** - Apply access control consistently across the app
- **Loading states** - Handle authentication state properly

## Troubleshooting

### Common Issues

#### 1. User appears to have wrong permissions
**Symptoms**: User sees content they shouldn't or can't access expected features
**Solutions**:
- Check user role in auth context: `console.log(user?.role)`
- Verify role matching: Ensure role names match exactly between frontend and backend
- Clear browser cache and localStorage
- Check for typos in role constants

#### 2. Components not rendering despite correct permissions
**Symptoms**: Content doesn't appear even with proper role
**Solutions**:
- Verify authentication state: Check `isAuthenticated` status
- Check component placement: Ensure auth provider wraps components
- Review conditional logic: Verify AND/OR logic in permission checks
- Check for JavaScript errors in console

#### 3. Navigation items not filtering properly
**Symptoms**: Menu items show for wrong roles
**Solutions**:
- Check `allowedRoles` array in navigation config
- Verify `hasAnyRole` function implementation
- Ensure user object has role property populated
- Check for role case sensitivity

#### 4. Access denied pages showing incorrectly
**Symptoms**: Users see access denied when they should have access
**Solutions**:
- Verify role hierarchy implementation
- Check permission function logic
- Review role assignments in user object
- Test with different user accounts

### Debugging Tools

#### 1. Permission Checker Hook
```tsx
// Custom hook for debugging permissions
export function usePermissionDebug() {
  const { user } = useAuth()
  
  const debugInfo = {
    user: user,
    role: user?.role,
    isAdmin: isAdmin(user),
    isDoctor: isDoctor(user),
    isReceptionist: isReceptionist(user),
    canManageUsers: canManageUsers(user),
    canAccessBilling: canAccessBilling(user),
  }
  
  console.log('Permission Debug:', debugInfo)
  return debugInfo
}
```

#### 2. Permission Display Component
```tsx
// Component to display current user permissions
export function PermissionDisplay() {
  const { user } = useAuth()
  
  if (process.env.NODE_ENV !== 'development') return null
  
  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded text-xs">
      <div>Role: {user?.role || 'None'}</div>
      <div>Admin: {isAdmin(user) ? '✅' : '❌'}</div>
      <div>Doctor: {isDoctor(user) ? '✅' : '❌'}</div>
      <div>Staff: {isStaff(user) ? '✅' : '❌'}</div>
    </div>
  )
}
```

### Testing Access Control

#### 1. Role Switching (Development)
```tsx
// Development utility to switch roles
export function RoleSwitcher() {
  const { user, updateProfile } = useAuth()
  
  if (process.env.NODE_ENV !== 'development') return null
  
  return (
    <select 
      value={user?.role || ''} 
      onChange={(e) => updateProfile({ role: e.target.value })}
    >
      <option value={ROLES.ADMIN}>Admin</option>
      <option value={ROLES.DOCTOR}>Doctor</option>
      <option value={ROLES.RECEPTIONIST}>Receptionist</option>
      <option value={ROLES.PATIENT}>Patient</option>
    </select>
  )
}
```

#### 2. Permission Test Cases
```typescript
// Unit tests for permission functions
describe('Permission Functions', () => {
  test('Admin can manage users', () => {
    const adminUser = { role: ROLES.ADMIN }
    expect(canManageUsers(adminUser)).toBe(true)
  })
  
  test('Doctor cannot access billing', () => {
    const doctorUser = { role: ROLES.DOCTOR }
    expect(canAccessBilling(doctorUser)).toBe(false)
  })
  
  test('Receptionist can manage appointments', () => {
    const receptionistUser = { role: ROLES.RECEPTIONIST }
    expect(canManageAppointments(receptionistUser)).toBe(true)
  })
})
```

## Migration Guide

### From Basic Auth to RBAC

If upgrading from a basic authentication system:

1. **Update User Interface**
```typescript
// Before
interface User {
  id: string
  username: string
  email: string
}

// After
interface User {
  id: string
  username: string
  email: string
  role?: string  // Add role property
  is_staff?: boolean
}
```

2. **Replace Direct Checks**
```tsx
// Before
{user?.is_staff && <AdminPanel />}

// After
<AdminOnly>
  <AdminPanel />
</AdminOnly>
```

3. **Update Navigation**
```tsx
// Before
{user?.is_staff && (
  <NavItem href="/admin">Admin</NavItem>
)}

// After
// Navigation automatically filters based on role
```

## API Integration

### Backend Permission Validation

While frontend RBAC provides user experience improvements, always validate permissions on the backend:

```typescript
// Frontend permission check (UX only)
if (canManageUsers(user)) {
  // Show user management UI
}

// Backend API call (security)
const response = await fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

if (!response.ok) {
  // Handle unauthorized access
}
```

### Role Synchronization

Ensure role information stays synchronized between frontend and backend:

```typescript
// Refresh user data periodically
useEffect(() => {
  const refreshUserData = async () => {
    try {
      const response = await apiHelpers.getProfile()
      updateProfile(response.data)
    } catch (error) {
      // Handle error
    }
  }
  
  const interval = setInterval(refreshUserData, 300000) // 5 minutes
  return () => clearInterval(interval)
}, [])
```

## Performance Considerations

### Optimization Strategies

1. **Memoize Permission Checks**
```tsx
const userPermissions = useMemo(() => ({
  canManageUsers: canManageUsers(user),
  canAccessBilling: canAccessBilling(user),
  canManageSettings: canManageSettings(user),
}), [user])
```

2. **Lazy Load Protected Components**
```tsx
const AdminPanel = lazy(() => import('./AdminPanel'))

<AdminOnly>
  <Suspense fallback={<Loading />}>
    <AdminPanel />
  </Suspense>
</AdminOnly>
```

3. **Cache Role-Based Data**
```typescript
// Cache navigation items per role
const getFilteredNavigation = useMemo(() => {
  return navigation.filter(item => hasAnyRole(user, item.allowedRoles))
}, [user?.role])
```

---

## Conclusion

This RBAC system provides a robust, scalable foundation for access control in the Chelal HMS. It balances security, usability, and maintainability while providing clear patterns for extending permissions as the system grows.

For additional questions or implementation assistance, refer to the component source code or contact the development team.
