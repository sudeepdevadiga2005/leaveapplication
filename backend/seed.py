from werkzeug.security import generate_password_hash

load_dotenv()


def seed_db():
    from extensions import get_db
    from models import Student, Lecturer, Management, Class, Subject, LecturerAssignment, Leave

    db = get_db()

    # Clear all collections
    for col in ['leaves', 'lecturer_assignments', 'students', 'lecturers', 'subjects', 'classes', 'management', 'notifications']:
        db[col].delete_many({})

    # ── Management (stored directly in MongoDB) ──────────────
    admin_id = Management(db).create({
        'email':    'sudeep@gmail.com',
        'password': generate_password_hash('123456789'),
        'role':     'admin'
    })

    # ── Classes ───────────────────────────────────────────────
    class_data = [
        {'class_name': 'BCA-1A', 'department': 'Computer Science',       'semester': '1', 'section': 'A'},
        {'class_name': 'BCA-2A', 'department': 'Computer Science',       'semester': '3', 'section': 'A'},
        {'class_name': 'BCA-3A', 'department': 'Computer Science',       'semester': '5', 'section': 'A'},
        {'class_name': 'BBA-1A', 'department': 'Business Administration', 'semester': '1', 'section': 'A'},
        {'class_name': 'BBA-2A', 'department': 'Business Administration', 'semester': '3', 'section': 'A'},
        {'class_name': 'BBA-3A', 'department': 'Business Administration', 'semester': '5', 'section': 'A'},
        {'class_name': 'BCom-1A','department': 'Commerce',               'semester': '1', 'section': 'A'},
        {'class_name': 'BCom-2A','department': 'Commerce',               'semester': '3', 'section': 'A'},
        {'class_name': 'BCom-3A','department': 'Commerce',               'semester': '5', 'section': 'A'},
    ]
    class_ids = [Class(db).create(c) for c in class_data]

    # ── Subjects ──────────────────────────────────────────────
    subject_data = [
        {'subject_name': 'Programming in C',         'subject_code': 'BCA101',  'department': 'Computer Science'},
        {'subject_name': 'Data Structures',          'subject_code': 'BCA201',  'department': 'Computer Science'},
        {'subject_name': 'Database Management',      'subject_code': 'BCA301',  'department': 'Computer Science'},
        {'subject_name': 'Web Technologies',         'subject_code': 'BCA302',  'department': 'Computer Science'},
        {'subject_name': 'Principles of Management', 'subject_code': 'BBA101',  'department': 'Business Administration'},
        {'subject_name': 'Business Communication',   'subject_code': 'BBA102',  'department': 'Business Administration'},
        {'subject_name': 'Marketing Management',     'subject_code': 'BBA201',  'department': 'Business Administration'},
        {'subject_name': 'Human Resource Management','subject_code': 'BBA301',  'department': 'Business Administration'},
        {'subject_name': 'Financial Accounting',     'subject_code': 'BCom101', 'department': 'Commerce'},
        {'subject_name': 'Business Economics',       'subject_code': 'BCom102', 'department': 'Commerce'},
        {'subject_name': 'Cost Accounting',          'subject_code': 'BCom201', 'department': 'Commerce'},
        {'subject_name': 'Income Tax',               'subject_code': 'BCom301', 'department': 'Commerce'},
    ]
    subject_ids = [Subject(db).create(s) for s in subject_data]

    # ── Lecturers ─────────────────────────────────────────────
    lecturer_data = [
        {'lecturer_name': 'Dr. Priya Nair',    'email': 'priya@demo.com',   'password': generate_password_hash('1234'), 'lecturer_id': 'FAC001', 'department': 'Computer Science'},
        {'lecturer_name': 'Prof. Rajan Kumar', 'email': 'rajan@demo.com',   'password': generate_password_hash('1234'), 'lecturer_id': 'FAC002', 'department': 'Computer Science'},
        {'lecturer_name': 'Dr. Sunita Rao',    'email': 'sunita@demo.com',  'password': generate_password_hash('1234'), 'lecturer_id': 'FAC003', 'department': 'Business Administration'},
        {'lecturer_name': 'Prof. Anil Mehta',  'email': 'anil@demo.com',    'password': generate_password_hash('1234'), 'lecturer_id': 'FAC004', 'department': 'Business Administration'},
        {'lecturer_name': 'Dr. Kavitha Reddy', 'email': 'kavitha@demo.com', 'password': generate_password_hash('1234'), 'lecturer_id': 'FAC005', 'department': 'Commerce'},
        {'lecturer_name': 'Prof. Suresh Babu', 'email': 'suresh@demo.com',  'password': generate_password_hash('1234'), 'lecturer_id': 'FAC006', 'department': 'Commerce'},
    ]
    lecturer_ids = [Lecturer(db).create(l) for l in lecturer_data]

    # ── Students ──────────────────────────────────────────────
    student_data = [
        {'roll_no': 'BCA2024001', 'email': 'arjun@demo.com',   'password': generate_password_hash('1234'), 'student_name': 'Arjun Sharma',   'department': 'Computer Science',        'class_name': 'BCA-3A',  'semester': '5'},
        {'roll_no': 'BCA2024002', 'email': 'meera@demo.com',   'password': generate_password_hash('1234'), 'student_name': 'Meera Patel',    'department': 'Computer Science',        'class_name': 'BCA-3A',  'semester': '5'},
        {'roll_no': 'BCA2025001', 'email': 'rohan@demo.com',   'password': generate_password_hash('1234'), 'student_name': 'Rohan Desai',    'department': 'Computer Science',        'class_name': 'BCA-2A',  'semester': '3'},
        {'roll_no': 'BBA2024001', 'email': 'sneha@demo.com',   'password': generate_password_hash('1234'), 'student_name': 'Sneha Iyer',     'department': 'Business Administration', 'class_name': 'BBA-3A',  'semester': '5'},
        {'roll_no': 'BBA2024002', 'email': 'karan@demo.com',   'password': generate_password_hash('1234'), 'student_name': 'Karan Singh',    'department': 'Business Administration', 'class_name': 'BBA-3A',  'semester': '5'},
        {'roll_no': 'BBA2025001', 'email': 'priyam@demo.com',  'password': generate_password_hash('1234'), 'student_name': 'Priya Menon',    'department': 'Business Administration', 'class_name': 'BBA-2A',  'semester': '3'},
        {'roll_no': 'BCom2024001','email': 'dev@demo.com',     'password': generate_password_hash('1234'), 'student_name': 'Dev Kapoor',     'department': 'Commerce',                'class_name': 'BCom-3A', 'semester': '5'},
        {'roll_no': 'BCom2024002','email': 'ananya@demo.com',  'password': generate_password_hash('1234'), 'student_name': 'Ananya Rao',     'department': 'Commerce',                'class_name': 'BCom-3A', 'semester': '5'},
        {'roll_no': 'BCom2025001','email': 'rahul@demo.com',   'password': generate_password_hash('1234'), 'student_name': 'Rahul Verma',    'department': 'Commerce',                'class_name': 'BCom-2A', 'semester': '3'},
    ]
    student_ids = [Student(db).create(s) for s in student_data]

    # ── Lecturer Assignments ──────────────────────────────────
    assignments = [
        {'lecturer_id': lecturer_ids[0], 'class_id': class_ids[2], 'subject_id': subject_ids[2], 'is_mentor': True,  'department': 'Computer Science',        'assigned_by_admin': admin_id},
        {'lecturer_id': lecturer_ids[1], 'class_id': class_ids[2], 'subject_id': subject_ids[3], 'is_mentor': False, 'department': 'Computer Science',        'assigned_by_admin': admin_id},
        {'lecturer_id': lecturer_ids[0], 'class_id': class_ids[1], 'subject_id': subject_ids[1], 'is_mentor': True,  'department': 'Computer Science',        'assigned_by_admin': admin_id},
        {'lecturer_id': lecturer_ids[1], 'class_id': class_ids[1], 'subject_id': subject_ids[0], 'is_mentor': False, 'department': 'Computer Science',        'assigned_by_admin': admin_id},
        {'lecturer_id': lecturer_ids[2], 'class_id': class_ids[5], 'subject_id': subject_ids[6], 'is_mentor': True,  'department': 'Business Administration', 'assigned_by_admin': admin_id},
        {'lecturer_id': lecturer_ids[3], 'class_id': class_ids[5], 'subject_id': subject_ids[7], 'is_mentor': False, 'department': 'Business Administration', 'assigned_by_admin': admin_id},
        {'lecturer_id': lecturer_ids[2], 'class_id': class_ids[4], 'subject_id': subject_ids[4], 'is_mentor': True,  'department': 'Business Administration', 'assigned_by_admin': admin_id},
        {'lecturer_id': lecturer_ids[4], 'class_id': class_ids[8], 'subject_id': subject_ids[10],'is_mentor': True,  'department': 'Commerce',                'assigned_by_admin': admin_id},
        {'lecturer_id': lecturer_ids[5], 'class_id': class_ids[8], 'subject_id': subject_ids[11],'is_mentor': False, 'department': 'Commerce',                'assigned_by_admin': admin_id},
        {'lecturer_id': lecturer_ids[4], 'class_id': class_ids[7], 'subject_id': subject_ids[8], 'is_mentor': True,  'department': 'Commerce',                'assigned_by_admin': admin_id},
    ]
    for a in assignments:
        LecturerAssignment(db).create(a)

    # ── Sample Leaves ─────────────────────────────────────────
    Leave(db).create({'applicant_id': student_ids[0], 'applicant_role': 'student', 'applicant_name': 'Arjun Sharma',      'email': 'arjun@demo.com',   'department': 'Computer Science',        'class_name': 'BCA-3A',  'leave_type': 'medical',  'reason': 'Fever and cold',    'from_date': '2026-04-10', 'to_date': '2026-04-11', 'days': 2, 'status': 'Approved by Lecturer', 'remarks': 'Approved. Get well soon.'})
    Leave(db).create({'applicant_id': student_ids[1], 'applicant_role': 'student', 'applicant_name': 'Meera Patel',       'email': 'meera@demo.com',   'department': 'Computer Science',        'class_name': 'BCA-3A',  'leave_type': 'personal', 'reason': 'Family function',   'from_date': '2026-04-20', 'to_date': '2026-04-20', 'days': 1, 'status': 'Pending with Lecturer', 'remarks': ''})
    Leave(db).create({'applicant_id': student_ids[3], 'applicant_role': 'student', 'applicant_name': 'Sneha Iyer',        'email': 'sneha@demo.com',   'department': 'Business Administration', 'class_name': 'BBA-3A',  'leave_type': 'academic', 'reason': 'Business seminar',  'from_date': '2026-04-22', 'to_date': '2026-04-23', 'days': 2, 'status': 'Pending with Lecturer', 'remarks': ''})
    Leave(db).create({'applicant_id': student_ids[6], 'applicant_role': 'student', 'applicant_name': 'Dev Kapoor',        'email': 'dev@demo.com',     'department': 'Commerce',                'class_name': 'BCom-3A', 'leave_type': 'medical',  'reason': 'Doctor appointment','from_date': '2026-04-24', 'to_date': '2026-04-24', 'days': 1, 'status': 'Approved by Lecturer', 'remarks': 'Approved.'})
    Leave(db).create({'applicant_id': lecturer_ids[0],'applicant_role': 'lecturer','applicant_name': 'Dr. Priya Nair',    'email': 'priya@demo.com',   'department': 'Computer Science',        'class_name': '',        'leave_type': 'medical',  'reason': 'Medical checkup',   'from_date': '2026-04-25', 'to_date': '2026-04-25', 'days': 1, 'status': 'Pending with Admin', 'remarks': ''})
    Leave(db).create({'applicant_id': lecturer_ids[4],'applicant_role': 'lecturer','applicant_name': 'Dr. Kavitha Reddy','email': 'kavitha@demo.com', 'department': 'Commerce',                'class_name': '',        'leave_type': 'personal', 'reason': 'Family emergency',  'from_date': '2026-04-26', 'to_date': '2026-04-26', 'days': 1, 'status': 'Approved by Management', 'remarks': 'Approved.'})

    print('MongoDB seeded with BCom, BBA, BCA departments.')


if __name__ == '__main__':
    seed_db()
