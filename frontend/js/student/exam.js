// ===== Exam Screen =====

const ExamScreen = {
    exam: null,
    student: null,
    currentQuestionIndex: 0,
    answers: {},
    startTime: null,
    endTime: null,
    timeRemaining: 0,
    timerInterval: null,
    autoSaveInterval: null,

    async init(examId) {
        // Get student session
        const session = Storage.getStudentSession();
        if (!session) {
            alert('انتهت الجلسة');
            window.location.href = '../index.html';
            return;
        }

        this.student = session.data;

        // Load exam
        await this.loadExam(examId);
        
        // Check if already submitted
        const draft = Storage.getDraft(this.student.code, examId);
        if (draft && draft.submitted) {
            alert('لقد قمت بتسليم هذا الامتحان بالفعل');
            window.location.href = 'student.html';
            return;
        }

        // Load draft answers
        if (draft) {
            this.answers = draft.answers || {};
            this.startTime = new Date(draft.startTime);
        } else {
            this.startTime = new Date();
        }

        // Calculate end time
        this.endTime = new Date(this.startTime.getTime() + this.exam.duration_minutes * 60000);
        this.timeRemaining = Math.max(0, this.endTime - Date.now());

        // Apply subject theme
        const subject = this.student.groups.teacher.subject || 'other';
        const examScreen = document.getElementById('examScreen');
        examScreen.setAttribute('data-subject', subject);
        SubjectThemes.applyTheme(subject);

        // Apply template
        ExamTemplates.applyTemplate(this.exam.template || 'template1');

        // Start anti-cheat
        AntiCheat.init(examId, this.student.code);

        // Start timer
        this.startTimer();

        // Start auto-save
        this.startAutoSave();

        // Render exam
        this.render();

        // Bind events
        this.bindEvents();

        // Show exam screen
        document.getElementById('examScreen').classList.remove('hidden');
    },

    async loadExam(examId) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/exam/${examId}`);
            this.exam = await response.json();
            
            if (!this.exam) {
                throw new Error('Exam not found');
            }
        } catch (error) {
            console.error('Load exam error:', error);
            alert('حدث خطأ في تحميل الامتحان');
            window.location.href = 'student.html';
        }
    },

    render() {
        // Update header
        document.getElementById('examTitle').textContent = this.exam.title;
        
        // Render questions
        this.renderQuestion();
        
        // Render navigator
        this.renderNavigator();
        
        // Update progress
        this.updateProgress();
    },

    renderQuestion() {
        const question = this.exam.questions[this.currentQuestionIndex];
        const container = document.getElementById('questionsContainer');
        
        container.innerHTML = `
            <div class="exam-question">
                <div class="question-header-info">
                    <span class="question-number-badge">السؤال ${this.currentQuestionIndex + 1} من ${this.exam.questions.length}</span>
                    <span class="question-points-badge">${question.points} نقطة</span>
                </div>
                
                <div class="question-text-display">${question.text}</div>
                
                ${this.renderAnswerInput(question)}
            </div>
        `;
    },

    renderAnswerInput(question) {
        const currentAnswer = this.answers[question.id];

        switch (question.type) {
            case 'mcq':
                return `
                    <div class="answer-options">
                        ${question.options.map((option, index) => `
                            <label class="answer-option ${currentAnswer === index ? 'selected' : ''}">
                                <input type="radio" name="answer" value="${index}" ${currentAnswer === index ? 'checked' : ''}>
                                <span>${option}</span>
                            </label>
                        `).join('')}
                    </div>
                `;

            case 'true_false':
                return `
                    <div class="answer-options">
                        <label class="answer-option ${currentAnswer === true ? 'selected' : ''}">
                            <input type="radio" name="answer" value="true" ${currentAnswer === true ? 'checked' : ''}>
                            <span>صح</span>
                        </label>
                        <label class="answer-option ${currentAnswer === false ? 'selected' : ''}">
                            <input type="radio" name="answer" value="false" ${currentAnswer === false ? 'checked' : ''}>
                            <span>خطأ</span>
                        </label>
                    </div>
                `;

            case 'fill':
                return `
                    <input type="text" class="answer-input" placeholder="اكتب إجابتك..." value="${currentAnswer || ''}">
                `;

            case 'essay':
                return `
                    <textarea class="answer-textarea" placeholder="اكتب إجابتك...">${currentAnswer || ''}</textarea>
                `;

            case 'match':
                return this.renderMatchInput(question, currentAnswer);

            case 'order':
                return this.renderOrderInput(question, currentAnswer);

            default:
                return '';
        }
    },

    renderMatchInput(question, currentAnswer) {
        // Simplified match rendering
        return `
            <div class="match-container">
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">قم بالتوصيل بين العناصر المتطابقة</p>
                ${question.pairs.map((pair, index) => `
                    <div class="match-pair-input" style="margin-bottom: 1rem;">
                        <div style="font-weight: 500;">${pair.left}</div>
                        <select class="answer-input" data-pair="${index}">
                            <option value="">اختر...</option>
                            ${question.pairs.map((p, i) => `
                                <option value="${i}" ${currentAnswer && currentAnswer[index] === i ? 'selected' : ''}>${p.right}</option>
                            `).join('')}
                        </select>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderOrderInput(question, currentAnswer) {
        const items = currentAnswer || question.items;
        return `
            <div class="order-container">
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">رتب العناصر بالترتيب الصحيح</p>
                ${items.map((item, index) => `
                    <div class="order-item-input" style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <span>${index + 1}.</span>
                        <select class="answer-input" data-position="${index}">
                            ${question.items.map((it, i) => `
                                <option value="${it}" ${item === it ? 'selected' : ''}>${it}</option>
                            `).join('')}
                        </select>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderNavigator() {
        const container = document.getElementById('questionNavigator');
        const grid = container.querySelector('.question-nav-grid');
        
        grid.innerHTML = this.exam.questions.map((q, index) => {
            const isAnswered = this.answers[q.id] !== undefined && this.answers[q.id] !== '';
            const isCurrent = index === this.currentQuestionIndex;
            
            return `
                <div class="question-nav-item ${isAnswered ? 'answered' : ''} ${isCurrent ? 'current' : ''}" 
                     onclick="ExamScreen.goToQuestion(${index})">
                    ${index + 1}
                </div>
            `;
        }).join('');
    },

    bindEvents() {
        // Answer changes - use event delegation
        document.addEventListener('change', (e) => {
            if (e.target.type === 'radio' && e.target.dataset.questionId) {
                this.saveAnswerByQuestionId(e.target);
            } else if (e.target.name === 'answer' || e.target.classList.contains('answer-input')) {
                this.saveAnswer(e.target);
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.dataset.questionId) {
                this.saveAnswerByQuestionId(e.target);
            } else if (e.target.classList.contains('answer-input') || e.target.classList.contains('answer-textarea')) {
                this.saveAnswer(e.target);
            }
        });

        // Navigation
        document.getElementById('prevBtn').addEventListener('click', () => {
            if (this.currentQuestionIndex > 0) {
                this.currentQuestionIndex--;
                this.renderQuestion();
                this.renderNavigator();
                this.updateProgress();
            }
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            if (this.currentQuestionIndex < this.exam.questions.length - 1) {
                this.currentQuestionIndex++;
                this.renderQuestion();
                this.renderNavigator();
                this.updateProgress();
            }
        });

        document.getElementById('submitBtn').addEventListener('click', () => {
            this.submitExam();
        });
    },

    saveAnswer(input) {
        const question = this.exam.questions[this.currentQuestionIndex];
        
        if (input.type === 'radio') {
            let value = input.value;
            if (value === 'true') value = true;
            if (value === 'false') value = false;
            if (!isNaN(value)) value = parseInt(value);
            this.answers[question.id] = value;
        } else if (input.classList.contains('answer-textarea') || input.type === 'text') {
            this.answers[question.id] = input.value;
        } else if (input.tagName === 'SELECT') {
            // Handle match/order
            if (input.dataset.pair !== undefined) {
                // Match
                if (!this.answers[question.id]) this.answers[question.id] = {};
                this.answers[question.id][input.dataset.pair] = parseInt(input.value);
            } else if (input.dataset.position !== undefined) {
                // Order
                if (!Array.isArray(this.answers[question.id])) {
                    this.answers[question.id] = question.items.slice();
                }
                this.answers[question.id][input.dataset.position] = input.value;
            }
        }

        this.renderNavigator();
    },

    saveAnswerByQuestionId(input) {
        const questionId = input.dataset.questionId;
        
        if (input.type === 'radio') {
            let value = input.value;
            if (value === 'true') value = true;
            if (value === 'false') value = false;
            if (!isNaN(value)) value = parseInt(value);
            this.answers[questionId] = value;
        } else if (input.classList.contains('answer-textarea') || input.type === 'text') {
            this.answers[questionId] = input.value;
        }

        // Update navigator if visible
        const nav = document.querySelector('.question-navigator');
        if (nav && !nav.classList.contains('hidden')) {
            this.renderNavigator();
        }
    },

    goToQuestion(index) {
        this.currentQuestionIndex = index;
        this.renderQuestion();
        this.renderNavigator();
        this.updateProgress();
    },

    updateProgress() {
        const answered = Object.keys(this.answers).length;
        const total = this.exam.questions.length;
        const percentage = (answered / total) * 100;
        
        document.getElementById('progressFill').style.width = percentage + '%';
        
        // Update navigation buttons
        document.getElementById('prevBtn').disabled = this.currentQuestionIndex === 0;
        document.getElementById('nextBtn').disabled = this.currentQuestionIndex === this.exam.questions.length - 1;
    },

    startTimer() {
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.timeRemaining -= 1000;
            
            if (this.timeRemaining <= 0) {
                clearInterval(this.timerInterval);
                this.timeUp();
                return;
            }
            
            this.updateTimerDisplay();
        }, 1000);
    },

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60000);
        const seconds = Math.floor((this.timeRemaining % 60000) / 1000);
        
        const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        document.getElementById('timer').textContent = display;
        
        // Warning if less than 5 minutes
        if (minutes < CONFIG.EXAM.WARNING_TIME_MINUTES) {
            document.getElementById('timer').classList.add('warning');
        }
    },

    timeUp() {
        alert('انتهى الوقت! سيتم تسليم الامتحان تلقائياً.');
        this.submitExam();
    },

    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.saveDraft();
        }, CONFIG.EXAM.AUTO_SAVE_INTERVAL_MS);
    },

    saveDraft() {
        Storage.saveDraft(this.student.code, this.exam.id, {
            answers: this.answers,
            startTime: this.startTime.toISOString(),
            currentQuestion: this.currentQuestionIndex,
            cheat_log: AntiCheat.getViolations().violations,
            warning_count: AntiCheat.getViolations().count
        });

        // Show indicator
        this.showAutoSaveIndicator();
    },

    showAutoSaveIndicator() {
        const indicator = document.getElementById('autoSaveIndicator');
        indicator.style.display = 'flex';
        
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 2000);
    },

    async submitExam() {
        if (!confirm('هل تريد تسليم الامتحان؟ لن تتمكن من التعديل بعد التسليم.')) {
            return;
        }

        // Stop everything
        clearInterval(this.timerInterval);
        clearInterval(this.autoSaveInterval);
        AntiCheat.stop();

        // Get violations
        const violations = AntiCheat.getViolations();

        // Prepare submission
        const submission = {
            exam_id: this.exam.id,
            student_id: this.student.id,
            answers: this.answers,
            questions: this.exam.questions,
            cheat_log: violations.violations,
            force_zero: violations.forceZero,
            submitted_at: new Date().toISOString()
        };

        try {
            const response = await fetch(`${CONFIG.API_URL}/exam/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submission)
            });

            if (!response.ok) throw new Error('Submission failed');

            // Mark as submitted
            Storage.saveDraft(this.student.code, this.exam.id, { submitted: true });

            alert('تم تسليم الامتحان بنجاح!');
            window.location.href = 'student.html?tab=results';
        } catch (error) {
            console.error('Submit error:', error);
            alert('حدث خطأ أثناء التسليم. حاول مرة أخرى.');
        }
    },

    forceSubmit(withZero = false) {
        if (withZero) {
            AntiCheat.warningCount = CONFIG.ANTI_CHEAT.MAX_VIOLATIONS;
        }
        this.submitExam();
    }
};

window.ExamScreen = ExamScreen;
