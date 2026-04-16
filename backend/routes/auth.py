from flask import Blueprint, request, jsonify, session
from models import Student, Lecturer, Management
from extensions import db
from werkzeug.security import check_password_hash, generate_password_hash

auth_bp = Blueprint('auth', __name__)

# ── Student Register ──────────────────────────────────────────
@auth_bp.route('/student/register', methods=['POST'])
def student_register():
    d = request.get_json()
    required = ['roll_no', 'email', 'password', 'department', 'class_name']
    for f in required:
        if not d.get(f):
            return jsonify({'error': f'{f} is required'}), 400

    if Student.query.filter_by(roll_no=d['roll_no']).first():
        return jsonify({'error': 'Roll number already registered'}), 409
    if Student.query.filter_by(email=d['email']).first():
        return jsonify({'error': 'Email already registered'}), 409

    s = Student(
        roll_no=d['roll_no'], email=d['email'],
        password=generate_password_hash(d['password']),
        student_name=d.get('student_name', ''),
        department=d['department'], class_name=d['class_name'],
        semester=d.get('semester', '')
    )
    db.session.add(s); db.session.commit()
    return jsonify({'message': 'Student registered successfully'}), 201

# ── Student Login ─────────────────────────────────────────────
@auth_bp.route('/student/login', methods=['POST'])
def student_login():
    d = request.get_json()
    identifier = d.get('identifier', '').strip()
    pwd        = d.get('password', '').strip()

    student = (Student.query.filter_by(roll_no=identifier).first() or
               Student.query.filter_by(email=identifier).first())
    if not student or not check_password_hash(student.password, pwd):
        return jsonify({'error': 'Invalid credentials'}), 401

    session['user_id']   = student.id
    session['user_role'] = 'student'
    return jsonify({'user': {**student.to_dict(), 'role': 'student'}}), 200

# ── Lecturer Register ─────────────────────────────────────────
@auth_bp.route('/lecturer/register', methods=['POST'])
def lecturer_register():
    d = request.get_json()
    required = ['lecturer_name', 'email', 'password', 'department']
    for f in required:
        if not d.get(f):
            return jsonify({'error': f'{f} is required'}), 400

    if Lecturer.query.filter_by(email=d['email']).first():
        return jsonify({'error': 'Email already registered'}), 409

    l = Lecturer(
        lecturer_name=d['lecturer_name'], email=d['email'],
        password=generate_password_hash(d['password']),
        lecturer_id=d.get('lecturer_id', ''),
        department=d['department']
    )
    db.session.add(l); db.session.commit()
    return jsonify({'message': 'Lecturer registered successfully'}), 201

# ── Lecturer Login ────────────────────────────────────────────
@auth_bp.route('/lecturer/login', methods=['POST'])
def lecturer_login():
    d = request.get_json()
    lec = Lecturer.query.filter_by(email=d.get('email', '').strip()).first()
    if not lec or not check_password_hash(lec.password, d.get('password', '')):
        return jsonify({'error': 'Invalid credentials'}), 401

    session['user_id']   = lec.id
    session['user_role'] = 'lecturer'
    return jsonify({'user': {**lec.to_dict(), 'role': 'lecturer'}}), 200

# ── Management Login ──────────────────────────────────────────
@auth_bp.route('/management/login', methods=['POST'])
def management_login():
    d = request.get_json()
    mgmt = Management.query.filter_by(email=d.get('email', '').strip()).first()
    if not mgmt or not check_password_hash(mgmt.password, d.get('password', '')):
        return jsonify({'error': 'Invalid credentials'}), 401

    session['user_id']   = mgmt.id
    session['user_role'] = 'management'
    return jsonify({'user': {**mgmt.to_dict(), 'role': 'management'}}), 200

# ── Me / Logout ───────────────────────────────────────────────
@auth_bp.route('/me', methods=['GET'])
def me():
    uid  = session.get('user_id')
    role = session.get('user_role')
    if not uid:
        return jsonify({'error': 'Not authenticated'}), 401

    if role == 'student':
        u = Student.query.get(uid)
        return jsonify({'user': {**u.to_dict(), 'role': 'student'}}), 200
    elif role == 'lecturer':
        u = Lecturer.query.get(uid)
        return jsonify({'user': {**u.to_dict(), 'role': 'lecturer'}}), 200
    elif role == 'management':
        u = Management.query.get(uid)
        return jsonify({'user': {**u.to_dict(), 'role': 'management'}}), 200
    return jsonify({'error': 'Unknown role'}), 400

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out'}), 200
