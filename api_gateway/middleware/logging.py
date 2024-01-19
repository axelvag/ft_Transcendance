# middleware/logging.py
from flask import Blueprint
import logging

logging_bp = Blueprint('logging', __name__)

@logging_bp.before_request
def log_request():
    # Log request details
    logging.info(f'Request - {request.method} {request.url} - {request.remote_addr}')
