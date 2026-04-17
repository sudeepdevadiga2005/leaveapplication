from flask import Blueprint, jsonify, session
from extensions import get_db
from models import Notification

notifs_bp = Blueprint('notifications', __name__)


@notifs_bp.route('/', methods=['GET'])
def get_notifs():
    uid = session.get('user_id')
    if not uid:
        return jsonify({'error': 'Not authenticated'}), 401
    db = get_db()
    n = Notification(db)
    notifs = n.find_by_user(uid)
    return jsonify([n.to_dict(x) for x in notifs]), 200


@notifs_bp.route('/read-all', methods=['PATCH'])
def mark_read():
    uid = session.get('user_id')
    if not uid:
        return jsonify({'error': 'Not authenticated'}), 401
    Notification(get_db()).mark_all_read(uid)
    return jsonify({'message': 'All marked read'}), 200
