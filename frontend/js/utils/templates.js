// ===== Exam Templates =====

const ExamTemplates = {
    currentTemplate: 'template1',

    applyTemplate(templateName) {
        this.currentTemplate = templateName;
        const examScreen = document.getElementById('examScreen');
        
        // Remove all template classes
        examScreen.classList.remove('template1', 'template2', 'template3', 'template4', 'template5', 'template6');
        
        // Add current template class
        examScreen.classList.add(templateName);
        
        // Apply specific template behavior
        switch(templateName) {
            case 'template1':
                this.applySingleQuestion();
                break;
            case 'template2':
                this.applyFullPage();
                break;
            case 'template3':
                this.applyCards();
                break;
            case 'template4':
                this.applyList();
                break;
            case 'template5':
                this.applyGrid();
                break;
            case 'template6':
                this.applyInteractive();
                break;
        }
    },

    // Template 1: One Question at a Time
    applySingleQuestion() {
        // Already default behavior - shows one question
        document.querySelector('.question-navigator')?.classList.remove('hidden');
    },

    // Template 2: Full Page (All Questions)
    applyFullPage() {
        const container = document.getElementById('questionsContainer');
        const exam = window.ExamScreen.exam;
        const answers = window.ExamScreen.answers;

        if (!exam) return;

        container.innerHTML = exam.questions.map((question, index) => `
            <div class="exam-question" data-question-index="${index}">
                <div class="question-header-info">
                    <span class="question-number-badge">السؤال ${index + 1}</span>
                    <span class="question-points-badge">${question.points} نقطة</span>
                </div>
                
                <div class="question-text-display">${question.text}</div>
                
                ${this.renderAnswerForTemplate(question, answers[question.id], index)}
            </div>
        `).join('');

        // Hide navigator
        document.querySelector('.question-navigator')?.classList.add('hidden');
        
        // Hide prev/next buttons
        document.getElementById('prevBtn').style.display = 'none';
        document.getElementById('nextBtn').style.display = 'none';
    },

    // Template 3: Card Style
    applyCards() {
        const container = document.getElementById('questionsContainer');
        const exam = window.ExamScreen.exam;
        const answers = window.ExamScreen.answers;

        if (!exam) return;

        container.innerHTML = `
            <div class="cards-template">
                ${exam.questions.map((question, index) => `
                    <div class="question-card-template" data-question-index="${index}">
                        <div class="card-number">${index + 1}</div>
                        <div class="card-content">
                            <div class="question-points-badge">${question.points} نقطة</div>
                            <div class="question-text-display">${question.text}</div>
                            ${this.renderAnswerForTemplate(question, answers[question.id], index)}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        document.querySelector('.question-navigator')?.classList.add('hidden');
        document.getElementById('prevBtn').style.display = 'none';
        document.getElementById('nextBtn').style.display = 'none';
    },

    // Template 4: List Style
    applyList() {
        const container = document.getElementById('questionsContainer');
        const exam = window.ExamScreen.exam;
        const answers = window.ExamScreen.answers;

        if (!exam) return;

        container.innerHTML = `
            <div class="list-template">
                ${exam.questions.map((question, index) => `
                    <div class="question-list-item" data-question-index="${index}">
                        <div class="list-number">${index + 1}</div>
                        <div class="list-content">
                            <span class="question-points-badge">${question.points} نقطة</span>
                            <div class="question-text-display">${question.text}</div>
                            ${this.renderAnswerForTemplate(question, answers[question.id], index)}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        document.querySelector('.question-navigator')?.classList.add('hidden');
        document.getElementById('prevBtn').style.display = 'none';
        document.getElementById('nextBtn').style.display = 'none';
    },

    // Template 5: Grid Style
    applyGrid() {
        const container = document.getElementById('questionsContainer');
        const exam = window.ExamScreen.exam;
        const answers = window.ExamScreen.answers;

        if (!exam) return;

        container.innerHTML = `
            <div class="grid-template">
                ${exam.questions.map((question, index) => `
                    <div class="question-grid-item" data-question-index="${index}">
                        <div class="grid-header">
                            <span class="grid-number">${index + 1}</span>
                            <span class="question-points-badge">${question.points} نقطة</span>
                        </div>
                        <div class="question-text-display">${question.text}</div>
                        ${this.renderAnswerForTemplate(question, answers[question.id], index)}
                    </div>
                `).join('')}
            </div>
        `;

        document.querySelector('.question-navigator')?.classList.add('hidden');
        document.getElementById('prevBtn').style.display = 'none';
        document.getElementById('nextBtn').style.display = 'none';
    },

    // Template 6: Interactive (Progress Step)
    applyInteractive() {
        const container = document.getElementById('questionsContainer');
        const exam = window.ExamScreen.exam;
        const currentIndex = window.ExamScreen.currentQuestionIndex;

        if (!exam) return;

        // Show progress steps
        container.innerHTML = `
            <div class="interactive-template">
                <div class="progress-steps">
                    ${exam.questions.map((q, i) => `
                        <div class="progress-step ${i === currentIndex ? 'active' : ''} ${i < currentIndex ? 'completed' : ''}"
                             onclick="ExamScreen.goToQuestion(${i})">
                            <div class="step-number">${i + 1}</div>
                        </div>
                    `).join('')}
                </div>
                
                ${this.renderSingleQuestionInteractive(exam.questions[currentIndex], currentIndex)}
            </div>
        `;

        document.querySelector('.question-navigator')?.classList.add('hidden');
    },

    renderSingleQuestionInteractive(question, index) {
        const answers = window.ExamScreen.answers;
        return `
            <div class="interactive-question" data-question-index="${index}">
                <div class="question-header-info">
                    <span class="question-number-badge">السؤال ${index + 1} من ${window.ExamScreen.exam.questions.length}</span>
                    <span class="question-points-badge">${question.points} نقطة</span>
                </div>
                
                <div class="question-text-display">${question.text}</div>
                
                ${this.renderAnswerForTemplate(question, answers[question.id], index)}
            </div>
        `;
    },

    renderAnswerForTemplate(question, currentAnswer, index) {
        const questionId = question.id;
        
        switch (question.type) {
            case 'mcq':
                return `
                    <div class="answer-options">
                        ${question.options.map((option, optIndex) => `
                            <label class="answer-option ${currentAnswer === optIndex ? 'selected' : ''}">
                                <input type="radio" name="q${index}" value="${optIndex}" 
                                       data-question-id="${questionId}"
                                       ${currentAnswer === optIndex ? 'checked' : ''}>
                                <span>${option}</span>
                            </label>
                        `).join('')}
                    </div>
                `;

            case 'true_false':
                return `
                    <div class="answer-options">
                        <label class="answer-option ${currentAnswer === true ? 'selected' : ''}">
                            <input type="radio" name="q${index}" value="true" 
                                   data-question-id="${questionId}"
                                   ${currentAnswer === true ? 'checked' : ''}>
                            <span>صح</span>
                        </label>
                        <label class="answer-option ${currentAnswer === false ? 'selected' : ''}">
                            <input type="radio" name="q${index}" value="false" 
                                   data-question-id="${questionId}"
                                   ${currentAnswer === false ? 'checked' : ''}>
                            <span>خطأ</span>
                        </label>
                    </div>
                `;

            case 'fill':
                return `
                    <input type="text" class="answer-input" 
                           data-question-id="${questionId}"
                           placeholder="اكتب إجابتك..." 
                           value="${currentAnswer || ''}">
                `;

            case 'essay':
                return `
                    <textarea class="answer-textarea" 
                              data-question-id="${questionId}"
                              placeholder="اكتب إجابتك...">${currentAnswer || ''}</textarea>
                `;

            default:
                return '';
        }
    }
};

window.ExamTemplates = ExamTemplates;
