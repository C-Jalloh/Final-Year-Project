import os
import django
from django.core.management.base import BaseCommand
from django.utils import timezone
from faker import Faker
import random
from datetime import date, datetime, timedelta
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chelal_backend_api.settings')
django.setup()

from core.models import Role, User, Patient, Appointment, Encounter, Prescription, Medication, Bill, BillItem, Payment, Notification, AuditLog, LoginActivity, SystemSetting

fake = Faker()

class Command(BaseCommand):
    help = 'Populate database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Starting database population...')

        # Create roles first
        self.create_roles()

        # Create users for all roles
        self.create_users()

        # Create patients
        self.create_patients()

        # Create medications
        self.create_medications()

        # Create appointments and encounters
        self.create_appointments_encounters()

        # Create prescriptions
        self.create_prescriptions()

        # Create billing data
        self.create_billing_data()

        # Create notifications
        self.create_notifications()

        # Create system settings
        self.create_system_settings()

        self.stdout.write('Database population completed successfully!')

    def create_roles(self):
        roles = [
            {'name': 'Admin', 'description': 'System administrator with full access'},
            {'name': 'Doctor', 'description': 'Medical doctor with patient care access'},
            {'name': 'Nurse', 'description': 'Nursing staff with patient care access'},
            {'name': 'Receptionist', 'description': 'Front desk staff managing appointments'},
            {'name': 'Pharmacist', 'description': 'Pharmacy staff managing medications'},
            {'name': 'Lab Technician', 'description': 'Laboratory staff managing tests'},
            {'name': 'Patient', 'description': 'Patient with limited access to own records'},
        ]

        for role_data in roles:
            Role.objects.get_or_create(
                name=role_data['name'],
                defaults={'description': role_data['description']}
            )

        self.stdout.write('Created roles')

    def create_users(self):
        # Create admin user
        admin_role = Role.objects.get(name='Admin')
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@chelal.com',
                'first_name': 'System',
                'last_name': 'Administrator',
                'role': admin_role,
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()

        # Create doctors
        doctor_role = Role.objects.get(name='Doctor')
        for i in range(5):
            username = f"doctor_{i+1}"
            email = f"{username}@chelal.com"

            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': fake.first_name(),
                    'last_name': fake.last_name(),
                    'role': doctor_role,
                }
            )

            if created:
                user.set_password('password123')
                user.save()

        # Create nurses
        nurse_role = Role.objects.get(name='Nurse')
        for i in range(3):
            username = f"nurse_{i+1}"
            email = f"{username}@chelal.com"

            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': fake.first_name(),
                    'last_name': fake.last_name(),
                    'role': nurse_role,
                }
            )

            if created:
                user.set_password('password123')
                user.save()

        # Create receptionists
        receptionist_role = Role.objects.get(name='Receptionist')
        for i in range(2):
            username = f"receptionist_{i+1}"
            email = f"{username}@chelal.com"

            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': fake.first_name(),
                    'last_name': fake.last_name(),
                    'role': receptionist_role,
                }
            )

            if created:
                user.set_password('password123')
                user.save()

        self.stdout.write('Created users')

    def create_patients(self):
        for _ in range(50):
            # Generate unique ID
            unique_id = f"P{fake.random_number(digits=8, fix_len=True)}"

            Patient.objects.get_or_create(
                unique_id=unique_id,
                defaults={
                    'first_name': fake.first_name(),
                    'last_name': fake.last_name(),
                    'date_of_birth': fake.date_of_birth(minimum_age=1, maximum_age=90),
                    'gender': random.choice(['Male', 'Female']),
                    'contact_info': fake.phone_number(),
                    'address': fake.address(),
                    'known_allergies': fake.text(max_nb_chars=100) if random.choice([True, False]) else '',
                }
            )

        self.stdout.write('Created patients')

    def create_medications(self):
        medications_data = [
            {'name': 'Paracetamol', 'generic_name': 'Acetaminophen', 'description': 'Pain relief medication', 'unit': 'tablet'},
            {'name': 'Ibuprofen', 'generic_name': 'Ibuprofen', 'description': 'Anti-inflammatory medication', 'unit': 'tablet'},
            {'name': 'Amoxicillin', 'generic_name': 'Amoxicillin', 'description': 'Antibiotic', 'unit': 'capsule'},
            {'name': 'Omeprazole', 'generic_name': 'Omeprazole', 'description': 'Proton pump inhibitor', 'unit': 'capsule'},
            {'name': 'Metformin', 'generic_name': 'Metformin', 'description': 'Diabetes medication', 'unit': 'tablet'},
            {'name': 'Amlodipine', 'generic_name': 'Amlodipine', 'description': 'Blood pressure medication', 'unit': 'tablet'},
            {'name': 'Simvastatin', 'generic_name': 'Simvastatin', 'description': 'Cholesterol medication', 'unit': 'tablet'},
            {'name': 'Losartan', 'generic_name': 'Losartan', 'description': 'Blood pressure medication', 'unit': 'tablet'},
            {'name': 'Prednisone', 'generic_name': 'Prednisone', 'description': 'Steroid medication', 'unit': 'tablet'},
            {'name': 'Warfarin', 'generic_name': 'Warfarin', 'description': 'Blood thinner', 'unit': 'tablet'},
        ]

        for med_data in medications_data:
            Medication.objects.get_or_create(
                name=med_data['name'],
                defaults={
                    'generic_name': med_data['generic_name'],
                    'description': med_data['description'],
                    'unit': med_data['unit'],
                    'current_stock': random.randint(50, 200),
                    'reorder_level': random.randint(10, 50),
                }
            )

        self.stdout.write('Created medications')

    def create_appointments_encounters(self):
        patients = list(Patient.objects.all())
        doctors = list(User.objects.filter(role__name='Doctor'))

        if not patients or not doctors:
            self.stdout.write('No patients or doctors found, skipping appointments')
            return

        for _ in range(100):
            patient = random.choice(patients)
            doctor = random.choice(doctors)

            # Create appointment
            appointment_date = fake.date_between(start_date='-30d', end_date='+30d')
            appointment_time = fake.time()

            appointment = Appointment.objects.create(
                patient=patient,
                doctor=doctor,
                date=appointment_date,
                time=appointment_time,
                status=random.choice(['scheduled', 'completed', 'cancelled']),
                notes=fake.text(max_nb_chars=200) if random.choice([True, False]) else '',
            )

            # Create encounter for completed appointments
            if appointment.status == 'completed':
                encounter = Encounter.objects.create(
                    patient=patient,
                    appointment=appointment,
                    doctor=doctor,
                    notes=fake.text(max_nb_chars=300),
                    diagnosis=fake.sentence() if random.choice([True, False]) else '',
                )

        self.stdout.write('Created appointments and encounters')

    def create_prescriptions(self):
        encounters = list(Encounter.objects.all())
        medications = list(Medication.objects.all())

        if not encounters or not medications:
            self.stdout.write('Missing data for prescriptions, skipping')
            return

        for encounter in encounters[:30]:  # Create prescriptions for some encounters
            num_meds = random.randint(1, 3)
            selected_meds = random.sample(medications, min(num_meds, len(medications)))

            for medication in selected_meds:
                Prescription.objects.create(
                    encounter=encounter,
                    medication_name=medication.name,
                    dosage=f"{random.randint(1, 4)} {medication.unit} {random.choice(['daily', 'twice daily', 'three times daily'])}",
                    frequency=random.choice(['Once daily', 'Twice daily', 'Three times daily', 'Four times daily']),
                    duration=f"{random.randint(3, 14)} days",
                    instructions=fake.text(max_nb_chars=100),
                )

        self.stdout.write('Created prescriptions')

    def create_billing_data(self):
        encounters = list(Encounter.objects.all())

        if not encounters:
            self.stdout.write('No encounters found, skipping billing')
            return

        for encounter in encounters[:40]:  # Create bills for some encounters
            # Create bill
            bill = Bill.objects.create(
                patient=encounter.patient,
                encounter=encounter,
                total_amount=Decimal(str(random.uniform(50, 500))).quantize(Decimal('0.01')),
                is_paid=random.choice([True, False]),
                notes=fake.text(max_nb_chars=100) if random.choice([True, False]) else '',
            )

            # Create bill items
            num_items = random.randint(1, 4)
            for _ in range(num_items):
                BillItem.objects.create(
                    bill=bill,
                    description=fake.text(max_nb_chars=50),
                    quantity=random.randint(1, 5),
                    amount=Decimal(str(random.uniform(10, 100))).quantize(Decimal('0.01')),
                )

            # Create payments for paid bills
            if bill.is_paid:
                Payment.objects.create(
                    bill=bill,
                    amount=bill.total_amount,
                )

        self.stdout.write('Created billing data')

    def create_notifications(self):
        users = list(User.objects.all())
        appointments = list(Appointment.objects.all())

        if not users:
            self.stdout.write('No users found, skipping notifications')
            return

        for _ in range(30):
            recipient = random.choice(users)
            Notification.objects.create(
                user=recipient,
                title=fake.sentence(nb_words=5),
                message=fake.text(max_nb_chars=200),
                type=random.choice(['appointment', 'medication', 'system', 'billing']),
                is_read=random.choice([True, False]),
                related_appointment=random.choice(appointments) if random.choice([True, False]) and appointments else None,
            )

        self.stdout.write('Created notifications')

    def create_system_settings(self):
        settings_data = [
            {'key': 'hospital_name', 'value': 'Chelal Hospital Management System', 'description': 'Name of the hospital', 'category': 'general'},
            {'key': 'hospital_address', 'value': fake.address(), 'description': 'Hospital address', 'category': 'general'},
            {'key': 'hospital_phone', 'value': fake.phone_number(), 'description': 'Hospital phone number', 'category': 'general'},
            {'key': 'working_hours_start', 'value': '08:00', 'description': 'Working hours start time', 'category': 'schedule'},
            {'key': 'working_hours_end', 'value': '18:00', 'description': 'Working hours end time', 'category': 'schedule'},
            {'key': 'appointment_duration', 'value': '30', 'description': 'Default appointment duration in minutes', 'category': 'appointments'},
            {'key': 'max_patients_per_day', 'value': '50', 'description': 'Maximum patients per day per doctor', 'category': 'capacity'},
            {'key': 'notification_email_enabled', 'value': 'true', 'description': 'Enable email notifications', 'category': 'notifications'},
            {'key': 'sms_enabled', 'value': 'false', 'description': 'Enable SMS notifications', 'category': 'notifications'},
        ]

        for setting_data in settings_data:
            SystemSetting.objects.get_or_create(
                key=setting_data['key'],
                defaults={
                    'value': setting_data['value'],
                    'description': setting_data['description'],
                    'category': setting_data['category'],
                    'is_public': True,
                }
            )

        self.stdout.write('Created system settings')