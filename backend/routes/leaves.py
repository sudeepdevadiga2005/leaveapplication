from flask import Blueprint, request, jsonify, session, current_app
from models import Leave, Student, Lecturer, LecturerAssignment, Class, Management
from extensions import db
from mail_service import (
    notify_student_leave_submitted_to_lecturer,
    notify_student_leave_rejected_by_lecturer,
    notify_student_leave_approved_by_lecturer,
    notify_admin_student_leave_forwarded,
    notify_student_leave_final_decision,
    notify_lecturer_leave_submitted_to_admin,
    notify_lecturer_leave_final_decision
)
from datetime import datetime

leaves_bp = Blueprint('leaves', __name__)

def current_user():
    return session.get('user_id'), session.get('user_role')

def get_admin_emails():
    admins = Management.query.all()
    return [a.email for a in admins]

# ── Apply Leave ───────────────────────────────────────────────
@leaves_bp.route('/apply', methods=['POST'])
def apply_leave():
    uid, role = current_user()
    if not uid:
        return jsonify({'error': 'Not authenticated'}), 401

    d = request.get_json()

    if role == 'student':
        student = Student.query.get(uid)
        
        # Check for mentor logic from remote, but ensure the email is sent
        # For simplicity and to satisfy the 'Automatic to Lecturer' requirement, we search for all assigned lecturers
        assignments = LecturerAssignment.query.join(Class).filter(
            Class.class_name == student.class_name
        ).all()
        
        initial_status = 'Pending with Lecturer'

        leave = Leave(
            applicant_id=uid, applicant_role='student',
            applicant_name=student.student_name,
            email=student.email, department=student.department,
            class_name=student.class_name,
            leave_type=d['leave_type'], reason=d['reason'],
            from_date=d['from_date'], to_date=d['to_date'],
            days=d.get('days', 1), status=initial_status
        )
        db.session.add(leave)
        db.session.commit()

        # Email assigned lecturers
        for a in assignments:
            lec = Lecturer.query.get(a.lecturer_id)
            if lec:
                notify_student_leave_submitted_to_lecturer(
                    lecturer_name=lec.lecturer_name,
                    lecturer_email=lec.email,
                    student_name=student.student_name,
                    leave_type=leave.leave_type,
                    from_date=leave.from_date,
                    to_date=leave.to_date,
                    reason=leave.reason
                )

    elif role == 'lecturer':
        lec = Lecturer.query.get(uid)
        leave = Leave(
            applicant_id=uid, applicant_role='lecturer',
            applicant_name=lec.lecturer_name, email=lec.email,
            department=lec.department, class_name='',
            leave_type=d['leave_type'], reason=d['reason'],
            from_date=d['from_date'], to_date=d['to_date'],
            days=d.get('days', 1), status='Pending with Admin'
        )
        db.session.add(leave)
        db.session.commit()
        
        # Notify Admin
        admin_emails = get_admin_emails()
        for email in admin_emails:
            notify_lecturer_leave_submitted_to_admin(
                admin_email=email,
                lecturer_name=lec.lecturer_name,
                leave_type=leave.leave_type,
                from_date=leave.from_date,
                to_date=leave.to_date,
                reason=leave.reason
            )
    else:
        return jsonify({'error': 'Only students and lecturers can apply'}), 403

    return jsonify(leave.to_dict()), 201


# ── My Leaves ─────────────────────────────────────────────────
@leaves_bp.route('/my', methods=['GET'])
def my_leaves():
    uid, role = current_user()
    if not uid:
        return jsonify({'error': 'Not authenticated'}), 401
    leaves = Leave.query.filter_by(applicant_id=uid, applicant_role=role).order_by(Leave.id.desc()).all()
    return jsonify([l.to_dict() for l in leaves]), 200


# ── Student requests visible to Lecturer ─────────────────────
@leaves_bp.route('/student-requests', methods=['GET'])
def student_requests():
    uid, role = current_user()
    if role != 'lecturer':
        return jsonify({'error': 'Forbidden'}), 403

    assignments = LecturerAssignment.query.filter_by(lecturer_id=uid).all()
    class_names = [Class.query.get(a.class_id).class_name for a in assignments if Class.query.get(a.class_id)]

    leaves = Leave.query.filter(
        Leave.applicant_role == 'student',
        Leave.class_name.in_(class_names)
    ).order_by(Leave.id.desc()).all()
    return jsonify([l.to_dict() for l in leaves]), 200


# ── Lecturer requests (for Admin) ─────────────────────────────
@leaves_bp.route('/admin/lecturer-requests', methods=['GET'])
def admin_lecturer_requests():
    _, role = current_user()
    if role != 'management':
        return jsonify({'error': 'Forbidden'}), 403
    leaves = Leave.query.filter_by(applicant_role='lecturer').order_by(Leave.id.desc()).all()
    return jsonify([l.to_dict() for l in leaves]), 200

