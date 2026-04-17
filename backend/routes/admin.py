from flask import Blueprint, request, jsonify, session
from extensions import get_db
from models import Class, Subject, LecturerAssignment, Student, Lecturer, Leave, Management

admin_bp = Blueprint('admin', __name__)


def require_management():
    if session.get('user_role') != 'management':
        return jsonify({'error': 'Forbidden — management only'}), 403
    return None


# ── Classes ───────────────────────────────────────────────────
@admin_bp.route('/create-class', methods=['POST'])
def create_class():
    err = require_management()
    if err: return err
    d = request.get_json()
    if not d.get('class_name'):
        return jsonify({'error': 'class_name required'}), 400
    db = get_db()
    cid = Class(db).create({'class_name': d['class_name'], 'department': d.get('department', ''),
                             'semester': d.get('semester', ''), 'section': d.get('section', '')})
    cls = Class(db).find_by_id(cid)
    return jsonify(Class(db).to_dict(cls)), 201


@admin_bp.route('/classes', methods=['GET'])
def get_classes():
    db = get_db()
    return jsonify([Class(db).to_dict(c) for c in Class(db).all()]), 200


@admin_bp.route('/delete-class/<cid>', methods=['DELETE'])
def delete_class(cid):
    err = require_management()
    if err: return err
    db = get_db()
    LecturerAssignment(db).delete_by_class(cid)
    db['classes'].delete_one({'_id': __import__('bson').ObjectId(cid)})
    return jsonify({'message': 'Deleted'}), 200


# ── Subjects ──────────────────────────────────────────────────
@admin_bp.route('/create-subject', methods=['POST'])
def create_subject():
    err = require_management()
    if err: return err
    d = request.get_json()
    if not d.get('subject_name'):
        return jsonify({'error': 'subject_name required'}), 400
    db = get_db()
    sid = Subject(db).create({'subject_name': d['subject_name'], 'subject_code': d.get('subject_code', ''),
                               'department': d.get('department', '')})
    subj = Subject(db).find_by_id(sid)
    return jsonify(Subject(db).to_dict(subj)), 201


@admin_bp.route('/subjects', methods=['GET'])
def get_subjects():
    db = get_db()
    return jsonify([Subject(db).to_dict(s) for s in Subject(db).all()]), 200


@admin_bp.route('/delete-subject/<sid>', methods=['DELETE'])
def delete_subject(sid):
    err = require_management()
    if err: return err
    db = get_db()
    db['subjects'].delete_one({'_id': __import__('bson').ObjectId(sid)})
    return jsonify({'message': 'Deleted'}), 200


# ── Lecturer Assignments ──────────────────────────────────────
@admin_bp.route('/assign-lecturer', methods=['POST'])
def assign_lecturer():
    err = require_management()
    if err: return err
    d = request.get_json()
    if not d.get('lecturer_id') or not d.get('class_id'):
        return jsonify({'error': 'lecturer_id and class_id required'}), 400

    db = get_db()
    la = LecturerAssignment(db)

    if d.get('is_mentor'):
        la.clear_mentor(d['class_id'])

    aid = la.create({
        'lecturer_id': d['lecturer_id'],
        'class_id':    d['class_id'],
        'subject_id':  d.get('subject_id') or None,
        'is_mentor':   bool(d.get('is_mentor', False)),
        'department':  d.get('department', ''),
        'assigned_by_admin': session.get('user_id'),
    })

    a       = la.find_by_id(aid)
    lec     = Lecturer(db).find_by_id(a['lecturer_id'])
    cls     = Class(db).find_by_id(a['class_id'])
    subject = Subject(db).find_by_id(a['subject_id']) if a.get('subject_id') else None
    return jsonify(la.to_dict(a, lec, cls, subject)), 201


@admin_bp.route('/assignments', methods=['GET'])
def get_assignments():
    db = get_db()
    la = LecturerAssignment(db)
    result = []
    for a in la.all():
        lec     = Lecturer(db).find_by_id(a['lecturer_id'])
        cls     = Class(db).find_by_id(a['class_id'])
        subject = Subject(db).find_by_id(a['subject_id']) if a.get('subject_id') else None
        result.append(la.to_dict(a, lec, cls, subject))
    return jsonify(result), 200


@admin_bp.route('/update-assignment/<aid>', methods=['PUT'])
def update_assignment(aid):
    err = require_management()
    if err: return err
    d  = request.get_json()
    db = get_db()
    la = LecturerAssignment(db)
    update = {}
    if d.get('lecturer_id'): update['lecturer_id'] = d['lecturer_id']
    if d.get('class_id'):    update['class_id']    = d['class_id']
    if d.get('subject_id'):  update['subject_id']  = d['subject_id']
    la.update_by_id(aid, update)
    a       = la.find_by_id(aid)
    lec     = Lecturer(db).find_by_id(a['lecturer_id'])
    cls     = Class(db).find_by_id(a['class_id'])
    subject = Subject(db).find_by_id(a['subject_id']) if a.get('subject_id') else None
    return jsonify(la.to_dict(a, lec, cls, subject)), 200


@admin_bp.route('/delete-assignment/<aid>', methods=['DELETE'])
def delete_assignment(aid):
    err = require_management()
    if err: return err
    db = get_db()
    LecturerAssignment(db).delete_by_id(aid)
    return jsonify({'message': 'Deleted'}), 200


# ── Students & Lecturers ──────────────────────────────────────
@admin_bp.route('/students', methods=['GET'])
def get_students():
    err = require_management()
    if err: return err
    db = get_db()
    s = Student(db)
    return jsonify([s.to_dict(u) for u in s.all()]), 200


@admin_bp.route('/lecturers', methods=['GET'])
def get_lecturers():
    err = require_management()
    if err: return err
    db = get_db()
    l = Lecturer(db)
    return jsonify([l.to_dict(u) for u in l.all()]), 200


# ── Dashboard analytics ───────────────────────────────────────
@admin_bp.route('/dashboard', methods=['GET'])
def dashboard():
    err = require_management()
    if err: return err
    db     = get_db()
    leaves = Leave(db).all()
    return jsonify({
        'total_students':     Student(db).count(),
        'total_lecturers':    Lecturer(db).count(),
        'total_leaves':       len(leaves),
        'pending_lecturer':   sum(1 for l in leaves if l['status'] == 'Pending with Lecturer'),
        'pending_management': sum(1 for l in leaves if l['status'] in ('Pending with Management', 'Forwarded to Management')),
        'approved':           sum(1 for l in leaves if 'Approved' in l['status']),
        'rejected':           sum(1 for l in leaves if 'Rejected' in l['status']),
        'forwarded':          sum(1 for l in leaves if l['status'] == 'Forwarded to Management'),
    }), 200
