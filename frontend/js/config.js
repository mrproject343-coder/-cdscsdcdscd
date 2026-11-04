// ===== Configuration =====
const CONFIG = {
    // Supabase
    SUPABASE_URL: 'https://izrbggkrznhvvzgnaspq.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6cmJnZ2tyem5odnZ6Z25hc3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3OTA2MDksImV4cCI6MjEwOTM2NjYwOX0.Yaghk2ZGTirk-r7tua3sJy9L9Arxi_YvaL1LNcctQFE',
    
    // Admin Email
    ADMIN_EMAIL: 'mrproject343@gmail.com',
    
    // Backend API (Python Flask)
    API_URL: 'http://localhost:5000/api',
    
    // Session Duration
    STUDENT_SESSION_HOURS: 24,
    
    // Anti-Cheat Settings
    ANTI_CHEAT: {
        MAX_VIOLATIONS: 3,
        GRACE_PERIOD_MS: 2000,
        COOLDOWN_MS: 5000
    },
    
    // Exam Settings
    EXAM: {
        AUTO_SAVE_INTERVAL_MS: 30000, // كل 30 ثانية
        WARNING_TIME_MINUTES: 5
    }
};

// Initialize Supabase Client
const supabase = window.supabase.createClient(
    CONFIG.SUPABASE_URL,
    CONFIG.SUPABASE_ANON_KEY
);

// Export for use in other modules
window.APP_CONFIG = CONFIG;
window.supabase = supabase;
