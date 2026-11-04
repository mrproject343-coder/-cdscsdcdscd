// ===== Admin Dashboard =====

const AdminDashboard = {
    stats: {},
    teachers: [],
    exams: [],
    currentFilter: 'all',

    async init() {
        // Check auth
        await Auth.init();
        
        if (!Auth.isAdmin()) {
            alert('غير مصرح لك بالدخول');
            window.location.href = '../index.html';
            return;
        }

        this.bindEvents();
        await this.loadStats();
        await this.loadTeachers();
        await this.loadExams();
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

        // Teacher filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentFilter = e.target.dataset.filter;
                this.filterTeachers();
                
                // Update active state
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Announcement form
        document.getElementById('announcementForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.createAnnouncement();
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

    async loadStats() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/admin/stats`);
            this.stats = await response.json();
            this.renderStats();
        } catch (error) {
            console.error('Load stats error:', error);
        }
    },

    renderStats() {
        document.getElementById('totalTeachers').textContent = this.stats.teachers || 0;
        document.getElementById('totalStudents').textContent = this.stats.students || 0;
        document.getElementById('totalExams').textContent = this.stats.exams || 0;
        document.getElementById('totalGroups').textContent = this.stats.groups || 0;
        document.getElementById('totalSubmissions').textContent = this.stats.submissions || 0;
    },

    async loadTeachers() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/admin/teachers`);
            this.teachers = await response.json();
            this.filterTeachers();
        } catch (error) {
            console.error('Load teachers error:', error);
        }
    },

    filterTeachers() {
        let filtered = this.teachers;
        
        if (this.currentFilter !== 'all') {
            filtered = this.teachers.filter(t => t.status === this.currentFilter);
        }

        this.renderTeachers(filtered);
    },

    renderTeachers(teachers) {
        const tbody = document.getElementById('teachersTableBody');
        
        if (teachers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center;">لا توجد بيانات</td>
                </tr>
            `;
            return;
        }

        const statusLabels = {
            pending: 'قيد المراجعة',
            active: 'نشط',
            rejected: 'مرفوض',
            suspended: 'موقوف'
        };

        tbody.innerHTML = teachers.map(teacher => `
            <tr>
                <td>${teacher.name}</td>
                <td>${teacher.email}</td>
                <td>${teacher.subject}</td>
                <td>${teacher.phone || '-'}</td>
                <td><span class="status-badge status-${teacher.status}">${statusLabels[teacher.status]}</span></td>
                <td>
                    <div class="table-actions">
                        ${teacher.status === 'pending' ? `
                            <button class="btn-approve" onclick="AdminDashboard.updateTeacherStatus('${teacher.id}', 'active')">قبول</button>
                            <button class="btn-reject" onclick="AdminDashboard.updateTeacherStatus('${teacher.id}', 'rejected')">رفض</button>
                        ` : ''}
                        ${teacher.status === 'active' ? `
                            <button class="btn-suspend" onclick="AdminDashboard.updateTeacherStatus('${teacher.id}', 'suspended')">إيقاف</button>
                        ` : ''}
                        ${teacher.status === 'suspended' ? `
                            <button class="btn-approve" onclick="AdminDashboard.updateTeacherStatus('${teacher.id}', 'active')">تفعيل</button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    },

    async updateTeacherStatus(teacherId, status) {
        const confirmMessages = {
            active: 'هل تريد قبول هذا المدرس؟',
            rejected: 'هل تريد رفض هذا المدرس؟',
            suspended: 'هل تريد إيقاف هذا المدرس؟'
        };

        if (!confirm(confirmMessages[status])) return;

        try {
            const response = await fetch(`${CONFIG.API_URL}/admin/teachers/${teacherId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (!response.ok) throw new Error('Failed to update status');

            alert('تم تحديث الحالة بنجاح');
            await this.loadTeachers();
            await this.loadStats();
        } catch (error) {
            console.error('Update status error:', error);
            alert('حدث خطأ أثناء التحديث');
        }
    },

    async loadExams() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/admin/exams`);
            this.exams = await response.json();
            this.renderExams();
        } catch (error) {
            console.error('Load exams error:', error);
        }
    },

    renderExams() {
        const tbody = document.getElementById('examsTableBody');
        
        if (this.exams.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center;">لا توجد امتحانات</td>
                </tr>
            `;
            return;
        }

        const statusLabels = {
            draft: 'مسودة',
            scheduled: 'مجدول',
            active: 'نشط',
            closed: 'مغلق'
        };

        tbody.innerHTML = this.exams.map(exam => `
            <tr>
                <td>${exam.title}</td>
                <td>${exam.teachers?.name || '-'}</td>
                <td>${exam.teachers?.subject || '-'}</td>
                <td>${exam.duration_minutes} دقيقة</td>
                <td>${exam.questions?.length || 0} سؤال</td>
                <td><span class="status-badge status-${exam.status}">${statusLabels[exam.status]}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="btn-delete" onclick="AdminDashboard.deleteExam('${exam.id}')">حذف</button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    async deleteExam(examId) {
        if (!confirm('هل تريد حذف هذا الامتحان؟ هذا الإجراء لا يمكن التراجع عنه.')) return;

        try {
            const response = await fetch(`${CONFIG.API_URL}/admin/exams/${examId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete exam');

            alert('تم حذف الامتحان');
            await this.loadExams();
            await this.loadStats();
        } catch (error) {
            console.error('Delete exam error:', error);
            alert('حدث خطأ أثناء الحذف');
        }
    },

    async createAnnouncement() {
        const message = document.getElementById('announcementMessage').value.trim();
        
        if (!message) {
            alert('من فضلك أدخل نص الإعلان');
            return;
        }

        try {
            // Save to Supabase
            const { data, error } = await supabase
                .from('announcements')
                .insert([{
                    message: message,
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;

            alert('تم إضافة الإعلان بنجاح');
            document.getElementById('announcementForm').reset();
            await this.loadAnnouncements();
        } catch (error) {
            console.error('Create announcement error:', error);
            alert('حدث خطأ أثناء الإضافة');
        }
    },

    async loadAnnouncements() {
        try {
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            this.renderAnnouncements(data || []);
        } catch (error) {
            console.error('Load announcements error:', error);
        }
    },

    renderAnnouncements(announcements) {
        const container = document.getElementById('announcementsList');
        
        if (announcements.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>لا توجد إعلانات بعد</p>
                </div>
            `;
            return;
        }

        container.innerHTML = announcements.map(ann => `
            <div class="announcement-item">
                <div class="announcement-content">
                    <div class="announcement-date">${new Date(ann.created_at).toLocaleString('ar-EG')}</div>
                    <p class="announcement-text">${ann.message}</p>
                </div>
                <button class="btn-icon" onclick="AdminDashboard.deleteAnnouncement('${ann.id}')">🗑️</button>
            </div>
        `).join('');
    },

    async deleteAnnouncement(id) {
        if (!confirm('هل تريد حذف هذا الإعلان؟')) return;

        try {
            const { error } = await supabase
                .from('announcements')
                .delete()
                .eq('id', id);

            if (error) throw error;

            await this.loadAnnouncements();
        } catch (error) {
            console.error('Delete announcement error:', error);
            alert('حدث خطأ أثناء الحذف');
        }
    }
};

window.AdminDashboard = AdminDashboard;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    AdminDashboard.init();
});
