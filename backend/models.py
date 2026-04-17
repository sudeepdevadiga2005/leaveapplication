from bson import ObjectId
from datetime import datetime


def _str_id(doc):
    """Convert MongoDB _id to string id."""
    if doc and '_id' in doc:
        doc['id'] = str(doc.pop('_id'))
    return doc


# ── Students ──────────────────────────────────────────────────
class Student:
    def __init__(self, db):
        self.col = db['students']

    def create(self, data):
        data['created_at'] = datetime.utcnow()
        result = self.col.insert_one(data)
        return str(result.inserted_id)

    def find_by_id(self, uid):
        doc = self.col.find_one({'_id': ObjectId(uid)})
        return _str_id(doc)

    def find_by_roll(self, roll_no):
        doc = self.col.find_one({'roll_no': roll_no})
        return _str_id(doc)

    def find_by_email(self, email):
        doc = self.col.find_one({'email': email})
        return _str_id(doc)

    def find_by_class(self, class_name):
        return [_str_id(d) for d in self.col.find({'class_name': class_name})]

    def all(self):
        return [_str_id(d) for d in self.col.find()]

    def count(self):
        return self.col.count_documents({})

    def to_dict(self, doc):
        return {
            'id':           doc.get('id'),
            'roll_no':      doc.get('roll_no'),
            'email':        doc.get('email'),
            'student_name': doc.get('student_name'),
            'department':   doc.get('department'),
            'class_name':   doc.get('class_name'),
            'semester':     doc.get('semester'),
            'created_at':   str(doc.get('created_at', '')),
        }


# ── Lecturers ─────────────────────────────────────────────────
class Lecturer:
    def __init__(self, db):
        self.col = db['lecturers']

    def create(self, data):
        data['created_at'] = datetime.utcnow()
        result = self.col.insert_one(data)
        return str(result.inserted_id)

    def find_by_id(self, uid):
        doc = self.col.find_one({'_id': ObjectId(uid)})
        return _str_id(doc)

    def find_by_email(self, email):
        doc = self.col.find_one({'email': email})
        return _str_id(doc)

    def all(self):
        return [_str_id(d) for d in self.col.find()]

    def count(self):
        return self.col.count_documents({})

    def to_dict(self, doc):
        return {
            'id':            doc.get('id'),
            'lecturer_name': doc.get('lecturer_name'),
            'email':         doc.get('email'),
            'lecturer_id':   doc.get('lecturer_id'),
            'department':    doc.get('department'),
            'created_at':    str(doc.get('created_at', '')),
        }


# ── Management (Admin) ────────────────────────────────────────
class Management:
    def __init__(self, db):
        self.col = db['management']

    def create(self, data):
        data['created_at'] = datetime.utcnow()
        result = self.col.insert_one(data)
        return str(result.inserted_id)

    def find_by_id(self, uid):
        doc = self.col.find_one({'_id': ObjectId(uid)})
        return _str_id(doc)

    def find_by_email(self, email):
        doc = self.col.find_one({'email': email})
        return _str_id(doc)

    def all(self):
        return [_str_id(d) for d in self.col.find()]

    def to_dict(self, doc):
        return {
            'id':    doc.get('id'),
            'email': doc.get('email'),
            'role':  doc.get('role', 'admin'),
        }


# ── Classes ───────────────────────────────────────────────────
class Class:
    def __init__(self, db):
        self.col = db['classes']

    def create(self, data):
        data['created_at'] = datetime.utcnow()
        result = self.col.insert_one(data)
        return str(result.inserted_id)

    def find_by_id(self, cid):
        doc = self.col.find_one({'_id': ObjectId(cid)})
        return _str_id(doc)

    def all(self):
        return [_str_id(d) for d in self.col.find()]

    def to_dict(self, doc):
        return {
            'id':         doc.get('id'),
            'class_name': doc.get('class_name'),
            'department': doc.get('department'),
            'semester':   doc.get('semester'),
            'section':    doc.get('section'),
        }


# ── Subjects ──────────────────────────────────────────────────
class Subject:
    def __init__(self, db):
        self.col = db['subjects']

    def create(self, data):
        data['created_at'] = datetime.utcnow()
        result = self.col.insert_one(data)
        return str(result.inserted_id)

    def find_by_id(self, sid):
        doc = self.col.find_one({'_id': ObjectId(sid)})
        return _str_id(doc)

    def all(self):
        return [_str_id(d) for d in self.col.find()]

    def to_dict(self, doc):
        return {
            'id':           doc.get('id'),
            'subject_name': doc.get('subject_name'),
            'subject_code': doc.get('subject_code'),
            'department':   doc.get('department'),
        }


