# ===== Student Routes =====

from flask import Blueprint, jsonify, request
from utils.supabase_client import supabase

bp = Blueprint('student', __name__)

@bp.route('/verify', methods=['POST'])
def verify_code():
    """التحقق من كود الطالب"""
    data = request.json
    code = data.get('code')
    
    try:
        result = supabase.table('students')\
            .select('*, groups(*, teacher:teachers(name, subject))')\
            .eq('code', code)\
            .eq('is_active', True)\
            .single()\
            .execute()
        
        if not result.data:
            return jsonify({'error': 'Invalid code or inactive student'}), 404
        
        return jsonify(result.data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/exams', methods=['GET'])
def get_active_exams():
    """الامتحانات النشطة للطالب"""
    group_id = request.args.get('group_id')
    
    try:
        result = supabase.table('exam_groups')\
            .select('exam:exams(*)')\
            .eq('group_id', group_id)\
            .execute()
        
        # Filter active exams
        active_exams = [item['exam'] for item in result.data if item['exam']['status'] == 'active']
        
        return jsonify(active_exams)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/results', methods=['GET'])
def get_results():
    """نتائج الطالب"""
    student_id = request.args.get('student_id')
    
    try:
        result = supabase.table('submissions')\
            .select('*, exam:exams(title, questions)')\
            .eq('student_id', student_id)\
            .order('submitted_at', desc=True)\
            .execute()
        
        return jsonify(result.data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
