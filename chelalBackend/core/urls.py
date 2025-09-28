from django.urls import path, include
from rest_framework import routers
from .views import (
    RoleViewSet, UserViewSet, PatientViewSet, AppointmentViewSet,
    EncounterViewSet, PrescriptionViewSet, MedicationViewSet, BillViewSet, BillItemViewSet, PaymentViewSet,
    NotificationViewSet, AuditLogViewSet, LoginActivityViewSet, SystemSettingViewSet, RoleChangeRequestViewSet,
    MyTokenObtainPairView, MyTokenRefreshView, RegisterView, dashboard, dashboard_stats,
    report_patient_count, report_appointments_today, report_appointments_by_doctor, report_top_prescribed_medications,
    report_billing_stats, profile_view, user_preferences_view, health_check, sync_offline_data
)

router = routers.DefaultRouter()
router.register(r'roles', RoleViewSet)
router.register(r'users', UserViewSet, basename='user')
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'appointments', AppointmentViewSet)
router.register(r'encounters', EncounterViewSet)
router.register(r'prescriptions', PrescriptionViewSet)
router.register(r'medications', MedicationViewSet)
router.register(r'bills', BillViewSet)
router.register(r'bill-items', BillItemViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'audit-logs', AuditLogViewSet, basename='auditlog')
router.register(r'login-activity', LoginActivityViewSet, basename='loginactivity')
router.register(r'role-change-requests', RoleChangeRequestViewSet)
router.register(r'system-settings', SystemSettingViewSet, basename='systemsetting')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('', include(router.urls)),
    path('auth/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', MyTokenRefreshView.as_view(), name='token_refresh'),

    # Dashboard and reports
    path('dashboard/', dashboard, name='dashboard'),
    path('dashboard-stats/', dashboard_stats, name='dashboard-stats'),
    path('report/patient_count/', report_patient_count, name='report_patient_count'),
    path('report/appointments_today/', report_appointments_today, name='report_appointments_today'),
    path('report/appointments_by_doctor/', report_appointments_by_doctor, name='report_appointments_by_doctor'),
    path('report/top_prescribed_medications/', report_top_prescribed_medications, name='report_top_prescribed_medications'),

    path('report/billing-stats/', report_billing_stats, name='report_billing_stats'),
    # Profile and preferences
    path('profile/', profile_view, name='profile'),
    path('preferences/', user_preferences_view, name='user-preferences'),

    # Health check and sync
    path('health/', health_check, name='health-check'),
    path('sync_offline_data/', sync_offline_data, name='sync_offline_data'),
]
