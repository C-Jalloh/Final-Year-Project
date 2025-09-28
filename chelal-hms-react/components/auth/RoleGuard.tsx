"use client"

import React from 'react'
import { useAuth } from '@/lib/auth-context'
import { hasAnyRole, ROLES } from '@/lib/permissions'
import type { Role } from '@/lib/permissions'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: Role[]
  fallback?: React.ReactNode
  requireAuth?: boolean
}

/**
 * RoleGuard component that conditionally renders children based on user roles
 * @param children - The content to render if user has required role
 * @param allowedRoles - Array of roles that are allowed to see the content
 * @param fallback - Content to render if user doesn't have required role (optional)
 * @param requireAuth - Whether authentication is required (default: true)
 */
export function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
  requireAuth = true
}: RoleGuardProps) {
  const { user, isAuthenticated } = useAuth()

  // If authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return fallback
  }

  // If user doesn't have any of the allowed roles
  if (!hasAnyRole(user, allowedRoles)) {
    return fallback
  }

  // User has required role, render children
  return <>{children}</>
}

// Convenience components for common role checks
export function AdminOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={[ROLES.ADMIN]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function DoctorOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={[ROLES.DOCTOR]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function ReceptionistOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={[ROLES.RECEPTIONIST]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function StaffOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function PatientOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={[ROLES.PATIENT]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}
