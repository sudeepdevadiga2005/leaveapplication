"""
AbsentAlert — Email Notification Service

Setup: See EMAIL_SETUP.md for step-by-step Gmail configuration.
"""

from flask_mail import Mail, Message

mail = Mail()


def _send(app, subject, recipients, body):
    """
    Send email. Checks MAIL_ENABLED flag first.
    Silently logs errors so the app never crashes if email fails.
    """
    if not app.config.get('MAIL_ENABLED', False):
        print(f"[MAIL SKIPPED] Email not configured. Would have sent: {subject}")
        return

    try:
        with app.app_context():
            msg = Message(
                subject=subject,
                sender=app.config.get('MAIL_DEFAULT_SENDER'),
                recipients=recipients if isinstance(recipients, list) else [recipients],
            )
            msg.body = body
            mail.send(msg)
            print(f"[MAIL] Sent to {recipients}: {subject}")
    except Exception as e:
        print(f"[MAIL ERROR] Failed to send '{subject}' to {recipients}: {e}")
        print("[MAIL ERROR] Check EMAIL_SETUP.md for configuration help.")


def notify_leave_submitted(app, student_name, leave_type, from_date, to_date,
                            reason, lecturer_email, lecturer_name):
    """Student submits leave → notify class mentor."""
    _send(
        app,
        subject=f"[AbsentAlert] New Leave Request from {student_name}",
        recipients=lecturer_email,
        body=f"""Dear {lecturer_name},

A new leave request has been submitted by your student and requires your review.

Student   : {student_name}
Leave Type: {leave_type.capitalize()}
From      : {from_date}
To        : {to_date}
Reason    : {reason}

Please log in to AbsentAlert to approve or reject this request.

Regards,
AbsentAlert System
"""
    )


def notify_leave_status(app, student_name, student_email,
                         leave_type, from_date, to_date, status, remarks):
    """Lecturer approves/rejects student leave → notify student."""
    _send(
        app,
        subject=f"[AbsentAlert] Your Leave Request has been {status}",
        recipients=student_email,
        body=f"""Dear {student_name},

Your leave request has been reviewed by your class mentor.

Leave Type: {leave_type.capitalize()}
From      : {from_date}
To        : {to_date}
Status    : {status}
Remarks   : {remarks or 'No remarks provided.'}

Please log in to AbsentAlert to view the full details.

Regards,
AbsentAlert System
"""
    )


def notify_lecturer_leave_status(app, lecturer_name, lecturer_email,
                                  leave_type, from_date, to_date, status, remarks):
    """Management approves/rejects lecturer leave → notify lecturer."""
    _send(
        app,
        subject=f"[AbsentAlert] Your Leave Request has been {status}",
        recipients=lecturer_email,
        body=f"""Dear {lecturer_name},

Your leave request has been reviewed by Management.

Leave Type: {leave_type.capitalize()}
From      : {from_date}
To        : {to_date}
Status    : {status}
Remarks   : {remarks or 'No remarks provided.'}

Please log in to AbsentAlert to view the full details.

Regards,
AbsentAlert System
"""
    )
