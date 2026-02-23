from extensions import db
from datetime import datetime

class Resource(db.Model):
    
    __tablename__ = 'resource'
    id = db.Column(db.Integer, primary_key=True)
    
    # Core Metadata
    title = db.Column(db.String(150), nullable=False)
    university = db.Column(db.String(100), nullable=False)
    course = db.Column(db.String(100), nullable=False)
    semester = db.Column(db.String(50), nullable=False)
    
    # Details
    description = db.Column(db.Text, nullable=True)
    tags = db.Column(db.String(200), nullable=True)
    
    # File Storage
    filename = db.Column(db.String(200), nullable=False)
    # Note: We don't store absolute file_path to keep the DB portable. 
    # The path is constructed dynamically using UPLOAD_FOLDER in the app config.
    
    # Relationships & Timing
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'university': self.university,
            'course': self.course,
            'semester': self.semester,
            'description': self.description or "",
            'tags': self.tags or "",
            'filename': self.filename,
            # Format date as "YYYY-MM-DD HH:MM" for easy reading on Frontend
            'upload_date': self.upload_date.strftime('%Y-%m-%d %H:%M'),
            'user_id': self.user_id
        }