import random
import string
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Message
from models.user import  User
from werkzeug.utils import secure_filename
from sqlalchemy import desc
import os
import datetime
import jwt
from extensions import db, mail

auth_bp = Blueprint('auth_bp', __name__)

# Temporary OTP storage
otp_store = {}

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        email = data.get('email')
        username = data.get('username')
        password = data.get('password')

        # 1. Validation
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 400

        # 2. Generate OTP
        otp = ''.join(random.choices(string.digits, k=6))
        
        # 3. Store Data Temporarily (Waiting for Verification)
        otp_store[email] = {
            'username': username,
            'email': email,
            'password': generate_password_hash(password),
            'otp': otp
        }

        # 4. Try to Send Email (But don't crash if it fails)
        try:
            mail = current_app.extensions.get('mail') # <--- Safe way to get mail without circular import
            if mail:
                msg = Message('Your EduHive OTP', sender='noreply@eduhive.com', recipients=[email])
                msg.body = f"Your verification code is: {otp}"
                mail.send(msg)
        except Exception as e:
            print(f"⚠️ Email failed to send (Check config.py): {e}")
            # We continue anyway because we print the OTP below

        # 5. CRITICAL: Print OTP to Console (So you can use it)
        print(f"\n✅ ==================================")
        print(f"✅ OTP for {email}: {otp}")
        print(f"✅ ==================================\n")

        return jsonify({'message': 'OTP sent successfully'}), 200

    except Exception as e:
        print(f"❌ Register Route Error: {e}")
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    try:
        data = request.json
        email = data.get('email')
        otp = data.get('otp')

        if email in otp_store and otp_store[email]['otp'] == otp:
            # Create Real User in DB
            user_data = otp_store[email]
            new_user = User(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password'], # Already hashed
                points=0
            )
            db.session.add(new_user)
            db.session.commit()
            
            del otp_store[email] # Clear OTP
            return jsonify({'message': 'Account created successfully'}), 201
        
        return jsonify({'error': 'Invalid OTP'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data.get('email')).first()

    if user and check_password_hash(user.password, data.get('password')):
        return jsonify({
            'message': 'Login successful',
            'token': 'dummy-jwt-token', # In real app, use create_access_token(identity=user.id)
            'user': user.to_dict()
        }), 200

    return jsonify({'error': 'Invalid credentials'}), 401
# --- 1. SEND OTP (FORGOT PASSWORD) ---
@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.json
        email = data.get('email')
        
        user = User.query.filter_by(email=email).first()
        
        if not user:
            print(f"⚠️ OTP Request for unknown email: {email}")
            return jsonify({'message': 'OTP sent if account exists'}), 200

        # Generate 6-digit OTP
        otp = str(random.randint(100000, 999999))
        
        # Save to DB
        user.reset_otp = otp
        
        # --- FIX: Use explicit datetime.datetime.now() ---
        # This prevents the "module has no attribute" error
        user.reset_otp_expiry = datetime.datetime.now() + datetime.timedelta(minutes=10)
        
        db.session.commit()

        # --- SEND EMAIL ---
        print(f"📧 Sending OTP to {email}...") 
        msg = Message("Reset Password - EduHive", recipients=[email])
        msg.body = f"Your Verification Code is: {otp}"
        msg.html = f"""
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4f46e5;">Reset Password</h2>
            <p>Use the code below to reset your password. It expires in 10 minutes.</p>
            <h1 style="background: #f3f4f6; padding: 10px; text-align: center; letter-spacing: 5px; border-radius: 5px;">{otp}</h1>
            <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
        """
        mail.send(msg)
        print("✅ OTP Email Sent Successfully!")
        return jsonify({'message': 'OTP sent to email'})

    except Exception as e:
        print(f"❌ ERROR in Forgot Password: {str(e)}")
        # Print the full error type to help debugging
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Internal Server Error'}), 500

# --- 2. VERIFY OTP & RESET PASSWORD ---
@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.json
        email = data.get('email')
        otp = data.get('otp')
        new_password = data.get('new_password')

        if not email or not otp or not new_password:
            return jsonify({'error': 'Missing fields'}), 400

        user = User.query.filter_by(email=email).first()
        
        # Verify User and OTP
        if not user or user.reset_otp != otp:
            return jsonify({'error': 'Invalid OTP'}), 400
            
        # Check Expiry (Explicit check)
        if user.reset_otp_expiry < datetime.datetime.now():
            return jsonify({'error': 'OTP has expired. Please request a new one.'}), 400

        # Reset Password
        user.password = generate_password_hash(new_password)
        user.reset_otp = None  # Clear OTP after use
        user.reset_otp_expiry = None
        db.session.commit()

        return jsonify({'message': 'Password updated successfully!'})
    
    except Exception as e:
        print(f"❌ ERROR in Reset Password: {str(e)}")
        return jsonify({'error': 'Failed to reset password'}), 500

@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    # In a real app, get ID from JWT Token. 
    # For now, we expect the frontend to send ?user_id=1
    user_id = request.args.get('user_id')
    if not user_id: return jsonify({'error': 'User ID missing'}), 400

    user = User.query.get(user_id)
    if not user: return jsonify({'error': 'User not found'}), 404

    return jsonify(user.to_dict())

@auth_bp.route('/profile/update', methods=['PUT'])
def update_profile():
    try:
        # 1. Check if user exists
        user_id = request.form.get('user_id')
        user = User.query.get(user_id)
        if not user: 
            return jsonify({'error': 'User not found'}), 404

        # 2. Update Text Fields
        if 'university' in request.form: user.university = request.form['university']
        if 'branch' in request.form: user.branch = request.form['branch']
        if 'semester' in request.form: user.semester = request.form['semester']
        if 'bio' in request.form: user.bio = request.form['bio']

        # 3. Handle Avatar Upload
        if 'avatar' in request.files:
            file = request.files['avatar']
            if file.filename != '':
                filename = secure_filename(f"avatar_{user.id}_{file.filename}")
                
                # --- FIX: Ensure folder exists before saving ---
                upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
                if not os.path.exists(upload_folder):
                    os.makedirs(upload_folder)
                # -----------------------------------------------

                file.save(os.path.join(upload_folder, filename))
                user.avatar = filename

        db.session.commit()
        
        return jsonify({'message': 'Profile updated', 'user': user.to_dict()})
    
    except Exception as e:
        print(f"ERROR: {str(e)}") # Print error to terminal for debugging
        return jsonify({'error': str(e)}), 500
@auth_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    # Fetch top 10 users sorted by points (Highest first)
    top_users = User.query.order_by(desc(User.points)).limit(10).all()
    
    # Return list of dictionaries
    return jsonify([u.to_dict() for u in top_users])
