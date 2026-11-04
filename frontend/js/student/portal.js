// ===== Student Portal =====

const StudentPortal = {
    student: null,
    exams: [],
    results: [],

    async init() {
        // Check session
        const session = Storage.getStudentSession();
        if (!session) {
            alert('انتهت الجلسة');
            window.location.href = '../index.html';
            return;
        }

        this.student = session.data;

        // Show welcome
        document.getElementById('studentName').textContent = this.student.name;
        document.getElementById('groupName').textContent = this.student.groups.name;

        // Bind events
        this.bindEvents();

        // Load data
        await this.loadExams();
        await this.loadResults();

        // Check URL params
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab');
        if (tab === 'results') {
            this.switchTab('results');
        }
    },

    bindEvents() {
        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            Storage.clearStudentSession();
            window.location.href = '../index.html';
        });

        // Tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;
                this.switchTab(targetTab);
            });
        });
    },

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(`${tabName}Tab`).classList.add('active');
    },

    async loadExams() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/student/exams?group_id=${this.student.group_id}`);
            this.exams = await response.json();
            this.renderExams();
        } catch (error) {
            console.error('Load exams error:', error);
        }
    },

    renderExams() {
        const container = document.getElementById('examsList');

        if (this.exams.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <p>لا توجد امتحانات متاحة حالياً</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.exams.map(exam => `
            <a href="#" class="exam-card-link" onclick="StudentPortal.startExam('${exam.id}'); return false;">
                <div class="exam-card">
                    <div class="exam-card-header">
                        <h3 class="exam-title">${exam.title}</h3>
                        <span class="status-badge status-active">متاح</span>
                    </div>
                    <div class="exam-meta">
                        <span>⏱️ ${exam.duration_minutes} دقيقة</span>
                        <span>📋 ${exam.questions?.length || 0} سؤال</span>
                    </div>
                    <button class="btn btn-primary btn-block">ابدأ الامتحان</button>
                </div>
            </a>
        `).join('');
    },

    startExam(examId) {
        // Check if already submitted
        const draft = Storage.getDraft(this.student.code, examId);
        if (draft && draft.submitted) {
            alert('لقد قمت بتسليم هذا الامتحان بالفعل');
            return;
        }

        // Start exam
        ExamScreen.init(examId);
    },

    async loadResults() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/student/results?student_id=${this.student.id}`);
            this.results = await response.json();
            this.renderResults();
        } catch (error) {
            console.error('Load results error:', error);
        }
    },

    renderResults() {
        const container = document.getElementById('resultsList');

        if (this.results.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <p>لا توجد نتائج بعد</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.results.map(result => {
            const percentage = result.total > 0 ? (result.score / result.total * 100).toFixed(2) : 0;
            const hasEssay = result.essay_scores === null;

            return `
                <div class="card">
                    <h3>${result.exam.title}</h3>
                    <div class="card-meta">
                        <span>تاريخ التسليم: ${new Date(result.submitted_at).toLocaleDateString('ar-EG')}</span>
                    </div>
                    ${hasEssay ? `
                        <div class="status-badge status-pending">قيد التصحيح</div>
                        <p style="margin-top: 1rem; color: var(--text-secondary);">بعض الأسئلة المقالية قيد التصحيح</p>
                    ` : `
                        <div style="margin-top: 1rem;">
                            <div style="font-size: 2rem; font-weight: 700; color: var(--primary);">${percentage}%</div>
                            <div style="color: var(--text-secondary);">${result.score} من ${result.total}</div>
                        </div>
                    `}
                    ${result.force_zero ? `
                        <div class="error" style="margin-top: 1rem;">
                            تم تسجيل مخالفات. الدرجة: 0
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }
};

window.StudentPortal = StudentPortal;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    StudentPortal.init();
});
