import traceback
from flask import Blueprint, request, jsonify, session
from models import Student, Lecturer, Management
from extensions import db
from werkzeug.security import check_password_hash, generate_password_hash

auth_bp = Blueprint('auth', __name__)

# ── Student Register ──────────────────────────────────────────
@auth_bp.route('/student/register', methods=['POST'])
def student_register():
    try:
        d = request.get_json(silent=True)
        if not d:
            return jsonify({'status': 'error', 'message': 'No JSON body received'}), 400

        required = ['roll_no', 'email', 'password', 'department', 'class_name']
        for f in required:
            if not d.get(f):
                return jsonify({'status': 'error', 'message': f'{f} is required'}), 400

        if Student.query.filter_by(roll_no=d['roll_no']).first():
            return jsonify({'status': 'error', 'message': 'Roll number already registered'}), 409
        if Student.query.filter_by(email=d['email']).first():
            return jsonify({'status': 'error', 'message': 'Email already registered'}), 409

        s = Student(
            roll_no=d['roll_no'],
            email=d['email'],
            password=generate_password_hash(d['password']),
            student_name=d.get('student_name', ''),
            department=d['department'],
            class_name=d['class_name'],
            semester=d.get('semester', '')
        )
        db.session.add(s)
        db.session.commit()
        print(f"[AUTH] Student registered: {d['email']}")
        return jsonify({'status': 'success', 'message': 'Student registered successfully'}), 201
    except Exception as e:
        print(f"[ERROR] student_register:\n{traceback.format_exc()}")
        return jsonify({'status': 'error', 'message': 'Registration failed. Please try again.'}), 500


# ── Student Login ─────────────────────────────────────────────
@auth_bp.route('/student/login', methods=['POST'])
def student_login():
    try:
        d = request.get_json(silent=True)
        if not d:
            return jsonify({'status': 'error', 'message': 'No JSON body received'}), 400

        identifier = d.get('identifier', '').strip()
        pwd        = d.get('password', '').strip()
        print(f"[AUTH] Student login attempt: {identifier}")

        student = (Student.query.filter_by(roll_no=identifier).first() or
                   Student.query.filter_by(email=identifier).first())
        if not student or not check_password_hash(student.password, pwd):
            return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401

        session['user_id']   = student.id
        session['user_role'] = 'student'
        print(f"[AUTH] Student login success: {identifier}")
        return jsonify({'status': 'success', 'user': {**student.to_dict(), 'role': 'student'}}), 200
    except Exception as e:
        print(f"[ERROR] student_login:\n{traceback.format_exc()}")
        return jsonify({'status': 'error', 'message': 'Login failed. Please try again.'}), 500


# ── Lecturer Register ─────────────────────────────────────────
@auth_bp.route('/lecturer/register', methods=['POST'])
def lecturer_register():
    try:
        d = request.get_json(silent=True)
        if not d:
            return jsonify({'status': 'error', 'message': 'No JSON body received'}), 400

        required = ['lecturer_name', 'email', 'password', 'department']
        for f in required:
            if not d.get(f):
                return jsonify({'status': 'error', 'message': f'{f} is required'}), 400

        if Lecturer.query.filter_by(email=d['email']).first():
            return jsonify({'status': 'error', 'message': 'Email already registered'}), 409

        l = Lecturer(
            lecturer_name=d['lecturer_name'],
            email=d['email'],
            password=generate_password_hash(d['password']),
            lecturer_id=d.get('lecturer_id', ''),
            department=d['department']
        )
        db.session.add(l)
        db.session.commit()
        print(f"[AUTH] Lecturer registered: {d['email']}")
        return jsonify({'status': 'success', 'message': 'Lecturer registered successfully'}), 201
    except Exception as e:
        print(f"[ERROR] lecturer_register:\n{traceback.format_exc()}")
        return jsonify({'status': 'error', 'message': 'Registration failed. Please try again.'}), 500


# ── Lecturer Login ────────────────────────────────────────────
@auth_bp.route('/lecturer/login', methods=['POST'])
def lecturer_login():
    try:
        d = request.get_json(silent=True)
        if not d:
            return jsonify({'status': 'error', 'message': 'No JSON body received'}), 400

        email = d.get('email', '').strip()
        pwd   = d.get('password', '')
        print(f"[AUTH] Lecturer login attempt: {email}")

        lec = Lecturer.query.filter_by(email=email).first()
        if not lec or not check_password_hash(lec.password, pwd):
            return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401

        session['user_id']   = lec.id
        session['user_role'] = 'lecturer'
        print(f"[AUTH] Lecturer login success: {email}")
        return jsonify({'status': 'success', 'user': {**lec.to_dict(), 'role': 'lecturer'}}), 200
    except Exception as e:
        print(f"[ERROR] lecturer_login:\n{traceback.format_exc()}")
        return jsonify({'status': 'error', 'message': 'Login failed. Please try again.'}), 500


# ── Management Login ──────────────────────────────────────────
@auth_bp.route('/management/login', methods=['POST'])
def management_login():
    try:
        d = request.get_json(silent=True)
        if not d:
            return jsonify({'status': 'error', 'message': 'No JSON body received'}), 400

        email = d.get('email', '').strip()
        pwd   = d.get('password', '')
        print(f"[AUTH] Management login attempt: {email}")

        mgmt = Management.query.filter_by(email=email).first()
        if not mgmt or not check_password_hash(mgmt.password, pwd):
            return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401

        session['user_id']   = mgmt.id
        session['user_role'] = 'management'
        print(f"[AUTH] Management login success: {email}")
        return jsonify({'status': 'success', 'user': {**mgmt.to_dict(), 'role': 'management'}}), 200
    except Exception as e:
        print(f"[ERROR] management_login:\n{traceback.format_exc()}")
        return jsonify({'status': 'error', 'message': 'Login failed. Please try again.'}), 500


# ── Me ────────────────────────────────────────────────────────
@auth_bp.route('/me', methods=['GET'])
def me():
    try:
        uid  = session.get('user_id')
        role = session.get('user_role')
        if not uid:
            return jsonify({'status': 'error', 'message': 'Not authenticated'}), 401

        if role == 'student':
            u = Student.query.get(uid)
            if not u:
                session.clear()
                return jsonify({'status': 'error', 'message': 'User not found'}), 404
            return jsonify({'status': 'success', 'user': {**u.to_dict(), 'role': 'student'}}), 200
        elif role == 'lecturer':
            u = Lecturer.query.get(uid)
            if not u:
                session.clear()
                return jsonify({'status': 'error', 'message': 'User not found'}), 404
            return jsonify({'status': 'success', 'user': {**u.to_dict(), 'role': 'lecturer'}}), 200
        elif role == 'management':
            u = Management.query.get(uid)
            if not u:
                session.clear()
                return jsonify({'status': 'error', 'message': 'User not found'}), 404
            return jsonify({'status': 'success', 'user': {**u.to_dict(), 'role': 'management'}}), 200

        return jsonify({'status': 'error', 'message': 'Unknown role'}), 400
    except Exception as e:
        print(f"[ERROR] me:\n{traceback.format_exc()}")
        return jsonify({'status': 'error', 'message': 'Failed to fetch user info'}), 500


# ── Logout ────────────────────────────────────────────────────
@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'status': 'success', 'message': 'Logged out'}), 200
