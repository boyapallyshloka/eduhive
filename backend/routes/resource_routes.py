import os
import time
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from extensions import db
from models.resource import Resource
from models.user import User

resource_bp = Blueprint('resource_bp', __name__)

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- 1. UPLOAD RESOURCE ---
@resource_bp.route('/upload', methods=['POST'])
def upload_resource():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        if not allowed_file(file.filename):
            return jsonify({'error': 'Only PDF files are allowed'}), 400

        # Get Data
        title = request.form.get('title')
        university = request.form.get('university')
        course = request.form.get('course')
        semester = request.form.get('semester')
        description = request.form.get('description', '')
        tags = request.form.get('tags', '')
        user_id = request.form.get('user_id')

        # Validate - Allow uploads without detailed metadata if it's from the Chatbot
        if not title:
            return jsonify({'error': 'Title is required'}), 400

        # Save File
        filename = secure_filename(file.filename)
        timestamp = int(time.time())
        unique_filename = f"{timestamp}_{filename}"
        
        upload_path = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        if not os.path.exists(upload_path):
            os.makedirs(upload_path)
            
        file.save(os.path.join(upload_path, unique_filename))

        # Save DB Entry
        new_resource = Resource(
            title=title,
            university=university,
            course=course,
            semester=semester,
            description=description,
            tags=tags,
            filename=unique_filename,
            user_id=int(user_id) if user_id else None
        )
        
        db.session.add(new_resource)
        
        # Award XP
        user_points = 0
        if user_id:
            user = User.query.get(int(user_id))
            if user:
                user.points += 50
                user_points = user.points
            
        db.session.commit()

        # --- FIX IS HERE: Return the full resource object ---
        return jsonify({
            'message': 'Uploaded!', 
            'new_points': user_points,
            'resource': new_resource.to_dict() # <--- THIS WAS MISSING
        }), 201

    except Exception as e:
        print(f"❌ UPLOAD ERROR: {e}")
        return jsonify({'error': str(e)}), 500

# --- 2. SEARCH RESOURCES ---
@resource_bp.route('/search', methods=['GET'])
def search_resources():
    try:
        query = request.args.get('q', '').lower()
        uni = request.args.get('university')
        sem = request.args.get('semester')
        course = request.args.get('course')

        sql = Resource.query
        
        if uni: sql = sql.filter(Resource.university.ilike(f"%{uni}%"))
        if sem: sql = sql.filter(Resource.semester == sem)
        if course: sql = sql.filter(Resource.course.ilike(f"%{course}%"))
        
        if query:
            sql = sql.filter(
                (Resource.title.ilike(f"%{query}%")) | 
                (Resource.tags.ilike(f"%{query}%"))
            )
            
        results = sql.order_by(Resource.upload_date.desc()).all()
        return jsonify([r.to_dict() for r in results]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- 3. GET RESOURCE DETAILS (JSON) ---
@resource_bp.route('/<int:resource_id>', methods=['GET'])
def get_resource(resource_id):
    try:
        resource = Resource.query.get(resource_id)
        if not resource:
            return jsonify({'error': 'Resource not found'}), 404
            
        uploader = User.query.get(resource.user_id) if resource.user_id else None
        data = resource.to_dict()
        data['uploader_name'] = uploader.username if uploader else "Unknown"
        
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- 4. GET RESOURCE PDF BY ID ---
@resource_bp.route('/file/<int:resource_id>', methods=['GET'])
def get_resource_file(resource_id):
    try:
        resource = Resource.query.get(resource_id)
        if not resource:
            return jsonify({'error': 'Resource not found'}), 404
            
        upload_path = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        return send_from_directory(upload_path, resource.filename)
    except Exception as e:
        return jsonify({'error': str(e)}), 404

# --- 5. GET RESOURCE PDF BY FILENAME ---
@resource_bp.route('/uploads/<filename>')
def serve_file(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)