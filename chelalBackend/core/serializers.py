from rest_framework import serializers
from .models import Role, User, Patient, Appointment, Encounter, Prescription, Medication, Bill, BillItem, Payment, Notification, AuditLog, LoginActivity, SystemSetting, RoleChangeRequest
from datetime import date, timedelta
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    role_id = serializers.IntegerField(write_only=True, required=False)
    profile_image = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'role_id', 'language_preference', 'preferences', 'profile_image', 'two_factor_enabled']
    
    def create(self, validated_data):
        role_id = validated_data.pop('role_id', None)
        user = super().create(validated_data)
        if role_id:
            try:
                role = Role.objects.get(id=role_id)
                user.role = role
                user.save()
            except Role.DoesNotExist:
                pass
        return user
    
    def update(self, instance, validated_data):
        role_id = validated_data.pop('role_id', None)
        user = super().update(instance, validated_data)
        if role_id is not None:
            try:
                role = Role.objects.get(id=role_id)
                user.role = role
                user.save()
            except Role.DoesNotExist:
                pass
        return user

class PatientSerializer(serializers.ModelSerializer):
    # has_recent_appointment = serializers.SerializerMethodField()
    class Meta:
        model = Patient
        fields = '__all__'
        extra_kwargs = {
            'unique_id': {'required': False, 'read_only': True},
        }

    # def get_has_recent_appointment(self, obj):
    #     recent_cutoff = date.today() - timedelta(days=30)
    #     return Appointment.objects.filter(
    #         patient=obj,
    #         date__gte=recent_cutoff
    #     ).exists()

    def create(self, validated_data):
        # Auto-generate unique_id if not provided
        if 'unique_id' not in validated_data or not validated_data['unique_id']:
            from django.utils.crypto import get_random_string
            validated_data['unique_id'] = get_random_string(8).upper()
        return super().create(validated_data)

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = '__all__'

    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}"

    def get_doctor_name(self, obj):
        return obj.doctor.get_full_name() or obj.doctor.username

class EncounterSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)

    class Meta:
        model = Encounter
        fields = '__all__'

class PrescriptionSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)

    class Meta:
        model = Prescription
        fields = '__all__'

class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = '__all__'

class BillItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillItem
        fields = '__all__'

class BillSerializer(serializers.ModelSerializer):
    items = BillItemSerializer(many=True, read_only=True)
    payments = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)

    class Meta:
        model = Bill
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='bill.patient.full_name', read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class AuditLogSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    class Meta:
        model = AuditLog
        fields = '__all__'

class LoginActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginActivity
        fields = ['id', 'user', 'timestamp', 'ip_address', 'user_agent', 'status']
        read_only_fields = ['id', 'user', 'timestamp', 'ip_address', 'user_agent', 'status']

class SystemSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSetting
        fields = '__all__'

class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all(), required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'role']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserPreferencesSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(required=False, allow_null=True)
    class Meta:
        model = User
        fields = ['preferences', 'language_preference', 'profile_image', 'two_factor_enabled']

    def update(self, instance, validated_data):
        # Handle profile image update
        profile_image = validated_data.pop('profile_image', None)
        if profile_image:
            instance.profile_image = profile_image
        # Update preferences and other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
class RoleChangeRequestSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    requested_role_name = serializers.CharField(source='requested_role.name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True, allow_null=True)
    
    class Meta:
        model = RoleChangeRequest
        fields = [
            'id', 'user', 'user_name', 'requested_role', 'requested_role_name', 
            'reason', 'status', 'reviewed_by', 'reviewed_by_name', 'review_notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'reviewed_by', 'reviewed_by_name', 'review_notes']

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = get_user_model().USERNAME_FIELD

    def validate(self, attrs):
        # Allow login with either username or email
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            # Try to get user by username first
            user = None
            try:
                user = get_user_model().objects.get(username=username)
            except get_user_model().DoesNotExist:
                # If not found by username, try email
                try:
                    user = get_user_model().objects.get(email=username)
                except get_user_model().DoesNotExist:
                    pass

            if user and user.check_password(password):
                attrs['username'] = user.username  # Ensure we use the actual username
            else:
                raise serializers.ValidationError('No active account found with the given credentials')
        else:
            raise serializers.ValidationError('Must include username and password')

        return super().validate(attrs)
