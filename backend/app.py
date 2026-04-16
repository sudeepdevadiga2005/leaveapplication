from flask import Flask
from flask_cors import CORS
from extensions import db
from routes.auth   import auth_bp
from routes.leaves import leaves_bp
from routes.admin  import admin_bp

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY']                  = 'absentalert-secret-2024'
    app.config['SQLALCHEMY_DATABASE_URI']     = 'sqlite:///absentalert.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SESSION_COOKIE_SAMESITE']     = 'Lax'
    app.config['SESSION_COOKIE_SECURE']       = False

    CORS(app, resources={r'/api/*': {'origins': '*'}}, supports_credentials=True)
    db.init_app(app)

    app.register_blueprint(auth_bp,   url_prefix='/api')
    app.register_blueprint(leaves_bp, url_prefix='/api/leaves')
    app.register_blueprint(admin_bp,  url_prefix='/api/admin')

    with app.app_context():
        # delete old DB so schema is fresh
        import os
        db_path = os.path.join(app.instance_path, 'absentalert.db')
        if not os.path.exists(db_path):
            db.create_all()
            from seed import seed_db
            seed_db()
        else:
            db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
