// ===== Teacher Dashboard =====

const TeacherDashboard = {
    teacher: null,
    groups: [],
    exams: [],

    async init() {
        // Check auth
        await Auth.init();
        
        if (!Auth.isAuthenticated()) {
            window.location.href = '../index.html';
            return;
        }

        // Check teacher status
        const urlParams = new URLSearchParams(window.location.search);
        const onboarding = urlParams.get('onboarding');
        const status = urlParams.get('status');

        if (onboarding) {
            this.showOnboarding();
            return;
        }

        if (status === 'pending') {
            this.showPending();
            return;
        }

        if (status === 'rejected') {
            this.showRejected();
            return;
        }

        // Load teacher data
        this.teacher = await Auth.getTeacherByEmail(Auth.currentUser.email);
        
        if (!this.teacher) {
            this.showOnboarding();
            return;
        }

        if (this.teacher.status !== 'active') {
            this.showPending();
            return;
        }

        // Show dashboard
        this.showDashboard();
        this.bindEvents();
        this.loadGroups();
        this.loadExams();
        ExamBuilder.init();
    },

    showOnboarding() {
        document.getElementById('onboardingScreen').classList.remove('hidden');
        
        document.getElementById('onboardingForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const teacherData = {
                name: document.getElementById('teacherNameInput').value,
                phone: document.getElementById('teacherPhone').value,
                subject: document.getElementById('teacherSubject').value
            };

            const result = await Auth.createTeacher(teacherData);
            
            if (result.success) {
                window.location.href = 'teacher.html?status=pending';
            } else {
                alert('حدث خطأ: ' + result.error);
            }
        });
    },

    showPending() {
        document.getElementById('pendingScreen').classList.remove('hidden');
    },

    showRejected() {
        document.getElementById('rejectedScreen').classList.remove('hidden');
    },

    showDashboard() {
        document.getElementById('dashboard').classList.remove('hidden');
        document.getElementById('teacherName').textContent = this.teacher.name;
    },

    bindEvents() {
        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            Auth.signOut();
        });

        // Tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;
                this.switchTab(targetTab);
            });
        });

        // Add Group Modal
        document.getElementById('addGroupBtn').addEventListener('click', () => {
            document.getElementById('addGroupModal').classList.remove('hidden');
        });

        document.querySelector('#addGroupModal .close').addEventListener('click', () => {
            document.getElementById('addGroupModal').classList.add('hidden');
        });

        document.getElementById('addGroupForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.createGroup();
        });

        // Create Exam
        document.getElementById('createExamBtn').addEventListener('click', () => {
            this.openExamBuilder();
        });

        document.querySelector('#examBuilderModal .close').addEventListener('click', () => {
            document.getElementById('examBuilderModal').classList.add('hidden');
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

    async loadGroups() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/teacher/groups?teacher_id=${this.teacher.id}`);
            this.groups = await response.json();
            this.renderGroups();
        } catch (error) {
            console.error('Load groups error:', error);
        }
    },

    renderGroups() {
        const container = document.getElementById('groupsList');
        
        if (this.groups.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <p>لا توجد مجموعات بعد. أنشئ مجموعتك الأولى!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.groups.map(group => `
            <div class="card">
                <h3>${group.name}</h3>
                <div class="card-meta">
                    <span>👤 ${group.students?.length || 0} طالب</span>
                </div>
                ${group.welcome_message ? `<p>${group.welcome_message}</p>` : ''}
                <div class="card-actions">
                    <button class="btn btn-small btn-primary" onclick="TeacherDashboard.viewGroup('${group.id}')">عرض</button>
                </div>
            </div>
        `).join('');
    },

    async createGroup() {
        const groupData = {
            teacher_id: this.teacher.id,
            name: document.getElementById('groupName').value,
            welcome_message: document.getElementById('welcomeMessage').value
        };

        try {
            const response = await fetch(`${CONFIG.API_URL}/teacher/groups`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(groupData)
            });

            if (!response.ok) throw new Error('Failed to create group');

            document.getElementById('addGroupModal').classList.add('hidden');
            document.getElementById('addGroupForm').reset();
            await this.loadGroups();
        } catch (error) {
            console.error('Create group error:', error);
            alert('حدث خطأ أثناء الإنشاء');
        }
    },

    viewGroup(groupId) {
        // TODO: Navigate to group details page
        alert('سيتم فتح صفحة المجموعة قريباً');
    },

    async loadExams() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/teacher/exams?teacher_id=${this.teacher.id}`);
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
                    <p>لا توجد امتحانات بعد. أنشئ امتحانك الأول!</p>
                </div>
            `;
            return;
        }

        const statusLabels = {
            draft: 'مسودة',
            scheduled: 'مجدول',
            active: 'نشط',
            closed: 'مغلق'
        };

        container.innerHTML = this.exams.map(exam => `
            <div class="card">
                <h3>${exam.title}</h3>
                <div class="card-meta">
                    <span>⏱️ ${exam.duration_minutes} دقيقة</span>
                    <span>📋 ${exam.questions?.length || 0} سؤال</span>
                    <span class="status-${exam.status}">${statusLabels[exam.status]}</span>
                </div>
                <div class="card-actions">
                    ${exam.status === 'draft' ? `<button class="btn btn-small btn-primary" onclick="TeacherDashboard.publishExam('${exam.id}')">نشر</button>` : ''}
                    ${exam.status === 'active' ? `<button class="btn btn-small btn-secondary" onclick="TeacherDashboard.closeExam('${exam.id}')">إغلاق</button>` : ''}
                    <button class="btn btn-small" onclick="TeacherDashboard.viewResults('${exam.id}')">النتائج</button>
                </div>
            </div>
        `).join('');
    },

    async openExamBuilder() {
        // Load groups for checkboxes
        const checkboxContainer = document.getElementById('groupsCheckboxes');
        checkboxContainer.innerHTML = this.groups.map(group => `
            <label>
                <input type="checkbox" value="${group.id}">
                ${group.name}
            </label>
        `).join('');

        document.getElementById('examBuilderModal').classList.remove('hidden');
        ExamBuilder.renderQuestions();
    },

    async publishExam(examId) {
        if (!confirm('هل تريد نشر الامتحان؟')) return;

        try {
            const response = await fetch(`${CONFIG.API_URL}/teacher/exams/${examId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'active' })
            });

            if (!response.ok) throw new Error('Failed to publish');

            alert('تم نشر الامتحان');
            await this.loadExams();
        } catch (error) {
            console.error('Publish error:', error);
            alert('حدث خطأ');
        }
    },

    async closeExam(examId) {
        if (!confirm('هل تريد إغلاق الامتحان؟')) return;

        try {
            const response = await fetch(`${CONFIG.API_URL}/teacher/exams/${examId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'closed' })
            });

            if (!response.ok) throw new Error('Failed to close');

            alert('تم إغلاق الامتحان');
            await this.loadExams();
        } catch (error) {
            console.error('Close error:', error);
            alert('حدث خطأ');
        }
    },

    viewResults(examId) {
        // TODO: Navigate to results page
        alert('سيتم فتح صفحة النتائج قريباً');
    }
};

window.TeacherDashboard = TeacherDashboard;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    TeacherDashboard.init();
});