# ── Lecturer Assignments ──────────────────────────────────────
class LecturerAssignment:
    def __init__(self, db):
        self.col = db['lecturer_assignments']

    def create(self, data):
        data['created_at'] = datetime.utcnow()
        result = self.col.insert_one(data)
        return str(result.inserted_id)

    def find_by_id(self, aid):
        doc = self.col.find_one({'_id': ObjectId(aid)})
        return _str_id(doc)

    def find_by_lecturer(self, lecturer_id):
        return [_str_id(d) for d in self.col.find({'lecturer_id': lecturer_id})]

    def find_by_class(self, class_id):
        return [_str_id(d) for d in self.col.find({'class_id': class_id})]

    def all(self):
        return [_str_id(d) for d in self.col.find()]

    def delete_by_class(self, class_id):
        self.col.delete_many({'class_id': class_id})

    def delete_by_id(self, aid):
        self.col.delete_one({'_id': ObjectId(aid)})

    def update_by_id(self, aid, data):
        self.col.update_one({'_id': ObjectId(aid)}, {'$set': data})

    def clear_mentor(self, class_id):
        self.col.update_many({'class_id': class_id, 'is_mentor': True}, {'$set': {'is_mentor': False}})

    def to_dict(self, doc, lecturer=None, cls=None, subject=None):
        return {
            'id':            doc.get('id'),
            'lecturer_id':   doc.get('lecturer_id'),
            'lecturer_name': lecturer.get('lecturer_name', '') if lecturer else '',
            'class_id':      doc.get('class_id'),
            'class_name':    cls.get('class_name', '') if cls else '',
            'subject_id':    doc.get('subject_id'),
            'subject_name':  subject.get('subject_name', '—') if subject else '—',
            'is_mentor':     doc.get('is_mentor', False),
            'department':    doc.get('department', ''),
        }


# ── Leaves ────────────────────────────────────────────────────
class Leave:
    def __init__(self, db):
        self.col = db['leaves']

    def create(self, data):
        data['created_at'] = datetime.utcnow()
        data['updated_at'] = datetime.utcnow()
        result = self.col.insert_one(data)
        return str(result.inserted_id)

    def find_by_id(self, lid):
        doc = self.col.find_one({'_id': ObjectId(lid)})
        return _str_id(doc)

    def find_by_applicant(self, applicant_id, role):
        return [_str_id(d) for d in self.col.find(
            {'applicant_id': applicant_id, 'applicant_role': role},
            sort=[('_id', -1)]
        )]

    def find_by_class_names(self, class_names):
        return [_str_id(d) for d in self.col.find(
            {'applicant_role': 'student', 'class_name': {'$in': class_names}},
            sort=[('_id', -1)]
        )]

    def find_by_role(self, role):
        return [_str_id(d) for d in self.col.find({'applicant_role': role}, sort=[('_id', -1)])]

    def find_admin_student_leaves(self):
        statuses = [
            'Approved by Lecturer and Forwarded to Admin',
            'Pending with Admin',
            'Approved by Admin',
            'Rejected by Admin',
        ]
        return [_str_id(d) for d in self.col.find(
            {'applicant_role': 'student', 'status': {'$in': statuses}},
            sort=[('_id', -1)]
        )]

    def all(self):
        return [_str_id(d) for d in self.col.find()]

    def update(self, lid, data):
        data['updated_at'] = datetime.utcnow()
        self.col.update_one({'_id': ObjectId(lid)}, {'$set': data})

    def count(self):
        return self.col.count_documents({})

    def to_dict(self, doc):
        return {
            'id':             doc.get('id'),
            'applicant_id':   doc.get('applicant_id'),
            'applicant_role': doc.get('applicant_role'),
            'applicant_name': doc.get('applicant_name'),
            'email':          doc.get('email'),
            'department':     doc.get('department'),
            'class_name':     doc.get('class_name'),
            'leave_type':     doc.get('leave_type'),
            'reason':         doc.get('reason'),
            'from_date':      doc.get('from_date'),
            'to_date':        doc.get('to_date'),
            'days':           doc.get('days', 1),
            'status':         doc.get('status'),
            'handled_by':     doc.get('handled_by'),
            'forwarded_to':   doc.get('forwarded_to'),
            'remarks':        doc.get('remarks', ''),
            'created_at':     str(doc.get('created_at', '')),
            'updated_at':     str(doc.get('updated_at', '')),
        }


# ── Notifications ─────────────────────────────────────────────
class Notification:
    def __init__(self, db):
        self.col = db['notifications']

    def create(self, data):
        data['created_at'] = datetime.utcnow()
        data.setdefault('is_read', False)
        self.col.insert_one(data)

    def find_by_user(self, user_id):
        return [_str_id(d) for d in self.col.find({'user_id': user_id}, sort=[('_id', -1)])]

    def mark_all_read(self, user_id):
        self.col.update_many({'user_id': user_id, 'is_read': False}, {'$set': {'is_read': True}})

    def to_dict(self, doc):
        msg = doc.get('message', '')
        t = 'pending'
        if 'Approve' in msg or 'approve' in msg:
            t = 'approved'
        elif 'Reject' in msg or 'reject' in msg:
            t = 'rejected'
        created = doc.get('created_at', datetime.utcnow())
        return {
            'id':         doc.get('id'),
            'user_id':    doc.get('user_id'),
            'role':       doc.get('role'),
            'message':    msg,
            'msg':        msg,
            'is_read':    doc.get('is_read', False),
            'read':       doc.get('is_read', False),
            'created_at': created.isoformat() if hasattr(created, 'isoformat') else str(created),
            'time':       created.strftime('%Y-%m-%d %H:%M') if hasattr(created, 'strftime') else str(created),
            'type':       t,
        }
