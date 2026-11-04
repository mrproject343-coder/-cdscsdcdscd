# ===== Configuration =====

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Supabase
    SUPABASE_URL = 'https://izrbggkrznhvvzgnaspq.supabase.co'
    SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6cmJnZ2tyem5odnZ6Z25hc3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3OTA2MDksImV4cCI6MjEwOTM2NjYwOX0.Yaghk2ZGTirk-r7tua3sJy9L9Arxi_YvaL1LNcctQFE'
    SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6cmJnZ2tyem5odnZ6Z25hc3BxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mzc5MDYwOSwiZXhwIjoyMTA5MzY2NjA5fQ.OqE8HvciNcR7Kjbm7g3fM58DbGUbh0diuhRHpcx-s60'
    
    # Admin
    ADMIN_EMAIL = 'mrproject343@gmail.com'
    
    # Flask
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = True
