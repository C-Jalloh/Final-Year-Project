from django.core.mail import send_mail
from django.conf import settings

def send_appointment_email(appointment):
    """
    Send an appointment confirmation email to the patient.
    :param appointment: Appointment object
    :return: (success, error_message)
    """
    try:
        subject = f"Appointment Confirmation - {appointment.date}"
        message = f"""
        Dear {appointment.patient.first_name} {appointment.patient.last_name},

        Your appointment has been scheduled for:
        Date: {appointment.date}
        Time: {appointment.time}
        Doctor: Dr. {appointment.doctor.get_full_name() or appointment.doctor.username}
        Status: {appointment.status}

        Notes: {appointment.notes or 'None'}

        Please arrive 15 minutes early for your appointment.

        Best regards,
        CHELAL Hospital Management System
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [appointment.patient.contact_info],  # Assuming contact_info contains email
            fail_silently=False,
        )
        return True, ''
    except Exception as e:
        return False, str(e)

def send_email(to_email, subject, message):
    """
    Send an appointment-related email.
    :param to_email: Recipient email address
    :param subject: Email subject
    :param message: Email body
    :return: (success, error_message)
    """
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [to_email],
            fail_silently=False,
        )
        return True, ''
    except Exception as e:
        return False, str(e)
