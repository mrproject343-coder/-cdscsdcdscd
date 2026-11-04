// ===== Storage Utilities =====

const Storage = {
    // localStorage (دائم)
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    },

    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Storage error:', e);
            return null;
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    },

    clear() {
        localStorage.clear();
    },

    // sessionStorage (مؤقت)
    sessionSet(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Session storage error:', e);
            return false;
        }
    },

    sessionGet(key) {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Session storage error:', e);
            return null;
        }
    },

    sessionRemove(key) {
        sessionStorage.removeItem(key);
    },

    sessionClear() {
        sessionStorage.clear();
    },

    // Student exam draft (حفظ الإجابات المؤقتة)
    saveDraft(studentCode, examId, data) {
        const key = `draft_${studentCode}_${examId}`;
        this.set(key, {
            ...data,
            savedAt: new Date().toISOString()
        });
    },

    getDraft(studentCode, examId) {
        const key = `draft_${studentCode}_${examId}`;
        return this.get(key);
    },

    clearDraft(studentCode, examId) {
        const key = `draft_${studentCode}_${examId}`;
        this.remove(key);
    },

    // Student session (24 ساعة)
    setStudentSession(studentCode, studentData) {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + CONFIG.STUDENT_SESSION_HOURS);
        
        this.sessionSet('student_session', {
            code: studentCode,
            data: studentData,
            expiresAt: expiresAt.toISOString()
        });
    },

    getStudentSession() {
        const session = this.sessionGet('student_session');
        if (!session) return null;

        // Check expiration
        const now = new Date();
        const expiresAt = new Date(session.expiresAt);
        
        if (now > expiresAt) {
            this.sessionClear();
            return null;
        }

        return session;
    },

    clearStudentSession() {
        this.sessionClear();
    }
};

window.Storage = Storage;
