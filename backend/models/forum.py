from models.user import db
from datetime import datetime

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    # Relationship to get the author's name
    author = db.relationship('User', backref='questions')
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Answers relationship
    answers = db.relationship('Answer', backref='question', cascade="all, delete-orphan", lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'author': self.author.username,
            'author_avatar': self.author.avatar,
            'timestamp': self.timestamp.strftime('%Y-%m-%d %H:%M'),
            'answer_count': len(self.answers)
        }

class Answer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    upvotes = db.Column(db.Integer, default=0)
    is_solution = db.Column(db.Boolean, default=False)
    
    author = db.relationship('User', backref='answers')
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'author': self.author.username,
            'author_avatar': self.author.avatar,
            'upvotes': self.upvotes,
            'is_solution': self.is_solution,
            'timestamp': self.timestamp.strftime('%Y-%m-%d %H:%M')
        }