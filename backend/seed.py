from models import Student, Lecturer, Management, Class, Subject, LecturerAssignment, Leave
from extensions import db
from werkzeug.security import generate_password_hash
from datetime import datetime

def seed_db():
    if Management.query.count() > 0:
        return

    # Management
    admin = Management(email='admin@demo.com', password=generate_password_hash('admin123'))
    db.session.add(admin)

    # Classes
    classes = [
        Class(class_name='CS-A', department='Computer Science', semester='5', section='A'),
        Class(class_name='CS-B', department='Computer Science', semester='5', section='B'),
        Class(class_name='EC-A', department='Electronics',      semester='3', section='A'),
    ]
    db.session.add_all(classes)

    # Subjects
    subjects = [
        Subject(subject_name='Data Structures',    subject_code='CS301', department='Computer Science'),
        Subject(subject_name='Operating Systems',  subject_code='CS302', department='Computer Science'),
        Subject(subject_name='Mathematics',        subject_code='MA301', department='Common'),
        Subject(subject_name='Circuit Theory',     subject_code='EC301', department='Electronics'),
    ]
    db.session.add_all(subjects)

    # Lecturers
    lecturers = [
        Lecturer(lecturer_name='Dr. Priya Nair',   email='priya@demo.com',   password=generate_password_hash('1234'), lecturer_id='FAC001', department='Computer Science'),
        Lecturer(lecturer_name='Prof. Rajan Kumar', email='rajan@demo.com',  password=generate_password_hash('1234'), lecturer_id='FAC002', department='Computer Science'),
        Lecturer(lecturer_name='Dr. Meena Iyer',   email='meena@demo.com',   password=generate_password_hash('1234'), lecturer_id='FAC003', department='Electronics'),
    ]
    db.session.add_all(lecturers)
    db.session.flush()

    # Students
    students = [
        Student(roll_no='CS2021001', email='arjun@demo.com',  password=generate_password_hash('1234'), student_name='Arjun Sharma',  department='Computer Science', class_name='CS-A', semester='5'),
        Student(roll_no='CS2021002', email='meera@demo.com',  password=generate_password_hash('1234'), student_name='Meera Patel',   department='Computer Science', class_name='CS-A', semester='5'),
        Student(roll_no='CS2021003', email='rohan@demo.com',  password=generate_password_hash('1234'), student_name='Rohan Desai',   department='Computer Science', class_name='CS-B', semester='5'),
        Student(roll_no='EC2021001', email='sneha@demo.com',  password=generate_password_hash('1234'), student_name='Sneha Iyer',    department='Electronics',      class_name='EC-A', semester='3'),
    ]
    db.session.add_all(students)
    db.session.flush()

    # Assignments: Lecturer A → CS-A → Data Structures, Lecturer B → CS-A → OS, Lecturer A → CS-B → Maths
    assignments = [
        LecturerAssignment(lecturer_id=lecturers[0].id, class_id=classes[0].id, subject_id=subjects[0].id, department='Computer Science', assigned_by_admin=admin.id),
        LecturerAssignment(lecturer_id=lecturers[1].id, class_id=classes[0].id, subject_id=subjects[1].id, department='Computer Science', assigned_by_admin=admin.id),
        LecturerAssignment(lecturer_id=lecturers[0].id, class_id=classes[1].id, subject_id=subjects[2].id, department='Computer Science', assigned_by_admin=admin.id),
        LecturerAssignment(lecturer_id=lecturers[1].id, class_id=classes[1].id, subject_id=subjects[0].id, department='Computer Science', assigned_by_admin=admin.id),
        LecturerAssignment(lecturer_id=lecturers[2].id, class_id=classes[2].id, subject_id=subjects[3].id, department='Electronics',      assigned_by_admin=admin.id),
    ]
    db.session.add_all(assignments)

    # Sample leaves
    leaves = [
        Leave(applicant_id=students[0].id, applicant_role='student', applicant_name='Arjun Sharma',  email='arjun@demo.com',  department='Computer Science', class_name='CS-A', leave_type='medical',  reason='Fever',                from_date='2026-04-10', to_date='2026-04-11', days=2, status='Approved by Lecturer',    remarks='Approved. Get well soon.'),
        Leave(applicant_id=students[1].id, applicant_role='student', applicant_name='Meera Patel',   email='meera@demo.com',  department='Computer Science', class_name='CS-A', leave_type='personal', reason='Family function',       from_date='2026-04-20', to_date='2026-04-20', days=1, status='Pending with Lecturer',  remarks=''),
        Leave(applicant_id=students[2].id, applicant_role='student', applicant_name='Rohan Desai',   email='rohan@demo.com',  department='Computer Science', class_name='CS-B', leave_type='academic', reason='Coding competition',    from_date='2026-04-22', to_date='2026-04-23', days=2, status='Forwarded to Management', remarks='Forwarded for review.'),
        Leave(applicant_id=lecturers[0].id,applicant_role='lecturer',applicant_name='Dr. Priya Nair',email='priya@demo.com',  department='Computer Science', class_name='',    leave_type='medical',  reason='Medical checkup',       from_date='2026-04-25', to_date='2026-04-25', days=1, status='Pending with Management', remarks=''),
    ]
    db.session.add_all(leaves)
    db.session.commit()
    print('✅ Database seeded with 3-role data.')
