import os
import json
import re
from flask import Blueprint, request, jsonify, current_app
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


# ✅ Lazy load Gemini ONLY when needed
def get_ai_client():
    try:
        from google import generativeai as genai
    except ImportError:
        return None, "Google AI library not installed"

    api_key = current_app.config.get('GEMINI_API_KEY') or os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return None, "GEMINI_API_KEY missing"

    genai.configure(api_key=api_key)
    return genai, None


def extract_text_from_pdf(filename):
    try:
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        file_path = os.path.join(upload_folder, filename)

        if not os.path.exists(file_path):
            return None

        reader = pypdf.PdfReader(file_path)
        text = ""

        for page in reader.pages[:8]:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"

        return text.strip()

    except Exception as e:
        print(f"PDF Read Error: {e}")
        return None


def generate_with_fallback(prompt):
    genai, error = get_ai_client()
    if error:
        return None, error

    last_error = None

    for model_id in AI_MODELS_TO_TRY:
        try:
            model = genai.GenerativeModel(model_id)
            response = model.generate_content(prompt)
            return response.text, None
        except Exception as e:
            last_error = str(e)
            print(f"Model {model_id} failed: {last_error}")

    return None, f"All models failed: {last_error}"


# -------------------- ASK AI --------------------
@ai_bp.route('/ask', methods=['POST'])
def ask_ai():
    try:
        data = request.json
        question = data.get('question')
        resource_id = data.get('resource_id')

        if not question:
            return jsonify({'error': 'No question provided'}), 400

        context = ""

        if resource_id:
            resource = Resource.query.get(resource_id)
            if resource:
                pdf_text = extract_text_from_pdf(resource.filename)
                if pdf_text:
                    context = pdf_text[:7000]

        prompt = f"""
You are an expert engineering tutor.

Context:
{context}

Question:
{question}
"""

        answer_text, error = generate_with_fallback(prompt)

        if error:
            return jsonify({'error': error}), 500

        return jsonify({'answer': answer_text}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# -------------------- QUIZ --------------------
@ai_bp.route('/quiz', methods=['POST'])
def generate_quiz():
    try:
        data = request.json
        topic = data.get('topic')

        if not topic:
            return jsonify({'error': 'Topic required'}), 400

        prompt = f"""
Create 10 multiple choice questions about {topic}.
Return only plain text.
"""

        quiz_text, error = generate_with_fallback(prompt)

        if error:
            return jsonify({'error': error}), 500

        return jsonify({'quiz': quiz_text}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# -------------------- SUMMARY --------------------
@ai_bp.route('/summarize/<int:resource_id>', methods=['GET'])
def summarize_resource(resource_id):
    try:
        resource = Resource.query.get(resource_id)
        if not resource:
            return jsonify({'error': 'Resource not found'}), 404

        pdf_text = extract_text_from_pdf(resource.filename)

        if not pdf_text:
            pdf_text = resource.description or resource.title

        prompt = f"""
Summarize this engineering content clearly:

{pdf_text[:8000]}
"""

        summary, error = generate_with_fallback(prompt)

        if error:
            return jsonify({'error': error}), 500

        return jsonify({'summary': summary}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500