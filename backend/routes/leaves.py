from flask import Blueprint, request, jsonify, session
from extensions import get_db
from models import Leave, Student, Lecturer, LecturerAssignment, Class, Management, Notification
from mail_service import (
    notify_student_leave_submitted_to_lecturer,
    notify_student_leave_rejected_by_lecturer,
    notify_student_leave_approved_by_lecturer,
    notify_admin_student_leave_forwarded,
    notify_student_leave_final_decision,
    notify_lecturer_leave_submitted_to_admin,
    notify_lecturer_leave_final_decision
)

leaves_bp = Blueprint('leaves', __name__)


def current_user():
    return session.get('user_id'), session.get('user_role')


# ── Apply Leave ───────────────────────────────────────────────
@leaves_bp.route('/apply', methods=['POST'])
def apply_leave():
    uid, role = current_user()
    if not uid:
        return jsonify({'error': 'Not authenticated'}), 401

    d  = request.get_json()
    db = get_db()

    if role == 'student':
        student = Student(db).find_by_id(uid)
        assignments = LecturerAssignment(db).find_by_class(
            next((c['id'] for c in Class(db).all() if c['class_name'] == student['class_name']), None)
        )

        leave_id = Leave(db).create({
            'applicant_id':   uid,
            'applicant_role': 'student',
            'applicant_name': student['student_name'],
            'email':          student['email'],
            'department':     student['department'],
            'class_name':     student['class_name'],
            'leave_type':     d['leave_type'],
            'reason':         d['reason'],
            'from_date':      d['from_date'],
            'to_date':        d['to_date'],
            'days':           d.get('days', 1),
            'status':         'Pending with Lecturer',
            'remarks':        '',
        })

        for a in assignments:
            lec = Lecturer(db).find_by_id(a['lecturer_id'])
            if lec:
                Notification(db).create({'user_id': lec['id'], 'role': 'lecturer',
                    'message': f"New leave request from {student['student_name']}"})
                notify_student_leave_submitted_to_lecturer(
                    lecturer_name=lec['lecturer_name'], lecturer_email=lec['email'],
                    student_name=student['student_name'], leave_type=d['leave_type'],
                    from_date=d['from_date'], to_date=d['to_date'], reason=d['reason']
                )

    elif role == 'lecturer':
        lec = Lecturer(db).find_by_id(uid)
        leave_id = Leave(db).create({
            'applicant_id':   uid,
            'applicant_role': 'lecturer',
            'applicant_name': lec['lecturer_name'],
            'email':          lec['email'],
            'department':     lec['department'],
            'class_name':     '',
            'leave_type':     d['leave_type'],
            'reason':         d['reason'],
            'from_date':      d['from_date'],
            'to_date':        d['to_date'],
            'days':           d.get('days', 1),
            'status':         'Pending with Admin',
            'remarks':        '',
        })

        for admin in Management(db).all():
            Notification(db).create({'user_id': admin['id'], 'role': 'management',
                'message': f"New leave request from Lecturer {lec['lecturer_name']}"})

        for admin in Management(db).all():
            notify_lecturer_leave_submitted_to_admin(
                admin_email=admin['email'], lecturer_name=lec['lecturer_name'],
                leave_type=d['leave_type'], from_date=d['from_date'],
                to_date=d['to_date'], reason=d['reason']
            )
    else:
        return jsonify({'error': 'Only students and lecturers can apply'}), 403

    leave = Leave(db).find_by_id(leave_id)
    return jsonify(Leave(db).to_dict(leave)), 201


# ── My Leaves ─────────────────────────────────────────────────
@leaves_bp.route('/my', methods=['GET'])
def my_leaves():
    uid, role = current_user()
    if not uid:
        return jsonify({'error': 'Not authenticated'}), 401
    db = get_db()
    leaves = Leave(db).find_by_applicant(uid, role)
    return jsonify([Leave(db).to_dict(l) for l in leaves]), 200


# ── Student requests visible to Lecturer ─────────────────────
@leaves_bp.route('/student-requests', methods=['GET'])
def student_requests():
    uid, role = current_user()
    if role != 'lecturer':
        return jsonify({'error': 'Forbidden'}), 403

    db = get_db()
    assignments = LecturerAssignment(db).find_by_lecturer(uid)
    class_names = []
    for a in assignments:
        cls = Class(db).find_by_id(a['class_id'])
        if cls:
            class_names.append(cls['class_name'])

    leaves = Leave(db).find_by_class_names(class_names)
    return jsonify([Leave(db).to_dict(l) for l in leaves]), 200


# ── Lecturer requests (for Admin) ─────────────────────────────
@leaves_bp.route('/admin/lecturer-requests', methods=['GET'])
def admin_lecturer_requests():
    _, role = current_user()
    if role != 'management':
        return jsonify({'error': 'Forbidden'}), 403
    db = get_db()
    leaves = Leave(db).find_by_role('lecturer')
    return jsonify([Leave(db).to_dict(l) for l in leaves]), 200


# ── Student requests forwarded (for Admin) ────────────────────
@leaves_bp.route('/admin/student-requests', methods=['GET'])
def admin_student_requests():
    _, role = current_user()
    if role != 'management':
        return jsonify({'error': 'Forbidden'}), 403
    db = get_db()
    leaves = Leave(db).find_admin_student_leaves()
    return jsonify([Leave(db).to_dict(l) for l in leaves]), 200


