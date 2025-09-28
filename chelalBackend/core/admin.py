from django.contrib import admin
from .models import (
    Role, User, Patient, Appointment, Encounter, Prescription, Medication,
    Bill, BillItem, Payment, Notification, AuditLog, LoginActivity, SystemSetting
)

# Register core models
admin.site.register(Role)
admin.site.register(User)
admin.site.register(Patient)
admin.site.register(Appointment)
admin.site.register(Encounter)
admin.site.register(Prescription)
admin.site.register(Medication)
admin.site.register(Bill)
admin.site.register(BillItem)
admin.site.register(Payment)
admin.site.register(Notification)
admin.site.register(AuditLog)
admin.site.register(LoginActivity)
admin.site.register(SystemSetting)
