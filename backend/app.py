import os
import sys
import traceback

# Add backend directory to path so imports work when run from parent folder
_backend_dir = os.path.dirname(os.path.abspath(__file__))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from flask_session import Session
from mail_service import mail
from routes.auth   import auth_bp
from routes.leaves import leaves_bp
from routes.admin  import admin_bp
from routes.notifications import notifs_bp

load_dotenv(os.path.join(_backend_dir, '.env'))


def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY']              = os.getenv('SECRET_KEY', 'absentalert-secret-2024')

    # Server-side filesystem session — fixes cookie issues through Vite proxy
    app.config['SESSION_TYPE']            = 'filesystem'
    app.config['SESSION_FILE_DIR']        = os.path.join(_backend_dir, 'flask_sessions')
    app.config['SESSION_PERMANENT']       = False
    app.config['SESSION_USE_SIGNER']      = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE']   = False
    app.config['SESSION_COOKIE_HTTPONLY'] = True

    # Flask-Mail
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

    # CORS — must specify exact origin (not wildcard) when credentials=True
    CORS(app,
         resources={r'/api/*': {'origins': ['http://localhost:3000', 'http://127.0.0.1:3000']}},
         supports_credentials=True)

    Session(app)
    mail.init_app(app)

    app.register_blueprint(auth_bp,   url_prefix='/api')
    app.register_blueprint(leaves_bp, url_prefix='/api/leaves')
    app.register_blueprint(admin_bp,  url_prefix='/api/admin')
    app.register_blueprint(notifs_bp, url_prefix='/api/notifications')

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
        print(f"[ERROR] Unhandled exception:\n{traceback.format_exc()}")
        return jsonify({'status': 'error', 'message': 'Internal server error — check backend logs'}), 500

    with app.app_context():
        try:
            from extensions import get_db
            from models import _ensure_indexes
            db = get_db()
            db.command('ping')
            _ensure_indexes(db)
            print("[DB] MongoDB connected and indexes ensured.")
        except Exception as e:
            print(f"[DB] MongoDB connection failed: {e}\n{traceback.format_exc()}")

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
