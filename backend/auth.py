"""
Authentication utilities: password hashing, JWT helpers
"""
import bcrypt
from flask_jwt_extended import create_access_token, get_jwt_identity
from datetime import timedelta
import os

def hash_password(password):
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password, password_hash):
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

def generate_token(user_id, role):
    """Generate JWT access token"""
    additional_claims = {'role': role}
    expires = timedelta(hours=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 1)))
    return create_access_token(
        identity=str(user_id),
        additional_claims=additional_claims,
        expires_delta=expires
    )

def get_current_user_id():
    """Get current user ID from JWT"""
    return get_jwt_identity()

# Role decorators
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt

def role_required(required_role):
    """Decorator to require specific role"""
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get('role') != required_role:
                return jsonify({'error': 'Unauthorized'}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

def candidate_required(fn):
    """Require candidate role"""
    return role_required('candidate')(fn)

def company_required(fn):
    """Require company role"""
    return role_required('company')(fn)

def admin_required(fn):
    """Require admin role"""
    return role_required('admin')(fn)
