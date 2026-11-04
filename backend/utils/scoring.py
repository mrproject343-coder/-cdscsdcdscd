# ===== Scoring System =====

import re

def normalize_arabic(text):
    """توحيد النص العربي"""
    if not text:
        return ""
    
    text = str(text).strip()
    
    # Normalize alef variants
    text = re.sub(r'[أإآ]', 'ا', text)
    
    # Normalize taa marbuta
    text = text.replace('ة', 'ه')
    
    # Normalize alef maksura
    text = text.replace('ى', 'ي')
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    return text.lower()

def check_answer(question_type, correct_answer, student_answer):
    """التحقق من الإجابة"""
    
    # MCQ
    if question_type == 'mcq':
        return correct_answer == student_answer
    
    # True/False
    if question_type == 'true_false':
        return correct_answer == student_answer
    
    # Fill in the blank
    if question_type == 'fill':
        return normalize_arabic(correct_answer) == normalize_arabic(student_answer)
    
    # Matching
    if question_type == 'match':
        return correct_answer == student_answer
    
    # Ordering
    if question_type == 'order':
        return correct_answer == student_answer
    
    # Essay (requires manual grading)
    if question_type == 'essay':
        return None  # Will be graded manually
    
    return False

def calculate_score(questions, answers):
    """حساب الدرجة"""
    total_points = 0
    earned_points = 0
    details = []
    
    for question in questions:
        q_id = question['id']
        q_type = question['type']
        q_points = question['points']
        correct = question.get('correct_answer')
        student = answers.get(q_id)
        
        total_points += q_points
        
        # Check answer
        if q_type == 'essay':
            # Essay - skip for now (manual grading)
            details.append({
                'question_id': q_id,
                'type': q_type,
                'points': q_points,
                'earned': None,
                'status': 'pending'
            })
        else:
            is_correct = check_answer(q_type, correct, student)
            earned = q_points if is_correct else 0
            earned_points += earned
            
            details.append({
                'question_id': q_id,
                'type': q_type,
                'points': q_points,
                'earned': earned,
                'status': 'correct' if is_correct else 'incorrect'
            })
    
    percentage = (earned_points / total_points * 100) if total_points > 0 else 0
    
    # Grade
    if percentage >= 85:
        grade = 'ممتاز'
    elif percentage >= 75:
        grade = 'جيد جداً'
    elif percentage >= 60:
        grade = 'جيد'
    elif percentage >= 40:
        grade = 'مقبول'
    else:
        grade = 'ضعيف'
    
    return {
        'score': earned_points,
        'total': total_points,
        'percentage': percentage,
        'grade': grade,
        'details': details
    }
