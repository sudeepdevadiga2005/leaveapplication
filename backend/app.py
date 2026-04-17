import os
import traceback
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db
from mail_service import mail
from routes.auth   import auth_bp
from routes.leaves import leaves_bp
from routes.admin  import admin_bp
from routes.notifications import notifs_bp

load_dotenv()

# ── Admin seeding (separate so it can be called after reset) ──
def _seed_admin(app):
    with app.app_context():
        from models import Management
        from werkzeug.security import generate_password_hash
        admin_email = os.getenv('ADMIN_EMAIL')
        admin_pass  = os.getenv('ADMIN_PASSWORD')
        if not admin_email or not admin_pass:
            print("[AUTH] ADMIN_EMAIL / ADMIN_PASSWORD not set in .env — skipping admin creation")
            return
        existing = Management.query.filter_by(email=admin_email).first()
        if not existing:
            print(f"[AUTH] Auto-creating admin: {admin_email}")
            db.session.add(Management(
                email=admin_email,
                password=generate_password_hash(admin_pass),
                role='admin'
            ))
            db.session.commit()
            print(f"[AUTH] Admin created: {admin_email}")
        else:
            print(f"[AUTH] Admin already exists: {admin_email}")

def create_app():
    app = Flask(__name__)

    # ── Core config ───────────────────────────────────────────
    app.config['SECRET_KEY']                     = os.getenv('SECRET_KEY', 'absentalert-secret-2024')
    app.config['SQLALCHEMY_DATABASE_URI']        = 'sqlite:///absentalert.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SESSION_COOKIE_SAMESITE']        = 'Lax'
    app.config['SESSION_COOKIE_SECURE']          = False

    # ── Flask-Mail config ─────────────────────────────────────
    app.config['MAIL_SERVER']         = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT']           = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_SSL']        = (app.config['MAIL_PORT'] == 465)
    app.config['MAIL_USE_TLS']        = (app.config['MAIL_PORT'] != 465)
    app.config['MAIL_USERNAME']       = os.getenv('MAIL_USERNAME', '')
    app.config['MAIL_PASSWORD']       = os.getenv('MAIL_PASSWORD', '')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv(
        'MAIL_DEFAULT_SENDER',
        f"AbsentAlert <{os.getenv('MAIL_USERNAME', 'noreply@absentalert.com')}>"
    )
    app.config['MAIL_ENABLED'] = bool(
        app.config['MAIL_USERNAME'] and
        app.config['MAIL_PASSWORD'] and
        app.config['MAIL_USERNAME'] != 'your_email@gmail.com'
    )

    if app.config['MAIL_ENABLED']:
        print(f"[MAIL] Email enabled — sending from {app.config['MAIL_USERNAME']}")
    else:
        print("[MAIL] Email disabled — set MAIL_USERNAME / MAIL_PASSWORD in .env to enable")

    CORS(app, resources={r'/api/*': {'origins': '*'}}, supports_credentials=True)
    db.init_app(app)
    mail.init_app(app)

    app.register_blueprint(auth_bp,   url_prefix='/api')
    app.register_blueprint(leaves_bp, url_prefix='/api/leaves')
    app.register_blueprint(admin_bp,  url_prefix='/api/admin')
    app.register_blueprint(notifs_bp, url_prefix='/api/notifications')

    # ── Global JSON error handlers ────────────────────────────
    # These ensure Flask NEVER returns an HTML error page or empty body.
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({'status': 'error', 'message': 'Bad request'}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({'status': 'error', 'message': 'Forbidden'}), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'status': 'error', 'message': 'Route not found'}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({'status': 'error', 'message': 'Method not allowed'}), 405

    @app.errorhandler(Exception)
    def handle_exception(e):
        # Catches any unhandled 500-level error and always returns JSON
        print(f"[ERROR] Unhandled exception:\n{traceback.format_exc()}")
        return jsonify({'status': 'error', 'message': 'Internal server error — check backend logs'}), 500

    # ── DB init with schema-mismatch auto-recovery ────────────
    with app.app_context():
        try:
            db.create_all()
            print("[DB] Tables created / verified OK.")
            _seed_admin(app)
        except Exception as e:
            # Existing DB has a stale schema (missing columns, etc.)
            print(f"[DB] Schema mismatch: {e}")
            print("[DB] Dropping and recreating all tables...")
            try:
                db.drop_all()
                db.create_all()
                print("[DB] Tables recreated successfully.")
                _seed_admin(app)
            except Exception as e2:
                print(f"[DB] CRITICAL — could not initialize DB: {e2}\n{traceback.format_exc()}")

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
