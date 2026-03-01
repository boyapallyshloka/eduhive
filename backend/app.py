import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from werkzeug.security import generate_password_hash
from config import Config
from extensions import db, mail
from models.user import User
from routes.auth_routes import auth_bp
from routes.resource_routes import resource_bp
from routes.ai_routes import ai_bp
from routes.forum_routes import forum_bp
from routes.admin_routes import admin_bp

app = Flask(__name__)
app.config.from_object(Config)


CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    supports_credentials=True
)

JWTManager(app)

# Init Extensions
db.init_app(app)
mail.init_app(app)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(resource_bp, url_prefix='/api/resource')
app.register_blueprint(ai_bp, url_prefix='/api/ai')
app.register_blueprint(forum_bp, url_prefix='/api/forum')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

# Create DB + Default Admin
with app.app_context():
    db.create_all()

    admin_email = 'admin@eduhive.com'
    if not User.query.filter_by(email=admin_email).first():
        print(f"⚙️ Creating default admin: {admin_email}")
        default_admin = User(
            username='Super Admin',
            email=admin_email,
            password=generate_password_hash('admin123'),
            is_admin=True,
            points=10000,
            university='EduHive HQ',
            bio='System Administrator'
        )
        db.session.add(default_admin)
        db.session.commit()
        print("✅ Default Admin Created Successfully!")

if __name__ == "__main__":
    upload_path = app.config.get("UPLOAD_FOLDER", "uploads")
    if not os.path.exists(upload_path):
        os.makedirs(upload_path)

    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)