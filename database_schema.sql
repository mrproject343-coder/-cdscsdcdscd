-- ===== Ask-Me Platform Database Schema =====
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== Teachers Table =====
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    phone VARCHAR,
    subject VARCHAR,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'suspended')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_teachers_email ON teachers(email);
CREATE INDEX idx_teachers_status ON teachers(status);

-- ===== Groups Table =====
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    welcome_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_groups_teacher ON groups(teacher_id);

-- ===== Students Table =====
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    code VARCHAR UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_students_code ON students(code);
CREATE INDEX idx_students_group ON students(group_id);

-- ===== Exams Table =====
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    template VARCHAR DEFAULT 'template1',
    duration_minutes INTEGER NOT NULL,
    scheduled_at TIMESTAMP,
    questions JSONB NOT NULL,
    status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'closed')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exams_teacher ON exams(teacher_id);
CREATE INDEX idx_exams_status ON exams(status);

-- ===== Exam Groups (Many-to-Many) =====
CREATE TABLE IF NOT EXISTS exam_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(exam_id, group_id)
);

CREATE INDEX idx_exam_groups_exam ON exam_groups(exam_id);
CREATE INDEX idx_exam_groups_group ON exam_groups(group_id);

-- ===== Submissions Table =====
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    answers JSONB NOT NULL,
    score FLOAT,
    total FLOAT,
    essay_scores JSONB,
    cheat_log JSONB,
    force_zero BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP DEFAULT NOW(),
    graded_at TIMESTAMP
);

CREATE INDEX idx_submissions_exam ON submissions(exam_id);
CREATE INDEX idx_submissions_student ON submissions(student_id);

-- ===== Announcements Table =====
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_announcements_created ON announcements(created_at DESC);

-- ===== Functions =====

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS teachers_updated_at ON teachers;
CREATE TRIGGER teachers_updated_at
    BEFORE UPDATE ON teachers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS exams_updated_at ON exams;
CREATE TRIGGER exams_updated_at
    BEFORE UPDATE ON exams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ===== Row Level Security (Optional) =====
-- Enable RLS
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Public read access (adjust based on your needs)
CREATE POLICY "Public can read active exams" ON exams
    FOR SELECT USING (status = 'active');

CREATE POLICY "Students can read their groups" ON groups
    FOR SELECT USING (true);

CREATE POLICY "Students can read their data" ON students
    FOR SELECT USING (true);

-- Teachers can manage their own data
CREATE POLICY "Teachers can manage their groups" ON groups
    FOR ALL USING (true); -- Adjust with auth.uid() if using Supabase Auth

CREATE POLICY "Teachers can manage their exams" ON exams
    FOR ALL USING (true);

-- Students can submit
CREATE POLICY "Students can submit" ON submissions
    FOR INSERT WITH CHECK (true);

-- Announcements are public
CREATE POLICY "Public can read announcements" ON announcements
    FOR SELECT USING (true);

-- ===== Sample Data (Optional) =====
-- Uncomment to insert test data

-- INSERT INTO teachers (email, name, phone, subject, status) VALUES
-- ('teacher@example.com', 'أحمد محمد', '01234567890', 'physics', 'active');

COMMENT ON TABLE teachers IS 'المدرسين - معلومات المدرسين وحالاتهم';
COMMENT ON TABLE groups IS 'المجموعات - الفصول والسناتر';
COMMENT ON TABLE students IS 'الطلاب - بيانات الطلاب وأكوادهم';
COMMENT ON TABLE exams IS 'الامتحانات - تفاصيل الامتحانات والأسئلة';
COMMENT ON TABLE exam_groups IS 'ربط الامتحانات بالمجموعات';
COMMENT ON TABLE submissions IS 'تسليمات الطلاب - الإجابات والنتائج';
COMMENT ON TABLE announcements IS 'الإعلانات - رسائل عامة من الإدارة';
