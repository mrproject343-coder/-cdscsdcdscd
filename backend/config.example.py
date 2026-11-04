# ===== Configuration Example =====
# انسخ هذا الملف إلى config.py وغيّر القيم

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Supabase
    SUPABASE_URL = 'https://YOUR-PROJECT-ID.supabase.co'
    SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE'
    SUPABASE_SERVICE_KEY = 'YOUR_SUPABASE_SERVICE_KEY_HERE'
    
    # Admin
    ADMIN_EMAIL = 'your-admin-email@gmail.com'
    
    # Flask
    SECRET_KEY = os.environ.get('SECRET_KEY', 'change-this-in-production')
    DEBUG = True  # غيّرها لـ False في Production
