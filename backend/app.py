import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from extensions import db
from mail_service import mail
from routes.auth   import auth_bp
from routes.leaves import leaves_bp
from routes.admin  import admin_bp
from routes.notifications import notifs_bp

# Load .env file if it exists
load_dotenv()

def create_app():
    app = Flask(__name__)

    # ── Core config ──────────────────────────────────────────
    app.config['SECRET_KEY']                     = os.getenv('SECRET_KEY', 'absentalert-secret-2024')
    app.config['SQLALCHEMY_DATABASE_URI']        = 'sqlite:///absentalert.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SESSION_COOKIE_SAMESITE']        = 'Lax'
    app.config['SESSION_COOKIE_SECURE']          = False

    # ── Flask-Mail config (loaded from .env) ─────────────────
    app.config['MAIL_SERVER']         = os.getenv('MAIL_SERVER',   'smtp.gmail.com')
    app.config['MAIL_PORT']           = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS']        = True
    app.config['MAIL_USE_SSL']        = False
    app.config['MAIL_USERNAME']       = os.getenv('MAIL_USERNAME', '')
    app.config['MAIL_PASSWORD']       = os.getenv('MAIL_PASSWORD', '')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv(
        'MAIL_DEFAULT_SENDER',
        f"AbsentAlert <{os.getenv('MAIL_USERNAME', 'noreply@absentalert.com')}>"
    )

    # ── Email enabled only if credentials are set ─────────────
    app.config['MAIL_ENABLED'] = bool(
        app.config['MAIL_USERNAME'] and
        app.config['MAIL_PASSWORD'] and
        app.config['MAIL_USERNAME'] != 'your_email@gmail.com'
    )

    if app.config['MAIL_ENABLED']:
        print(f"[MAIL] Email enabled — sending from {app.config['MAIL_USERNAME']}")
    else:
        print("[MAIL] Email disabled — set MAIL_USERNAME and MAIL_PASSWORD in .env to enable")

    CORS(app, resources={r'/api/*': {'origins': '*'}}, supports_credentials=True)
    db.init_app(app)
    mail.init_app(app)

    app.register_blueprint(auth_bp,   url_prefix='/api')
    app.register_blueprint(leaves_bp, url_prefix='/api/leaves')
    app.register_blueprint(admin_bp,  url_prefix='/api/admin')
    app.register_blueprint(notifs_bp, url_prefix='/api/notifications')

    with app.app_context():
        db_path = os.path.join(app.instance_path, 'absentalert.db')
        db.create_all()
        if not os.path.exists(db_path) or os.path.getsize(db_path) < 1000:
            from seed import seed_db
            seed_db()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
