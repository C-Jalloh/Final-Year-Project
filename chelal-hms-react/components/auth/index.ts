// Role-based access control utilities and components
export * from '../../lib/permissions'
export { RoleGuard, AdminOnly as RoleAdminOnly, DoctorOnly as RoleDoctorOnly, ReceptionistOnly as RoleReceptionistOnly, StaffOnly as RoleStaffOnly, PatientOnly as RolePatientOnly } from './RoleGuard'
export { ConditionalRender, AdminOnly, DoctorOnly, ReceptionistOnly, StaffOnly, PatientOnly, CanManageUsers, CanAccessPatientData, CanManageAppointments, CanManageMedications, CanAccessBilling, CanAccessReports, CanManageSettings } from './ConditionalRender'
