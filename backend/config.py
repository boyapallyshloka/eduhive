import os

class Config:
    # --- 1. Base Setup ---
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'another-secret-key'
    JWT_SECRET_KEY = 'super-secret-key-change-this'

    # --- 2. Database Configuration ---
    # This points to backend/instance/site.db
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASE_DIR, 'instance', 'site.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # --- 3. Upload Folder  ---
    # This creates the absolute path for: backend/uploads
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')

    # --- 4. Email Configuration ---
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = 'avulauday0301@gmail.com'
    MAIL_PASSWORD = 'apci uudy xcaj fstd'  # Google App Password
    MAIL_DEFAULT_SENDER = 'avulauday0301@gmail.com'

    # --- 5. AI Configuration ---
    GEMINI_API_KEY = "AIzaSyDmEVLOOb8FNmh9OnqsO62HF6On00ab9Is"