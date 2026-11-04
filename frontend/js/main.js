// ===== Main Application =====

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Auth
    await Auth.init();

    // Elements
    const loginBtn = document.getElementById('loginBtn');
    const teacherStartBtn = document.getElementById('teacherStartBtn');
    const studentStartBtn = document.getElementById('studentStartBtn');
    const studentModal = document.getElementById('studentModal');
    const closeModal = document.querySelector('.close');
    const studentLoginForm = document.getElementById('studentLoginForm');

    // Teacher Login
    loginBtn?.addEventListener('click', async () => {
        await Auth.signInWithGoogle();
    });

    teacherStartBtn?.addEventListener('click', async () => {
        await Auth.signInWithGoogle();
    });

    // Student Modal
    studentStartBtn?.addEventListener('click', () => {
        studentModal.classList.remove('hidden');
    });

    closeModal?.addEventListener('click', () => {
        studentModal.classList.add('hidden');
    });

    // Close modal on outside click
    studentModal?.addEventListener('click', (e) => {
        if (e.target === studentModal) {
            studentModal.classList.add('hidden');
        }
    });

    // Student Login
    studentLoginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('studentCode').value.trim();

        if (!code) {
            alert('من فضلك أدخل الكود');
            return;
        }

        // Verify student code
        const result = await verifyStudentCode(code);
        
        if (result.success) {
            Storage.setStudentSession(code, result.student);
            window.location.href = 'pages/student.html';
        } else {
            alert(result.error || 'الكود غير صحيح');
        }
    });
});

async function verifyStudentCode(code) {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('*, groups(*)')
            .eq('code', code)
            .eq('is_active', true)
            .single();

        if (error) throw error;

        if (!data) {
            return { success: false, error: 'الكود غير صحيح أو الطالب غير مفعّل' };
        }

        return { success: true, student: data };
    } catch (error) {
        console.error('Student verification error:', error);
        return { success: false, error: 'حدث خطأ، حاول مرة أخرى' };
    }
}
