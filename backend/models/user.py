from extensions import db

class User(db.Model):
    __tablename__ = 'user'  # <--- CRITICAL: Explicit table name for Foreign Keys
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    points = db.Column(db.Integer, default=0)
    
    # Profile Fields
    university = db.Column(db.String(150), nullable=True)
    branch = db.Column(db.String(100), nullable=True)     # Added back
    semester = db.Column(db.String(50), nullable=True)    # Added back
    bio = db.Column(db.String(500), nullable=True)
    avatar = db.Column(db.String(200), default=None)
    
    # Admin & Security
    is_admin = db.Column(db.Boolean, default=False)
    is_blocked = db.Column(db.Boolean, default=False)     # Added back
    
    # OTP Fields
    reset_otp = db.Column(db.String(6), nullable=True)
    reset_otp_expiry = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'points': self.points,
            'university': self.university or "",
            'branch': self.branch or "",
            'semester': self.semester or "",
            'bio': self.bio or "",
            'avatar': self.avatar,
            'is_admin': self.is_admin,
            'is_blocked': self.is_blocked
        }