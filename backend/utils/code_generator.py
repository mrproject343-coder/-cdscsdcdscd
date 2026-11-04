# ===== Code Generator =====

import random
import string
from utils.supabase_client import supabase

def generate_code(length=8):
    """توليد كود عشوائي"""
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

def generate_unique_code():
    """توليد كود فريد (غير مكرر)"""
    max_attempts = 10
    
    for _ in range(max_attempts):
        code = generate_code()
        
        # Check if exists
        result = supabase.table('students')\
            .select('id')\
            .eq('code', code)\
            .execute()
        
        if not result.data:
            return code
    
    # Fallback: longer code
    return generate_code(12)
