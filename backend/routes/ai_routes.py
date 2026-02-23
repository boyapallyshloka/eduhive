import os
import json
import re
from flask import Blueprint, request, jsonify, current_app
import google.generativeai as genai
from extensions import db
from models.resource import Resource
import pypdf


ai_bp = Blueprint('ai_bp', __name__)

AI_MODELS_TO_TRY = [
    "gemini-2.0-flash-exp",   
    "gemini-2.5-flash",       
    "gemini-exp-1206",        
    "gemini-2.0-flash-lite"   
]

def get_ai_client():
    """Initializes the Gemini Client using the Config API Key."""
    api_key = current_app.config.get('GEMINI_API_KEY') or os.environ.get('GEMINI_API_KEY')
    if not api_key:
        print("❌ ERROR: GEMINI_API_KEY is missing.")
        return None
    return genai.Client(api_key=api_key)

def extract_text_from_pdf(filename):
    """Extracts text from the first 5 pages of a PDF file."""
    try:
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        file_path = os.path.join(upload_folder, filename)
        
        if not os.path.exists(file_path):
            return None

        reader = pypdf.PdfReader(file_path)
        text = ""
        # Read limited pages to stay within token limits and maintain speed
        for page in reader.pages[:8]: 
            text += page.extract_text() + "\n"
            
        return text.strip()
    except Exception as e:
        print(f"❌ PDF Read Error: {e}")
        return None

def generate_with_fallback(prompt, is_json=False):
    """Tries multiple AI models in sequence if one fails due to quota or errors."""
    client = get_ai_client()
    if not client: return None, "Server API Key missing"

    last_error = None
    for model_id in AI_MODELS_TO_TRY:
        try:
            if is_json:
                response = client.models.generate_content(
                    model=model_id,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json"
                    )
                )
            else:
                response = client.models.generate_content(
                    model=model_id, 
                    contents=prompt
                )
            return response.text, None
        except Exception as e:
            last_error = str(e)
            print(f"⚠️ Model {model_id} failed, trying next... Error: {last_error}")
    
    return None, f"All AI models failed. Last error: {last_error}"

# --- 1. CHAT WITH AI ---
@ai_bp.route('/ask', methods=['POST'])
def ask_ai():
    try:
        data = request.json
        question = data.get('question')
        resource_id = data.get('resource_id')
        context = data.get('context', '')

        # If a resource ID is provided, try to get PDF content for context
        if resource_id:
            resource = Resource.query.get(resource_id)
            if resource:
                pdf_text = extract_text_from_pdf(resource.filename)
                if pdf_text:
                    context = f"Document Title: {resource.title}\nContent:\n{pdf_text[:7000]}"

        if not question:
            return jsonify({'error': 'No question provided'}), 400

        prompt = f"You are an expert engineering tutor. Use the provided context to answer the student.\n\nContext:\n{context}\n\nQuestion: {question}"

        answer_text, error = generate_with_fallback(prompt, is_json=False)
        
        if error:
            status_code = 429 if "429" in error else 500
            return jsonify({'error': error}), status_code

        return jsonify({'answer': answer_text}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- 2. GENERATE QUIZ ---
@ai_bp.route('/quiz', methods=['POST'])
def generate_quiz():
    try:
        data = request.json
        resource_id = data.get('resource_id')
        topic = data.get('topic')
        difficulty = data.get('difficulty', 'Medium')
        
        context = ""
        
        # If resource_id is provided, pull the real topic and content from DB/PDF
        if resource_id:
            resource = Resource.query.get(resource_id)
            if resource:
                topic = resource.title
                pdf_content = extract_text_from_pdf(resource.filename)
                context = pdf_content[:8000] if pdf_content else ""
            else:
                return jsonify({'error': 'Resource not found'}), 404
        
        if not topic:
            return jsonify({'error': 'Topic or Resource ID is required'}), 400

        prompt = f"""
        Create a {difficulty} level quiz about "{topic}" for engineering students.
        Based on this content: {context if context else topic}

        Generate exactly 15 multiple-choice questions. 
        Respond ONLY with raw JSON. Do not include markdown formatting like ```json.
        
        Format:
        [
            {{
                "id": 1,
                "question": "Question text here?",
                "options": ["A) Choice 1", "B) Choice 2", "C) Choice 3", "D) Choice 4"],
                "answer": "A"
            }}
        ]
        """

        json_text, error = generate_with_fallback(prompt, is_json=True)
        
        if error:
            return jsonify({'error': error}), 500
        
        # Clean and Parse JSON
        clean_text = json_text.strip()
        clean_text = re.sub(r'^```json\s*|\s*```$', '', clean_text, flags=re.MULTILINE)
        quiz_data = json.loads(clean_text)

        return jsonify(quiz_data), 200

    except Exception as e:
        print(f"❌ QUIZ ERROR: {str(e)}")
        return jsonify({'error': f"Failed to generate quiz: {str(e)}"}), 400

# --- 3. SUMMARIZE RESOURCE ---
@ai_bp.route('/summarize/<int:resource_id>', methods=['GET'])
def summarize_resource(resource_id):
    try:
        resource = Resource.query.get(resource_id)
        if not resource:
            return jsonify({'error': 'Resource not found'}), 404
            
        pdf_content = extract_text_from_pdf(resource.filename)
        
        if pdf_content and len(pdf_content) > 50:
            content_to_summarize = pdf_content
        else:
            content_to_summarize = f"Title: {resource.title}\nDescription: {resource.description}"

        prompt = f"""
        Summarize the following engineering study document in 5 clear, high-impact bullet points.
        Capture the most important technical concepts.
        
        Document Content:
        {content_to_summarize[:10000]}
        """
        
        summary_text, error = generate_with_fallback(prompt, is_json=False)
        
        if error:
            return jsonify({'error': error}), 500
            
        return jsonify({'summary': summary_text}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
