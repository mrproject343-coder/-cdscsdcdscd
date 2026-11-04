// ===== Exam Builder =====

const ExamBuilder = {
    currentExam: {
        title: '',
        duration: 60,
        template: 'template1',
        groupIds: [],
        questions: [],
        status: 'draft'
    },

    questionCounter: 0,

    init() {
        this.bindEvents();
    },

    bindEvents() {
        // Add question buttons
        const questionTypeBtns = document.querySelectorAll('.question-types .btn');
        questionTypeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                this.addQuestion(type);
            });
        });

        // Save & Publish buttons
        document.getElementById('saveExamBtn')?.addEventListener('click', () => {
            this.saveExam('draft');
        });

        document.getElementById('publishExamBtn')?.addEventListener('click', () => {
            this.saveExam('active');
        });
    },

    addQuestion(type) {
        this.questionCounter++;
        const questionId = `q_${Date.now()}_${this.questionCounter}`;
        
        const question = {
            id: questionId,
            type: type,
            text: '',
            points: 1,
            correct_answer: null,
            options: type === 'mcq' ? ['', '', '', ''] : [],
            pairs: type === 'match' ? [{left: '', right: ''}] : [],
            items: type === 'order' ? [''] : []
        };

        this.currentExam.questions.push(question);
        this.renderQuestions();
    },

    renderQuestions() {
        const container = document.getElementById('questionsList');
        
        if (this.currentExam.questions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <p>لا توجد أسئلة بعد. اختر نوع السؤال من الأعلى للبدء</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.currentExam.questions.map((q, index) => 
            this.renderQuestionCard(q, index)
        ).join('');

        // Bind events for each question
        this.bindQuestionEvents();
    },

    renderQuestionCard(question, index) {
        const typeLabels = {
            mcq: 'اختيار متعدد',
            true_false: 'صح/خطأ',
            fill: 'أكمل',
            essay: 'مقالي',
            match: 'توصيل',
            order: 'ترتيب'
        };

        return `
            <div class="question-card" data-question-id="${question.id}">
                <div class="question-header">
                    <div>
                        <span class="question-number">السؤال ${index + 1}</span>
                        <span class="question-type-badge">${typeLabels[question.type]}</span>
                    </div>
                    <div class="question-actions">
                        <button class="btn-icon btn-move-up" ${index === 0 ? 'disabled' : ''}>↑</button>
                        <button class="btn-icon btn-move-down" ${index === this.currentExam.questions.length - 1 ? 'disabled' : ''}>↓</button>
                        <button class="btn-icon btn-delete">🗑️</button>
                    </div>
                </div>

                <div class="question-content">
                    <textarea class="question-text" placeholder="اكتب نص السؤال...">${question.text}</textarea>
                    
                    ${this.renderQuestionOptions(question)}
                    
                    <div class="question-points">
                        <label>الدرجة:</label>
                        <input type="number" class="question-points-input" value="${question.points}" min="1">
                    </div>
                </div>
            </div>
        `;
    },

    renderQuestionOptions(question) {
        switch (question.type) {
            case 'mcq':
                return this.renderMCQOptions(question);
            case 'true_false':
                return this.renderTrueFalseOptions(question);
            case 'fill':
                return this.renderFillOptions(question);
            case 'essay':
                return '<p style="color: var(--text-secondary); margin-top: 1rem;">سيتم التصحيح يدوياً</p>';
            case 'match':
                return this.renderMatchOptions(question);
            case 'order':
                return this.renderOrderOptions(question);
            default:
                return '';
        }
    },

    renderMCQOptions(question) {
        return `
            <div class="mcq-options">
                ${question.options.map((opt, i) => `
                    <div class="mcq-option">
                        <input type="radio" name="${question.id}" value="${i}" ${question.correct_answer === i ? 'checked' : ''}>
                        <input type="text" class="mcq-option-text" data-index="${i}" placeholder="الاختيار ${i + 1}" value="${opt}">
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderTrueFalseOptions(question) {
        return `
            <div class="true-false-options">
                <label>
                    <input type="radio" name="${question.id}" value="true" ${question.correct_answer === true ? 'checked' : ''}>
                    صح
                </label>
                <label>
                    <input type="radio" name="${question.id}" value="false" ${question.correct_answer === false ? 'checked' : ''}>
                    خطأ
                </label>
            </div>
        `;
    },

    renderFillOptions(question) {
        return `
            <div class="fill-answer">
                <label>الإجابة الصحيحة:</label>
                <input type="text" class="fill-answer-input" value="${question.correct_answer || ''}" placeholder="اكتب الإجابة الصحيحة">
            </div>
        `;
    },

    renderMatchOptions(question) {
        return `
            <div class="match-pairs">
                ${question.pairs.map((pair, i) => `
                    <div class="match-pair" data-index="${i}">
                        <input type="text" class="match-left" placeholder="العنصر الأيمن" value="${pair.left}">
                        <input type="text" class="match-right" placeholder="العنصر الأيسر" value="${pair.right}">
                        <button class="btn-icon btn-remove-pair">✕</button>
                    </div>
                `).join('')}
                <button class="btn btn-small btn-add-pair">+ إضافة زوج</button>
            </div>
        `;
    },

    renderOrderOptions(question) {
        return `
            <div class="order-items">
                ${question.items.map((item, i) => `
                    <div class="order-item" data-index="${i}">
                        <span>${i + 1}.</span>
                        <input type="text" class="order-item-text" placeholder="العنصر ${i + 1}" value="${item}">
                        <button class="btn-icon btn-remove-item">✕</button>
                    </div>
                `).join('')}
                <button class="btn btn-small btn-add-item">+ إضافة عنصر</button>
            </div>
        `;
    },

    bindQuestionEvents() {
        // Question text changes
        document.querySelectorAll('.question-text').forEach(textarea => {
            textarea.addEventListener('input', (e) => {
                const card = e.target.closest('.question-card');
                const questionId = card.dataset.questionId;
                const question = this.currentExam.questions.find(q => q.id === questionId);
                if (question) question.text = e.target.value;
            });
        });

        // Points changes
        document.querySelectorAll('.question-points-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const card = e.target.closest('.question-card');
                const questionId = card.dataset.questionId;
                const question = this.currentExam.questions.find(q => q.id === questionId);
                if (question) question.points = parseInt(e.target.value) || 1;
            });
        });

        // Delete question
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.question-card');
                const questionId = card.dataset.questionId;
                this.deleteQuestion(questionId);
            });
        });

        // Move up/down
        document.querySelectorAll('.btn-move-up').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.question-card');
                const questionId = card.dataset.questionId;
                this.moveQuestion(questionId, 'up');
            });
        });

        document.querySelectorAll('.btn-move-down').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.question-card');
                const questionId = card.dataset.questionId;
                this.moveQuestion(questionId, 'down');
            });
        });

        // MCQ options
        document.querySelectorAll('.mcq-option-text').forEach(input => {
            input.addEventListener('input', (e) => {
                const card = e.target.closest('.question-card');
                const questionId = card.dataset.questionId;
                const index = parseInt(e.target.dataset.index);
                const question = this.currentExam.questions.find(q => q.id === questionId);
                if (question) question.options[index] = e.target.value;
            });
        });

        document.querySelectorAll('.mcq-option input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const card = e.target.closest('.question-card');
                const questionId = card.dataset.questionId;
                const question = this.currentExam.questions.find(q => q.id === questionId);
                if (question) question.correct_answer = parseInt(e.target.value);
            });
        });

        // True/False
        document.querySelectorAll('.true-false-options input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const card = e.target.closest('.question-card');
                const questionId = card.dataset.questionId;
                const question = this.currentExam.questions.find(q => q.id === questionId);
                if (question) question.correct_answer = e.target.value === 'true';
            });
        });

        // Fill
        document.querySelectorAll('.fill-answer-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const card = e.target.closest('.question-card');
                const questionId = card.dataset.questionId;
                const question = this.currentExam.questions.find(q => q.id === questionId);
                if (question) question.correct_answer = e.target.value;
            });
        });

        // Match pairs
        this.bindMatchEvents();
        
        // Order items
        this.bindOrderEvents();
    },

    bindMatchEvents() {
        document.querySelectorAll('.match-left, .match-right').forEach(input => {
            input.addEventListener('input', (e) => {
                const card = e.target.closest('.question-card');
                const pair = e.target.closest('.match-pair');
                const questionId = card.dataset.questionId;
                const index = parseInt(pair.dataset.index);
                const question = this.currentExam.questions.find(q => q.id === questionId);
                
                if (question && question.pairs[index]) {
                    const field = e.target.classList.contains('match-left') ? 'left' : 'right';
                    question.pairs[index][field] = e.target.value;
                }
            });
        });

        document.querySelectorAll('.btn-add-pair').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.question-card');
                const questionId = card.dataset.questionId;
                const question = this.currentExam.questions.find(q => q.id === questionId);
                
                if (question) {
                    question.pairs.push({left: '', right: ''});
                    this.renderQuestions();
                }
            });
        });

        document.querySelectorAll('.btn-remove-pair').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.question-card');
                const pair = e.target.closest('.match-pair');
                const questionId = card.dataset.questionId;
                const index = parseInt(pair.dataset.index);
                const question = this.currentExam.questions.find(q => q.id === questionId);
                
                if (question && question.pairs.length > 1) {
                    question.pairs.splice(index, 1);
                    this.renderQuestions();
                }
            });
        });
    },

    bindOrderEvents() {
        document.querySelectorAll('.order-item-text').forEach(input => {
            input.addEventListener('input', (e) => {
                const card = e.target.closest('.question-card');
                const item = e.target.closest('.order-item');
                const questionId = card.dataset.questionId;
                const index = parseInt(item.dataset.index);
                const question = this.currentExam.questions.find(q => q.id === questionId);
                
                if (question) {
                    question.items[index] = e.target.value;
                }
            });
        });

        document.querySelectorAll('.btn-add-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.question-card');
                const questionId = card.dataset.questionId;
                const question = this.currentExam.questions.find(q => q.id === questionId);
                
                if (question) {
                    question.items.push('');
                    this.renderQuestions();
                }
            });
        });

        document.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.question-card');
                const item = e.target.closest('.order-item');
                const questionId = card.dataset.questionId;
                const index = parseInt(item.dataset.index);
                const question = this.currentExam.questions.find(q => q.id === questionId);
                
                if (question && question.items.length > 1) {
                    question.items.splice(index, 1);
                    this.renderQuestions();
                }
            });
        });
    },

    deleteQuestion(questionId) {
        if (confirm('هل تريد حذف هذا السؤال؟')) {
            this.currentExam.questions = this.currentExam.questions.filter(q => q.id !== questionId);
            this.renderQuestions();
        }
    },

    moveQuestion(questionId, direction) {
        const index = this.currentExam.questions.findIndex(q => q.id === questionId);
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (newIndex >= 0 && newIndex < this.currentExam.questions.length) {
            [this.currentExam.questions[index], this.currentExam.questions[newIndex]] = 
            [this.currentExam.questions[newIndex], this.currentExam.questions[index]];
            this.renderQuestions();
        }
    },

    async saveExam(status) {
        // Validate
        if (!this.validateExam()) return;

        // Collect data
        const examData = {
            teacher_id: Auth.currentUser.id,
            title: document.getElementById('examTitle').value,
            duration_minutes: parseInt(document.getElementById('examDuration').value),
            template: document.getElementById('examTemplate').value,
            questions: this.currentExam.questions,
            status: status,
            scheduled_at: document.getElementById('examSchedule').value || null
        };

        // Get selected groups
        const selectedGroups = Array.from(document.querySelectorAll('#groupsCheckboxes input:checked'))
            .map(cb => cb.value);

        try {
            const response = await fetch(`${CONFIG.API_URL}/teacher/exams`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...examData, group_ids: selectedGroups })
            });

            if (!response.ok) throw new Error('Failed to save exam');

            alert(status === 'draft' ? 'تم حفظ المسودة' : 'تم نشر الامتحان بنجاح!');
            this.resetExam();
            document.getElementById('examBuilderModal').classList.add('hidden');
            
            // Reload exams
            if (window.TeacherDashboard) {
                window.TeacherDashboard.loadExams();
            }
        } catch (error) {
            console.error('Save exam error:', error);
            alert('حدث خطأ أثناء الحفظ');
        }
    },

    validateExam() {
        const title = document.getElementById('examTitle').value.trim();
        if (!title) {
            alert('من فضلك أدخل عنوان الامتحان');
            return false;
        }

        if (this.currentExam.questions.length === 0) {
            alert('من فضلك أضف سؤال واحد على الأقل');
            return false;
        }

        // Validate each question
        for (let q of this.currentExam.questions) {
            if (!q.text.trim()) {
                alert('من فضلك أكمل نص جميع الأسئلة');
                return false;
            }

            if (q.type === 'mcq' && q.correct_answer === null) {
                alert('من فضلك حدد الإجابة الصحيحة لجميع أسئلة الاختيار المتعدد');
                return false;
            }
        }

        return true;
    },

    resetExam() {
        this.currentExam = {
            title: '',
            duration: 60,
            template: 'template1',
            groupIds: [],
            questions: [],
            status: 'draft'
        };
        this.questionCounter = 0;
        this.renderQuestions();
    }
};

window.ExamBuilder = ExamBuilder;
