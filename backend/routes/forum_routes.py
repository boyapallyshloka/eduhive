from flask import Blueprint, request, jsonify
from models.user import db, User
from models.forum import Question, Answer

forum_bp = Blueprint('forum_bp', __name__)

# 1. Get All Questions
@forum_bp.route('/list', methods=['GET'])
def list_questions():
    questions = Question.query.order_by(Question.timestamp.desc()).all()
    return jsonify([q.to_dict() for q in questions])

# 2. Post a Question
@forum_bp.route('/create', methods=['POST'])
def create_question():
    data = request.json
    new_q = Question(
        title=data['title'],
        content=data['content'],
        user_id=data['user_id']
    )
    db.session.add(new_q)
    db.session.commit()
    return jsonify({'message': 'Question posted!', 'question': new_q.to_dict()})

# 3. Get Single Question + Answers
@forum_bp.route('/<int:id>', methods=['GET'])
def get_question(id):
    q = Question.query.get_or_404(id)
    answers = Answer.query.filter_by(question_id=id).order_by(Answer.is_solution.desc(), Answer.upvotes.desc()).all()
    
    response = q.to_dict()
    response['answers'] = [a.to_dict() for a in answers]
    return jsonify(response)

# 4. Post an Answer
@forum_bp.route('/answer', methods=['POST'])
def post_answer():
    data = request.json
    new_a = Answer(
        content=data['content'],
        user_id=data['user_id'],
        question_id=data['question_id']
    )
    db.session.add(new_a)
    
    # Gamification: Give points for answering
    user = User.query.get(data['user_id'])
    if user: user.points += 20
        
    db.session.commit()
    return jsonify({'message': 'Answer posted!', 'answer': new_a.to_dict()})

# 5. Upvote an Answer
@forum_bp.route('/upvote/<int:answer_id>', methods=['POST'])
def upvote(answer_id):
    a = Answer.query.get_or_404(answer_id)
    a.upvotes += 1
    db.session.commit()
    return jsonify({'upvotes': a.upvotes})