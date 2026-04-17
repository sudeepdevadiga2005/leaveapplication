import traceback
from flask import Blueprint, request, jsonify, session
from extensions import get_db
from models import Student, Lecturer, Management
from werkzeug.security import check_password_hash, generate_password_hash
from pymongo.errors import DuplicateKeyError

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

        db = get_db()
        students = Student(db)

        if students.find_by_roll(d['roll_no']):
            return jsonify({'status': 'error', 'message': 'Roll number already registered'}), 409
        if students.find_by_email(d['email']):
            return jsonify({'status': 'error', 'message': 'Email already registered'}), 409

        try:
            students.create({
                'roll_no':      d['roll_no'],
                'email':        d['email'],
                'password':     generate_password_hash(d['password']),
                'student_name': d.get('student_name', ''),
                'department':   d['department'],
                'class_name':   d['class_name'],
                'semester':     d.get('semester', ''),
            })
        except DuplicateKeyError as e:
            key = 'Email' if 'email' in str(e) else 'Roll number'
            return jsonify({'status': 'error', 'message': f'{key} already registered'}), 409
        return jsonify({'status': 'success', 'message': 'Student registered successfully'}), 201
    except Exception:
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

        db = get_db()
        students = Student(db)
        student = students.find_by_roll(identifier) or students.find_by_email(identifier)

        if not student or not check_password_hash(student['password'], pwd):
            return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401

        session['user_id']   = student['id']
        session['user_role'] = 'student'
        return jsonify({'status': 'success', 'user': {**students.to_dict(student), 'role': 'student'}}), 200
    except Exception:
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

        db = get_db()
        lecturers = Lecturer(db)

        if lecturers.find_by_email(d['email']):
            return jsonify({'status': 'error', 'message': 'Email already registered'}), 409

        try:
            lecturers.create({
                'lecturer_name': d['lecturer_name'],
                'email':         d['email'],
                'password':      generate_password_hash(d['password']),
                'lecturer_id':   d.get('lecturer_id', ''),
                'department':    d['department'],
            })
        except DuplicateKeyError:
            return jsonify({'status': 'error', 'message': 'Email already registered'}), 409
        return jsonify({'status': 'success', 'message': 'Lecturer registered successfully'}), 201
    except Exception:
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

        db = get_db()
        lecturers = Lecturer(db)
        lec = lecturers.find_by_email(email)

        if not lec or not check_password_hash(lec['password'], pwd):
            return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401

        session['user_id']   = lec['id']
        session['user_role'] = 'lecturer'
        return jsonify({'status': 'success', 'user': {**lecturers.to_dict(lec), 'role': 'lecturer'}}), 200
    except Exception:
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

        db = get_db()
        mgmt = Management(db)
        admin = mgmt.find_by_email(email)

        if not admin or not check_password_hash(admin['password'], pwd):
            return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401

        session['user_id']   = admin['id']
        session['user_role'] = 'management'
        return jsonify({'status': 'success', 'user': {**mgmt.to_dict(admin), 'role': 'management'}}), 200
    except Exception:
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

        db = get_db()
        if role == 'student':
            model = Student(db)
            u = model.find_by_id(uid)
            if not u:
                session.clear()
                return jsonify({'status': 'error', 'message': 'User not found'}), 404
            return jsonify({'status': 'success', 'user': {**model.to_dict(u), 'role': 'student'}}), 200
        elif role == 'lecturer':
            model = Lecturer(db)
            u = model.find_by_id(uid)
            if not u:
                session.clear()
                return jsonify({'status': 'error', 'message': 'User not found'}), 404
            return jsonify({'status': 'success', 'user': {**model.to_dict(u), 'role': 'lecturer'}}), 200
        elif role == 'management':
            model = Management(db)
            u = model.find_by_id(uid)
            if not u:
                session.clear()
                return jsonify({'status': 'error', 'message': 'User not found'}), 404
            return jsonify({'status': 'success', 'user': {**model.to_dict(u), 'role': 'management'}}), 200

        return jsonify({'status': 'error', 'message': 'Unknown role'}), 400
    except Exception:
        print(f"[ERROR] me:\n{traceback.format_exc()}")
        return jsonify({'status': 'error', 'message': 'Failed to fetch user info'}), 500


# ── Logout ────────────────────────────────────────────────────
@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'status': 'success', 'message': 'Logged out'}), 200
