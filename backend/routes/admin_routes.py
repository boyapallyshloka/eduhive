from flask import Blueprint, request, jsonify
from models.user import db, User
from models.resource import Resource
from models.forum import Question, Answer

admin_bp = Blueprint('admin_bp', __name__)

# --- MIDDLEWARE (Manual Check) ---
def is_admin(user_id):
    user = User.query.get(user_id)
    return user and user.is_admin

# 1. Get All Stats (For Admin Dashboard)
@admin_bp.route('/stats', methods=['GET'])
def get_stats():
    user_id = request.args.get('user_id')
    if not is_admin(user_id): return jsonify({'error': 'Unauthorized'}), 403

    return jsonify({
        # User Stats
        'total_users': User.query.count(),
        'admins': User.query.filter_by(is_admin=True).count(),
        'students': User.query.filter_by(is_admin=False).count(),
        
        # Resource Stats
        'total_resources': Resource.query.count(),
        
        # Forum Stats
        'questions': Question.query.count(),
        'answers': Answer.query.count()
    })

# 2. Manage Users
@admin_bp.route('/users', methods=['GET'])
def list_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users])

@admin_bp.route('/users/action', methods=['POST'])
def user_action():
    data = request.json
    target_id = data.get('target_id')
    action = data.get('action') # 'block', 'unblock', 'delete'
    
    user = User.query.get(target_id)
    if not user: return jsonify({'error': 'User not found'}), 404

    if action == 'block': user.is_blocked = True
    elif action == 'unblock': user.is_blocked = False
    elif action == 'delete': db.session.delete(user)
    
    db.session.commit()
    return jsonify({'message': f'User {action}ed successfully'})

# 3. Manage Resources (Delete)
@admin_bp.route('/resource/<int:id>', methods=['DELETE'])
def delete_resource(id):
    res = Resource.query.get_or_404(id)
    db.session.delete(res)
    db.session.commit()
    return jsonify({'message': 'Resource deleted'})

# 4. Manage Forum (Delete Posts)
@admin_bp.route('/forum/question/<int:id>', methods=['DELETE'])
def delete_question(id):
    q = Question.query.get_or_404(id)
    db.session.delete(q)
    db.session.commit()
    return jsonify({'message': 'Question deleted'})