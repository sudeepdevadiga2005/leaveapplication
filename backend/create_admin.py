"""
Run this script to add a new admin/management account directly into MongoDB.
Usage: py create_admin.py
"""
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash

load_dotenv()


def create_admin():
    from extensions import get_db
    from models import Management

    db   = get_db()
    mgmt = Management(db)

    email    = input("Enter admin email: ").strip()
    password = input("Enter admin password: ").strip()

    if not email or not password:
        print("[ERROR] Email and password are required.")
        return

    if mgmt.find_by_email(email):
        print(f"[ERROR] Admin with email '{email}' already exists in MongoDB.")
        return

    mgmt.create({
        'email':    email,
        'password': generate_password_hash(password),
        'role':     'admin'
    })
    print(f"[OK] Admin '{email}' created successfully in MongoDB.")


if __name__ == '__main__':
    create_admin()
