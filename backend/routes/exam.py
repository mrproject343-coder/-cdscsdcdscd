# ===== Exam Routes =====

from flask import Blueprint, jsonify, request
from utils.supabase_client import supabase
from utils.scoring import calculate_score

bp = Blueprint('exam', __name__)

@bp.route('/<exam_id>', methods=['GET'])
def get_exam(exam_id):
    """الحصول على تفاصيل الامتحان"""
    try:
        result = supabase.table('exams')\
            .select('*')\
            .eq('id', exam_id)\
            .single()\
            .execute()
        
        return jsonify(result.data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/submit', methods=['POST'])
def submit_exam():
    """تسليم الامتحان"""
    data = request.json
    
    try:
        # Calculate score
        score_result = calculate_score(data['questions'], data['answers'])
        
        # Save submission
        submission = supabase.table('submissions').insert([{
            'exam_id': data['exam_id'],
            'student_id': data['student_id'],
            'answers': data['answers'],
            'score': score_result['score'],
            'total': score_result['total'],
            'cheat_log': data.get('cheat_log', []),
            'force_zero': data.get('force_zero', False),
            'submitted_at': data['submitted_at']
        }]).execute()
        
        return jsonify(submission.data[0]), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/submissions/<submission_id>/grade-essay', methods=['PUT'])
def grade_essay(submission_id):
    """تصحيح المقالي"""
    data = request.json
    
    try:
        # Update essay scores
        result = supabase.table('submissions')\
            .update({'essay_scores': data['essay_scores']})\
            .eq('id', submission_id)\
            .execute()
        
        # Recalculate total score
        submission = result.data[0]
        new_score = submission['score'] + sum(data['essay_scores'].values())
        
        supabase.table('submissions')\
            .update({'score': new_score})\
            .eq('id', submission_id)\
            .execute()
        
        return jsonify({'success': True, 'new_score': new_score})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
