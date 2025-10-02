from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework.renderers import JSONRenderer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import viewsets, permissions, serializers
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Role, User, Patient, Appointment, Encounter, Prescription, Medication, Bill, BillItem, Payment, Notification, AuditLog, LoginActivity, SystemSetting, RoleChangeRequest
from .serializers import (
    RoleSerializer, UserSerializer, PatientSerializer, AppointmentSerializer,
    EncounterSerializer, PrescriptionSerializer, MedicationSerializer,
    BillSerializer, BillItemSerializer, PaymentSerializer, NotificationSerializer,
    AuditLogSerializer, LoginActivitySerializer, SystemSettingSerializer, RoleChangeRequestSerializer, UserPreferencesSerializer
)
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework import status
from .permissions import IsAdminOrReadOnly, IsDoctorOrReadOnly, IsReceptionistOrReadOnly
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.utils import timezone
from django.http import HttpResponse
import csv
from datetime import date, timedelta
from django.db import models
from django.contrib.auth import get_user_model
from .email_utils import send_appointment_email
from .email_token_serializer import EmailTokenObtainPairSerializer
from rest_framework.views import APIView
from .serializers import RegistrationSerializer

User = get_user_model()

# Create your views here.

@method_decorator(csrf_exempt, name='dispatch')
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer  # Use custom serializer for email/username login

@method_decorator(csrf_exempt, name='dispatch')
class MyTokenRefreshView(TokenRefreshView):
    serializer_class = TokenRefreshSerializer

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "user": UserSerializer(user).data,
                "message": "User registered successfully"
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Core Model ViewSets
class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAdminOrReadOnly]

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrReadOnly]

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAdminOrReadOnly]

    # Temporarily remove filtering to debug
    # def get_queryset(self):
    #     user = self.request.user
    #     # Ensure role is loaded
    #     if hasattr(user, 'role') and user.role and user.role.name in ['Admin', 'Doctor', 'Nurse', 'Receptionist']:
    #         return Patient.objects.all()
    #     return Patient.objects.none()

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Ensure role is loaded by accessing it
        role_name = None
        if hasattr(user, 'role') and user.role:
            role_name = user.role.name
        elif hasattr(user, 'role_id'):
            # Try to get role from database if not loaded
            from core.models import Role
            try:
                role = Role.objects.get(id=user.role_id)
                role_name = role.name
            except Role.DoesNotExist:
                pass
        
        if role_name in ['Admin', 'Nurse', 'Receptionist']:
            return Appointment.objects.all()
        elif role_name == 'Doctor':
            return Appointment.objects.filter(doctor=user)
        return Appointment.objects.none()

    def perform_create(self, serializer):
        appointment = serializer.save()
        # Send notification to patient (placeholder for email/SMS)
        send_appointment_email(appointment)

class EncounterViewSet(viewsets.ModelViewSet):
    queryset = Encounter.objects.all()
    serializer_class = EncounterSerializer
    permission_classes = [IsDoctorOrReadOnly]

class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    permission_classes = [IsDoctorOrReadOnly]

class MedicationViewSet(viewsets.ModelViewSet):
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer
    permission_classes = [IsAuthenticated]

class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Ensure role is loaded by accessing it
        role_name = None
        if hasattr(user, 'role') and user.role:
            role_name = user.role.name
        elif hasattr(user, 'role_id'):
            # Try to get role from database if not loaded
            from core.models import Role
            try:
                role = Role.objects.get(id=user.role_id)
                role_name = role.name
            except Role.DoesNotExist:
                pass
        
        if role_name in ['Admin', 'Doctor', 'Nurse', 'Receptionist']:
            return Bill.objects.all()
        return Bill.objects.none()

class BillItemViewSet(viewsets.ModelViewSet):
    queryset = BillItem.objects.all()
    serializer_class = BillItemSerializer
    permission_classes = [IsAuthenticated]

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})

class AuditLogViewSet(viewsets.ModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminUser]

class LoginActivityViewSet(viewsets.ModelViewSet):
    serializer_class = LoginActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LoginActivity.objects.filter(user=self.request.user)

class SystemSettingViewSet(viewsets.ModelViewSet):
    queryset = SystemSetting.objects.all()
    serializer_class = SystemSettingSerializer
    permission_classes = [IsAdminUser]
