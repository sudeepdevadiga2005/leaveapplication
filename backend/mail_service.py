"""
AbsentAlert — Email Notification Service
Sends emails on leave events using Flask-Mail + Gmail SMTP.
"""

from flask_mail import Mail, Message
from flask import current_app

mail = Mail()

def _send(subject, recipients, body):
    """
    Send email. Checks MAIL_ENABLED flag first.
    Silently logs errors so the app never crashes if email fails.
    """
    # Use MAIL_ENABLED check from remote if present, otherwise default to True for now
    if not current_app.config.get('MAIL_ENABLED', True):
        print(f"[MAIL SKIPPED] Email not configured. Would have sent: {subject}")
        return

    try:
        msg = Message(
            subject=subject,
            sender=current_app.config.get('MAIL_USERNAME', 'noreply@absentalert.com'),
            recipients=recipients if isinstance(recipients, list) else [recipients],
        )
        msg.body = body
        mail.send(msg)
        print(f"[MAIL] Sent to {recipients}: {subject}")
    except Exception as e:
        print(f"[MAIL ERROR] Failed to send '{subject}' to {recipients}: {e}")

# 1. Student submits leave -> Notify Lecturer
def notify_student_leave_submitted_to_lecturer(lecturer_name, lecturer_email, student_name, leave_type, from_date, to_date, reason):
    subject = f"[AbsentAlert] Action Required: New Leave Request from {student_name}"
    body = f"""Dear {lecturer_name},

A new leave request has been submitted by {student_name} and requires your initial review.

Details:
Student    : {student_name}
Leave Type : {leave_type.capitalize()}
From       : {from_date}
To         : {to_date}
Reason     : {reason}

Please log in to the Lecturer Dashboard to Approve (and forward to Admin) or Reject this request.

Regards,
AbsentAlert System"""
    _send(subject, lecturer_email, body)

# 2. Lecturer rejects student leave -> Notify Student
def notify_student_leave_rejected_by_lecturer(student_name, student_email, leave_type, from_date, to_date, remarks):
    subject = f"[AbsentAlert] Leave Request Status Update - Rejected"
    body = f"""Dear {student_name},

Your leave request has been reviewed by your Lecturer and has been REJECTED.

Details:
Leave Type : {leave_type.capitalize()}
From       : {from_date}
To         : {to_date}
Status     : Rejected by Lecturer
Remarks    : {remarks or 'No remarks provided.'}

Regards,
AbsentAlert System"""
    _send(subject, student_email, body)

# 3. Lecturer approves and forwards -> Notify Student
def notify_student_leave_approved_by_lecturer(student_name, student_email, leave_type, from_date, to_date):
    subject = f"[AbsentAlert] Leave Request Status Update - Forwarded"
    body = f"""Dear {student_name},

Your leave request has been APPROVED by your Lecturer and has been forwarded to the Admin for final approval.

Details:
Leave Type : {leave_type.capitalize()}
From       : {from_date}
To         : {to_date}
Status     : Approved by Lecturer (Awaiting Admin Decision)

You will receive another email once the Admin makes the final decision.

Regards,
AbsentAlert System"""
    _send(subject, student_email, body)

# 4. Lecturer approves and forwards -> Notify Admin
def notify_admin_student_leave_forwarded(admin_email, student_name, leave_type, from_date, to_date):
    subject = f"[AbsentAlert] Action Required: Student Leave Request Forwarded"
    body = f"""Dear Admin,

A student leave request has been approved by the Lecturer and is now awaiting your final decision.

Details:
Student    : {student_name}
Leave Type : {leave_type.capitalize()}
From       : {from_date}
To         : {to_date}

Please log in to the Admin Dashboard to review and provide final approval or rejection.

Regards,
AbsentAlert System"""
    _send(subject, admin_email, body)

# 5. Admin final decision for student leave -> Notify Student
def notify_student_leave_final_decision(student_name, student_email, leave_type, from_date, to_date, status, remarks):
    subject = f"[AbsentAlert] Final Decision: Your Leave Request has been {status}"
    body = f"""Dear {student_name},

The Admin has made a final decision on your leave request.

Details:
Leave Type : {leave_type.capitalize()}
From       : {from_date}
To         : {to_date}
Status     : {status}
Remarks    : {remarks or 'No remarks provided.'}

Regards,
AbsentAlert System"""
    _send(subject, student_email, body)

# 6. Lecturer submits leave -> Notify Admin
def notify_lecturer_leave_submitted_to_admin(admin_email, lecturer_name, leave_type, from_date, to_date, reason):
    subject = f"[AbsentAlert] Action Required: New Lecturer Leave Request from {lecturer_name}"
    body = f"""Dear Admin,

A new leave request has been submitted by Lecturer {lecturer_name}.

Details:
Lecturer   : {lecturer_name}
Leave Type : {leave_type.capitalize()}
From       : {from_date}
To         : {to_date}
Reason     : {reason}

Please log in to the Admin Dashboard to review this request.

Regards,
AbsentAlert System"""
    _send(subject, admin_email, body)

# 7. Admin final decision for lecturer leave -> Notify Lecturer
def notify_lecturer_leave_final_decision(lecturer_name, lecturer_email, leave_type, from_date, to_date, status, remarks):
    subject = f"[AbsentAlert] Final Decision: Your Leave Request has been {status}"
    body = f"""Dear {lecturer_name},

The Admin has made a final decision on your leave request.

Details:
Leave Type : {leave_type.capitalize()}
From       : {from_date}
To         : {to_date}
Status     : {status}
Remarks    : {remarks or 'No remarks provided.'}

Regards,
AbsentAlert System"""
    _send(subject, lecturer_email, body)