# ── Approve ───────────────────────────────────────────────────
@leaves_bp.route('/approve/<lid>', methods=['POST'])
def approve(lid):
    uid, role = current_user()
    db = get_db()
    leave_model = Leave(db)
    leave = leave_model.find_by_id(lid)
    if not leave:
        return jsonify({'error': 'Leave not found'}), 404

    d       = request.get_json() or {}
    remarks = d.get('remarks', 'Approved.')

    if role == 'lecturer':
        if leave['status'] != 'Pending with Lecturer':
            return jsonify({'error': 'Already processed or not in your pending list'}), 400
        leave_model.update(lid, {'status': 'Approved by Lecturer and Forwarded to Admin',
                                  'handled_by': uid, 'remarks': remarks})
        Notification(db).create({'user_id': leave['applicant_id'], 'role': 'student',
            'message': 'Your leave request has been approved by Lecturer.'})
        for admin in Management(db).all():
            Notification(db).create({'user_id': admin['id'], 'role': 'management',
                'message': f"Leave request from {leave['applicant_name']} forwarded by Lecturer."})

        notify_student_leave_approved_by_lecturer(
            student_name=leave['applicant_name'], student_email=leave['email'],
            leave_type=leave['leave_type'], from_date=leave['from_date'], to_date=leave['to_date']
        )
        for admin in Management(db).all():
            notify_admin_student_leave_forwarded(
                admin_email=admin['email'], student_name=leave['applicant_name'],
                leave_type=leave['leave_type'], from_date=leave['from_date'], to_date=leave['to_date']
            )

    elif role == 'management':
        if leave['status'] not in ('Approved by Lecturer and Forwarded to Admin', 'Pending with Admin'):
            return jsonify({'error': 'Leave not in a state for Admin approval'}), 400
        leave_model.update(lid, {'status': 'Approved by Admin', 'handled_by': uid, 'remarks': remarks})
        Notification(db).create({'user_id': leave['applicant_id'], 'role': leave['applicant_role'],
            'message': 'Your leave request has been Approved by Admin.'})

        if leave['applicant_role'] == 'student':
            notify_student_leave_final_decision(
                student_name=leave['applicant_name'], student_email=leave['email'],
                leave_type=leave['leave_type'], from_date=leave['from_date'],
                to_date=leave['to_date'], status='Approved by Admin', remarks=remarks
            )
        else:
            notify_lecturer_leave_final_decision(
                lecturer_name=leave['applicant_name'], lecturer_email=leave['email'],
                leave_type=leave['leave_type'], from_date=leave['from_date'],
                to_date=leave['to_date'], status='Approved by Admin', remarks=remarks
            )
    else:
        return jsonify({'error': 'Forbidden'}), 403

    return jsonify(leave_model.to_dict(leave_model.find_by_id(lid))), 200


# ── Reject ────────────────────────────────────────────────────
@leaves_bp.route('/reject/<lid>', methods=['POST'])
def reject(lid):
    uid, role = current_user()
    db = get_db()
    leave_model = Leave(db)
    leave = leave_model.find_by_id(lid)
    if not leave:
        return jsonify({'error': 'Leave not found'}), 404

    d       = request.get_json() or {}
    remarks = d.get('remarks', 'Rejected.')

    if role == 'lecturer':
        if leave['status'] != 'Pending with Lecturer':
            return jsonify({'error': 'Already processed or not in your pending list'}), 400
        leave_model.update(lid, {'status': 'Rejected by Lecturer', 'handled_by': uid, 'remarks': remarks})
        Notification(db).create({'user_id': leave['applicant_id'], 'role': 'student',
            'message': 'Your leave request has been Rejected by Lecturer.'})
        notify_student_leave_rejected_by_lecturer(
            student_name=leave['applicant_name'], student_email=leave['email'],
            leave_type=leave['leave_type'], from_date=leave['from_date'],
            to_date=leave['to_date'], remarks=remarks
        )

    elif role == 'management':
        if leave['status'] not in ('Approved by Lecturer and Forwarded to Admin', 'Pending with Admin'):
            return jsonify({'error': 'Leave not in a state for Admin rejection'}), 400
        leave_model.update(lid, {'status': 'Rejected by Admin', 'handled_by': uid, 'remarks': remarks})
        Notification(db).create({'user_id': leave['applicant_id'], 'role': leave['applicant_role'],
            'message': 'Your leave request has been Rejected by Admin.'})

        if leave['applicant_role'] == 'student':
            notify_student_leave_final_decision(
                student_name=leave['applicant_name'], student_email=leave['email'],
                leave_type=leave['leave_type'], from_date=leave['from_date'],
                to_date=leave['to_date'], status='Rejected by Admin', remarks=remarks
            )
        else:
            notify_lecturer_leave_final_decision(
                lecturer_name=leave['applicant_name'], lecturer_email=leave['email'],
                leave_type=leave['leave_type'], from_date=leave['from_date'],
                to_date=leave['to_date'], status='Rejected by Admin', remarks=remarks
            )
    else:
        return jsonify({'error': 'Forbidden'}), 403

    return jsonify(leave_model.to_dict(leave_model.find_by_id(lid))), 200