class RoleChangeRequestViewSet(viewsets.ModelViewSet):
    queryset = RoleChangeRequest.objects.all().order_by("-created_at")
    serializer_class = RoleChangeRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role and user.role.name == "Admin":
            return RoleChangeRequest.objects.all().order_by("-created_at")
        return RoleChangeRequest.objects.filter(user=user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        role_change_request = self.get_object()
        if not request.user.role or request.user.role.name != "Admin":
            return Response({"error": "Only admins can approve role change requests"}, status=status.HTTP_403_FORBIDDEN)
        
        role_change_request.status = "approved"
        role_change_request.reviewed_by = request.user
        role_change_request.review_notes = request.data.get("review_notes", "")
        role_change_request.save()
        
        # Update user role
        role_change_request.user.role = role_change_request.requested_role
        role_change_request.user.save()
        
        serializer = self.get_serializer(role_change_request)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        role_change_request = self.get_object()
        if not request.user.role or request.user.role.name != "Admin":
            return Response({"error": "Only admins can reject role change requests"}, status=status.HTTP_403_FORBIDDEN)
        
        role_change_request.status = "rejected"
        role_change_request.reviewed_by = request.user
        role_change_request.review_notes = request.data.get("review_notes", "")
        role_change_request.save()
        
        serializer = self.get_serializer(role_change_request)
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def assign_role(self, request):
        user_id = request.data.get("user_id")
        role_id = request.data.get("role_id")
        
        if not request.user.role or request.user.role.name != "Admin":
            return Response({"error": "Only admins can assign roles"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            user = User.objects.get(id=user_id)
            role = Role.objects.get(id=role_id)
            user.role = role
            user.save()
            return Response({"message": f"Role assigned successfully to {user.username}"})
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Role.DoesNotExist:
            return Response({"error": "Role not found"}, status=status.HTTP_404_NOT_FOUND)



# Dashboard and Reports
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    """Main dashboard data endpoint"""
    today = date.today()

    # Basic stats
    total_patients = Patient.objects.count()
    today_appointments = Appointment.objects.filter(date=today).count()
    pending_bills = Bill.objects.filter(is_paid=False).count()
    total_revenue = Payment.objects.aggregate(total=models.Sum('amount'))['total'] or 0

    # Recent appointments
    recent_appointments = Appointment.objects.filter(
        date__gte=today
    ).order_by('date', 'time')[:5]

    # System health (simplified)
    system_health = {
        'database': 'healthy',
        'status': 'operational'
    }

    return Response({
        'total_patients': total_patients,
        'today_appointments': today_appointments,
        'pending_bills': pending_bills,
        'total_revenue': total_revenue,
        'recent_appointments': AppointmentSerializer(recent_appointments, many=True).data,
        'system_health': system_health,
        'notifications': [],
        'whats_new': [],
        'birthdays_today': [],
        'anniversaries': [],
        'patient_registrations_trend': [],
        'revenue_trend': [],
        'revenue_breakdown': []
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Dashboard statistics"""
    return Response({
        'total_patients': Patient.objects.count(),
        'total_appointments': Appointment.objects.count(),
        'total_bills': Bill.objects.count(),
        'total_revenue': Payment.objects.aggregate(total=models.Sum('amount'))['total'] or 0
    })

# Report endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def report_patient_count(request):
    """Patient count report"""
    total_patients = Patient.objects.count()
    return Response({
        'patient_count': total_patients,
        'report_date': timezone.now().date()
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def report_appointments_today(request):
    """Today's appointments report"""
    today = date.today()
    appointments = Appointment.objects.filter(date=today).select_related('patient', 'doctor')
    return Response({
        'appointments': AppointmentSerializer(appointments, many=True).data,
        'count': appointments.count(),
        'date': today
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def report_appointments_by_doctor(request):
    """Appointments grouped by doctor"""
    from django.db.models import Count
    appointments_by_doctor = Appointment.objects.values(
        'doctor__first_name', 'doctor__last_name'
    ).annotate(
        doctor_name=models.functions.Concat('doctor__first_name', models.Value(' '), 'doctor__last_name'),
        appointment_count=Count('id')
    ).order_by('-appointment_count')

    return Response({
        'appointments_by_doctor': list(appointments_by_doctor)
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def report_top_prescribed_medications(request):
    """Top prescribed medications report"""
    from django.db.models import Count
    top_medications = Prescription.objects.values('medication_name').annotate(
        count=Count('id')
    ).order_by('-count')[:10]

    return Response({
        'top_medications': list(top_medications)
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def report_billing_stats(request):
    """Billing statistics report"""
    from django.db.models import Sum, Count
    
    # Total revenue (sum of all payments)
    total_revenue = Payment.objects.aggregate(total=Sum('amount'))['total'] or 0
    
    # Pending bills (bills that are not fully paid)
    pending_bills = Bill.objects.filter(is_paid=False).aggregate(
        count=Count('id'),
        total=Sum('total_amount')
    )
    
    # Collections (payments received today)
    today = timezone.now().date()
    collections_today = Payment.objects.filter(
        payment_date__date=today
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    return Response({
        'total_revenue': float(total_revenue),
        'pending_bills_count': pending_bills['count'] or 0,
        'pending_bills_amount': float(pending_bills['total'] or 0),
        'collections_today': float(collections_today),
        'report_date': today
    })


# Profile and Preferences
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """User profile view"""
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_preferences_view(request):
    """User preferences view"""
    user = request.user
    if request.method == 'GET':
        return Response({
            'language_preference': user.language_preference,
            'preferences': user.preferences or {}
        })
    elif request.method == 'PUT':
        user.language_preference = request.data.get('language_preference', user.language_preference)
        user.preferences = request.data.get('preferences', user.preferences or {})
        user.save()
        return Response({
            'language_preference': user.language_preference,
            'preferences': user.preferences
        })

# Health check
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """System health check"""
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now(),
        'version': '1.0.0'
    })

# Sync offline data (placeholder)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_offline_data(request):
    """Sync offline data (placeholder implementation)"""
    return Response({'status': 'sync completed'})

# Database population endpoint
@api_view(['POST'])
@permission_classes([IsAdminUser])  # Only admin users can populate database
def populate_database(request):
    """Populate database with sample data"""
    try:
        from django.core.management import call_command
        from io import StringIO

        # Capture command output
        out = StringIO()
        call_command('populate_db', stdout=out, verbosity=2)

        output = out.getvalue()
        return Response({
            'status': 'success',
            'message': 'Database populated successfully',
            'output': output
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Failed to populate database: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
