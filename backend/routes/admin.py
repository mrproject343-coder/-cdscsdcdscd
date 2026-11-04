# ===== Admin Routes =====

from flask import Blueprint, jsonify, request
from utils.supabase_client import supabase

bp = Blueprint('admin', __name__)

@bp.route('/stats', methods=['GET'])
def get_stats():
    """إحصائيات المنصة"""
    try:
        # Count teachers
        teachers = supabase.table('teachers').select('id', count='exact').execute()
        
        # Count students
        students = supabase.table('students').select('id', count='exact').execute()
        
        # Count exams
        exams = supabase.table('exams').select('id', count='exact').execute()
        
        # Count groups
        groups = supabase.table('groups').select('id', count='exact').execute()
        
        # Count submissions
        submissions = supabase.table('submissions').select('id', count='exact').execute()
        
        return jsonify({
            'teachers': teachers.count,
            'students': students.count,
            'exams': exams.count,
            'groups': groups.count,
            'submissions': submissions.count
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/teachers', methods=['GET'])
def get_teachers():
    """قائمة المدرسين"""
    try:
        status = request.args.get('status')
        query = supabase.table('teachers').select('*')
        
        if status:
            query = query.eq('status', status)
        
        result = query.order('created_at', desc=True).execute()
        return jsonify(result.data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/teachers/<teacher_id>/status', methods=['PUT'])
def update_teacher_status(teacher_id):
    """تحديث حالة المدرس"""
    try:
        data = request.json
        status = data.get('status')  # active, rejected, suspended
        
        if status not in ['active', 'rejected', 'suspended']:
            return jsonify({'error': 'Invalid status'}), 400
        
        result = supabase.table('teachers')\
            .update({'status': status})\
            .eq('id', teacher_id)\
            .execute()
        
        return jsonify(result.data[0])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/exams', methods=['GET'])
def get_all_exams():
    """كل الامتحانات"""
    try:
        result = supabase.table('exams')\
            .select('*, teachers(name, subject)')\
            .order('created_at', desc=True)\
            .execute()
        return jsonify(result.data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/exams/<exam_id>', methods=['DELETE'])
def delete_exam(exam_id):
    """حذف امتحان"""
    try:
        result = supabase.table('exams').delete().eq('id', exam_id).execute()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