# ── Student requests forwarded (for Admin) ────────────────────
@leaves_bp.route('/admin/student-requests', methods=['GET'])
def admin_student_requests():
    _, role = current_user()
    if role != 'management':
        return jsonify({'error': 'Forbidden'}), 403
    
    # Show student leaves that are either forwarded to admin or already decided by admin
    leaves = Leave.query.filter(
        Leave.applicant_role == 'student',
        Leave.status.in_([
            'Approved by Lecturer and Forwarded to Admin',
            'Pending with Admin',
            'Approved by Admin',
            'Rejected by Admin'
        ])
    ).order_by(Leave.id.desc()).all()
    return jsonify([l.to_dict() for l in leaves]), 200


# ── Approve ───────────────────────────────────────────────────
@leaves_bp.route('/approve/<int:lid>', methods=['POST'])
def approve(lid):
    uid, role = current_user()
    leave = Leave.query.get_or_404(lid)
    d = request.get_json() or {}
    remarks = d.get('remarks', 'Approved.')

    if role == 'lecturer':
        if leave.status != 'Pending with Lecturer':
            return jsonify({'error': 'Already processed or not in your pending list'}), 400
        
        leave.status     = 'Approved by Lecturer and Forwarded to Admin'
        leave.handled_by = uid
        leave.remarks    = remarks
        leave.updated_at = datetime.utcnow()
        db.session.commit()

        # Notify Student
        notify_student_leave_approved_by_lecturer(
            student_name=leave.applicant_name,
            student_email=leave.email,
            leave_type=leave.leave_type,
            from_date=leave.from_date,
            to_date=leave.to_date
        )
        
        # Notify Admin
        admin_emails = get_admin_emails()
        for email in admin_emails:
            notify_admin_student_leave_forwarded(
                admin_email=email,
                student_name=leave.applicant_name,
                leave_type=leave.leave_type,
                from_date=leave.from_date,
                to_date=leave.to_date
            )

    elif role == 'management':
        if leave.status not in ('Approved by Lecturer and Forwarded to Admin', 'Pending with Admin'):
            return jsonify({'error': 'Leave not in a state for Admin approval'}), 400
        
        leave.status     = 'Approved by Admin'
        leave.handled_by = uid
        leave.remarks    = remarks
        leave.updated_at = datetime.utcnow()
        db.session.commit()

        if leave.applicant_role == 'student':
            notify_student_leave_final_decision(
                student_name=leave.applicant_name,
                student_email=leave.email,
                leave_type=leave.leave_type,
                from_date=leave.from_date,
                to_date=leave.to_date,
                status='Approved by Admin',
                remarks=remarks
            )
        else:
            notify_lecturer_leave_final_decision(
                lecturer_name=leave.applicant_name,
                lecturer_email=leave.email,
                leave_type=leave.leave_type,
                from_date=leave.from_date,
                to_date=leave.to_date,
                status='Approved by Admin',
                remarks=remarks
            )
    else:
        return jsonify({'error': 'Forbidden'}), 403

    return jsonify(leave.to_dict()), 200


# ── Reject ────────────────────────────────────────────────────
@leaves_bp.route('/reject/<int:lid>', methods=['POST'])
def reject(lid):
    uid, role = current_user()
    leave = Leave.query.get_or_404(lid)
    d = request.get_json() or {}
    remarks = d.get('remarks', 'Rejected.')

    if role == 'lecturer':
        if leave.status != 'Pending with Lecturer':
            return jsonify({'error': 'Already processed or not in your pending list'}), 400
        
        leave.status     = 'Rejected by Lecturer'
        leave.handled_by = uid
        leave.remarks    = remarks
        leave.updated_at = datetime.utcnow()
        db.session.commit()

        notify_student_leave_rejected_by_lecturer(
            student_name=leave.applicant_name,
            student_email=leave.email,
            leave_type=leave.leave_type,
            from_date=leave.from_date,
            to_date=leave.to_date,
            remarks=remarks
        )

    elif role == 'management':
        if leave.status not in ('Approved by Lecturer and Forwarded to Admin', 'Pending with Admin'):
            return jsonify({'error': 'Leave not in a state for Admin rejection'}), 400
            
        leave.status     = 'Rejected by Admin'
        leave.handled_by = uid
        leave.remarks    = remarks
        leave.updated_at = datetime.utcnow()
        db.session.commit()

        if leave.applicant_role == 'student':
            notify_student_leave_final_decision(
                student_name=leave.applicant_name,
                student_email=leave.email,
                leave_type=leave.leave_type,
                from_date=leave.from_date,
                to_date=leave.to_date,
                status='Rejected by Admin',
                remarks=remarks
            )
        else:
            notify_lecturer_leave_final_decision(
                lecturer_name=leave.applicant_name,
                lecturer_email=leave.email,
                leave_type=leave.leave_type,
                from_date=leave.from_date,
                to_date=leave.to_date,
                status='Rejected by Admin',
                remarks=remarks
            )
    else:
        return jsonify({'error': 'Forbidden'}), 403

    return jsonify(leave.to_dict()), 200
