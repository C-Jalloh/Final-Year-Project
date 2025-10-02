"use client"

import React from 'react'
import { useAuth } from '../../lib/auth-context'
import { hasAnyRole, hasRole, isAdmin, isDoctor, isReceptionist, isPatient, isStaff, canManageUsers, canAccessPatientData, canManageAppointments, canManageMedications, canAccessBilling, canAccessReports, canManageSettings } from '@/lib/permissions'
import type { Role } from '@/lib/permissions'

interface ConditionalRenderProps {
  children: React.ReactNode
  roles?: Role[]
  permissions?: string[]
  fallback?: React.ReactNode
  requireAuth?: boolean
}

/**
 * ConditionalRender component that shows/hides content based on user roles or permissions
 * @param children - The content to conditionally render
 * @param roles - Array of roles that can see the content
 * @param permissions - Array of permission functions to check
 * @param fallback - Content to render if conditions aren't met
 * @param requireAuth - Whether authentication is required
 */
export function ConditionalRender({
  children,
  roles,
  permissions,
  fallback = null,
  requireAuth = true
}: ConditionalRenderProps) {
  const { user, isAuthenticated } = useAuth()

  // If authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>
  }

  // Check role-based access
  if (roles && roles.length > 0) {
    if (!hasAnyRole(user, roles)) {
      return <>{fallback}</>
    }
  }

  // Check permission-based access
  if (permissions && permissions.length > 0) {
    const permissionChecks = {
      'manageUsers': canManageUsers,
      'accessPatientData': canAccessPatientData,
      'manageAppointments': canManageAppointments,
      'manageMedications': canManageMedications,
      'accessBilling': canAccessBilling,
      'accessReports': canAccessReports,
      'manageSettings': canManageSettings,
      'isAdmin': isAdmin,
      'isDoctor': isDoctor,
      'isReceptionist': isReceptionist,
      'isPatient': isPatient,
      'isStaff': isStaff
    }

    const hasPermission = permissions.some(permission => {
      const checkFn = permissionChecks[permission as keyof typeof permissionChecks]
      return checkFn ? checkFn(user) : false
    })

    if (!hasPermission) {
      return <>{fallback}</>
    }
  }

  // All conditions met, render children
  return <>{children}</>
}

// Convenience components for common permission checks
export function AdminOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <ConditionalRender permissions={['isAdmin']} fallback={fallback}>
      {children}
    </ConditionalRender>
  )
}

export function DoctorOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <ConditionalRender permissions={['isDoctor']} fallback={fallback}>
      {children}
    </ConditionalRender>
  )
}

export function ReceptionistOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <ConditionalRender permissions={['isReceptionist']} fallback={fallback}>
      {children}
    </ConditionalRender>
  )
}

export function StaffOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <ConditionalRender permissions={['isStaff']} fallback={fallback}>
      {children}
    </ConditionalRender>
  )
}

export function PatientOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <ConditionalRender permissions={['isPatient']} fallback={fallback}>
      {children}
    </ConditionalRender>
  )
}

// Specific permission-based components
export function CanManageUsers({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <ConditionalRender permissions={['manageUsers']} fallback={fallback}>
      {children}
    </ConditionalRender>
  )
}

export function CanAccessPatientData({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <ConditionalRender permissions={['accessPatientData']} fallback={fallback}>
      {children}
    </ConditionalRender>
  )
}

export function CanManageAppointments({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <ConditionalRender permissions={['manageAppointments']} fallback={fallback}>
      {children}
    </ConditionalRender>
  )
}

export function CanManageMedications({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <ConditionalRender permissions={['manageMedications']} fallback={fallback}>
      {children}
    </ConditionalRender>
  )
}

export function CanAccessBilling({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <ConditionalRender permissions={['accessBilling']} fallback={fallback}>
      {children}
    </ConditionalRender>
  )
}

export function CanAccessReports({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <ConditionalRender permissions={['accessReports']} fallback={fallback}>
      {children}
    </ConditionalRender>
  )
}

export function CanManageSettings({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <ConditionalRender permissions={['manageSettings']} fallback={fallback}>
      {children}
    </ConditionalRender>
  )
}
