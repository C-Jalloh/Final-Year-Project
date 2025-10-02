import { User } from '@/lib/auth-context'

// Define available roles - matching backend role names exactly
export const ROLES = {
  ADMIN: 'Admin',
  DOCTOR: 'Doctor',
  NURSE: 'Nurse',
  PHARMACIST: 'Pharmacist',
  RECEPTIONIST: 'Receptionist',
  PATIENT: 'Patient',
  DEFAULTUSER: 'defaultuser'
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

// Permission checking utilities
export const hasRole = (user: User | null, role: Role): boolean => {
  if (!user?.role) return false
  const userRole = typeof user.role === 'string' ? user.role : user.role.name
  return userRole === role
}

export const hasAnyRole = (user: User | null, roles: Role[]): boolean => {
  if (!user?.role) return false
  const userRole = typeof user.role === 'string' ? user.role : user.role.name
  return roles.includes(userRole as Role)
}

export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, ROLES.ADMIN)
}

export const isDoctor = (user: User | null): boolean => {
  return hasRole(user, ROLES.DOCTOR)
}

export const isNurse = (user: User | null): boolean => {
  return hasRole(user, ROLES.NURSE)
}

export const isPharmacist = (user: User | null): boolean => {
  return hasRole(user, ROLES.PHARMACIST)
}

export const isReceptionist = (user: User | null): boolean => {
  return hasRole(user, ROLES.RECEPTIONIST)
}

export const isPatient = (user: User | null): boolean => {
  return hasRole(user, ROLES.PATIENT)
}

export const isDefaultUser = (user: User | null): boolean => {
  return hasRole(user, ROLES.DEFAULTUSER)
}

// Check if user has staff privileges (Admin, Doctor, Nurse, Pharmacist, Receptionist)
export const isStaff = (user: User | null): boolean => {
  return hasAnyRole(user, [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PHARMACIST, ROLES.RECEPTIONIST])
}

// Check if user can perform administrative actions
export const canManageUsers = (user: User | null): boolean => {
  return isAdmin(user)
}

// Check if user can access patient data
export const canAccessPatientData = (user: User | null): boolean => {
  return isStaff(user)
}

// Check if user can manage appointments
export const canManageAppointments = (user: User | null): boolean => {
  return hasAnyRole(user, [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST])
}

// Check if user can manage medications
export const canManageMedications = (user: User | null): boolean => {
  return hasAnyRole(user, [ROLES.ADMIN, ROLES.DOCTOR])
}

// Check if user can access billing
export const canAccessBilling = (user: User | null): boolean => {
  return hasAnyRole(user, [ROLES.ADMIN, ROLES.RECEPTIONIST])
}

// Check if user can access reports
export const canAccessReports = (user: User | null): boolean => {
  return hasAnyRole(user, [ROLES.ADMIN, ROLES.DOCTOR])
}

// Check if user can manage system settings
export const canManageSettings = (user: User | null): boolean => {
  return isAdmin(user)
}
