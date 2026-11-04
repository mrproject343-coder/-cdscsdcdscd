# ===== Teacher Routes =====

from flask import Blueprint, jsonify, request
from utils.supabase_client import supabase
from utils.code_generator import generate_unique_code

bp = Blueprint('teacher', __name__)

@bp.route('/groups', methods=['GET'])
def get_groups():
    """قائمة المجموعات"""
    teacher_id = request.args.get('teacher_id')
    
    try:
        result = supabase.table('groups')\
            .select('*, students(count)')\
            .eq('teacher_id', teacher_id)\
            .order('created_at', desc=True)\
            .execute()
        return jsonify(result.data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/groups', methods=['POST'])
def create_group():
    """إنشاء مجموعة"""
    data = request.json
    
    try:
        result = supabase.table('groups').insert([{
            'teacher_id': data['teacher_id'],
            'name': data['name'],
            'welcome_message': data.get('welcome_message', '')
        }]).execute()
        
        return jsonify(result.data[0]), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/students', methods=['POST'])
def add_student():
    """إضافة طالب"""
    data = request.json
    
    try:
        # Generate unique code
        code = generate_unique_code()
        
        result = supabase.table('students').insert([{
            'group_id': data['group_id'],
            'name': data['name'],
            'code': code,
            'is_active': True
        }]).execute()
        
        return jsonify(result.data[0]), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/students/<student_id>/toggle', methods=['PUT'])
def toggle_student(student_id):
    """تفعيل/تعطيل طالب"""
    try:
        # Get current status
        current = supabase.table('students').select('is_active').eq('id', student_id).single().execute()
        new_status = not current.data['is_active']
        
        result = supabase.table('students')\
            .update({'is_active': new_status})\
            .eq('id', student_id)\
            .execute()
        
        return jsonify(result.data[0])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/exams', methods=['GET'])
def get_exams():
    """امتحانات المدرس"""
    teacher_id = request.args.get('teacher_id')
    
    try:
        result = supabase.table('exams')\
            .select('*, exam_groups(group:groups(name))')\
            .eq('teacher_id', teacher_id)\
            .order('created_at', desc=True)\
            .execute()
        return jsonify(result.data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/exams', methods=['POST'])
def create_exam():
    """إنشاء امتحان"""
    data = request.json
    
    try:
        # Create exam
        exam_result = supabase.table('exams').insert([{
            'teacher_id': data['teacher_id'],
            'title': data['title'],
            'template': data['template'],
            'duration_minutes': data['duration_minutes'],
            'scheduled_at': data.get('scheduled_at'),
            'questions': data['questions'],
            'status': 'draft'
        }]).execute()
        
        exam_id = exam_result.data[0]['id']
        
        # Link to groups
        if data.get('group_ids'):
            group_links = [{'exam_id': exam_id, 'group_id': gid} for gid in data['group_ids']]
            supabase.table('exam_groups').insert(group_links).execute()
        
        return jsonify(exam_result.data[0]), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/exams/<exam_id>/status', methods=['PUT'])
def update_exam_status(exam_id):
    """تحديث حالة الامتحان"""
    data = request.json
    
    try:
        result = supabase.table('exams')\
            .update({'status': data['status']})\
            .eq('id', exam_id)\
            .execute()
        
        return jsonify(result.data[0])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
