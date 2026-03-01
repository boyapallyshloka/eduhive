import os

class Config:
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))

    SECRET_KEY = os.environ.get("SECRET_KEY")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")

    # ---- DATABASE CONFIG ----
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") + "?sslmode=require"

    if database_url:
        # Render gives postgres:// but SQLAlchemy needs postgresql://
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)

    SQLALCHEMY_DATABASE_URI = database_url or \
        "sqlite:///" + os.path.join(BASE_DIR, "instance", "site.db")

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ---- Uploads ----
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

    # ---- Mail ----
    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_USERNAME")

    # ---- Gemini ----
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")