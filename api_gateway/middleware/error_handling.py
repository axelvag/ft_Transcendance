# middleware/error_handling.py
from flask import Blueprint, jsonify
from werkzeug.exceptions import HTTPException

error_handling_bp = Blueprint('error_handling', __name__)

@error_handling_bp.app_errorhandler(HTTPException)
def handle_http_exception(e):
    response = jsonify(error=str(e))
    response.status_code = e.code
    return response
