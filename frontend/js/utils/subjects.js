// ===== Subject Colors & Themes =====

const SubjectThemes = {
    subjects: {
        physics: {
            name: 'فيزياء',
            primary: '#3B82F6',      // Blue
            secondary: '#60A5FA',
            gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            icon: '⚛️'
        },
        chemistry: {
            name: 'كيمياء',
            primary: '#10B981',      // Green
            secondary: '#34D399',
            gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            icon: '🧪'
        },
        biology: {
            name: 'أحياء',
            primary: '#22C55E',      // Light Green
            secondary: '#4ADE80',
            gradient: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
            icon: '🧬'
        },
        math: {
            name: 'رياضيات',
            primary: '#8B5CF6',      // Purple
            secondary: '#A78BFA',
            gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
            icon: '📐'
        },
        philosophy: {
            name: 'فلسفة',
            primary: '#EC4899',      // Pink
            secondary: '#F472B6',
            gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
            icon: '🤔'
        },
        science: {
            name: 'علوم',
            primary: '#06B6D4',      // Cyan
            secondary: '#22D3EE',
            gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
            icon: '🔬'
        },
        social: {
            name: 'دراسات',
            primary: '#F59E0B',      // Amber
            secondary: '#FBBF24',
            gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            icon: '🌍'
        },
        history: {
            name: 'تاريخ',
            primary: '#78716C',      // Stone
            secondary: '#A8A29E',
            gradient: 'linear-gradient(135deg, #78716C 0%, #57534E 100%)',
            icon: '📜'
        },
        geography: {
            name: 'جغرافيا',
            primary: '#14B8A6',      // Teal
            secondary: '#2DD4BF',
            gradient: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
            icon: '🗺️'
        },
        psychology: {
            name: 'علم نفس',
            primary: '#A855F7',      // Purple
            secondary: '#C084FC',
            gradient: 'linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)',
            icon: '🧠'
        },
        english: {
            name: 'إنجليزي',
            primary: '#EF4444',      // Red
            secondary: '#F87171',
            gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
            icon: '🇬🇧'
        },
        arabic: {
            name: 'عربي',
            primary: '#059669',      // Emerald
            secondary: '#10B981',
            gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            icon: '📖'
        },
        other: {
            name: 'أخرى',
            primary: '#6B7280',      // Gray
            secondary: '#9CA3AF',
            gradient: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
            icon: '📚'
        }
    },

    applyTheme(subject) {
        const theme = this.subjects[subject] || this.subjects.other;
        
        // Apply CSS variables
        document.documentElement.style.setProperty('--subject-primary', theme.primary);
        document.documentElement.style.setProperty('--subject-secondary', theme.secondary);
        document.documentElement.style.setProperty('--subject-gradient', theme.gradient);
        
        // Override primary color for exam
        document.documentElement.style.setProperty('--primary', theme.primary);
        
        return theme;
    },

    getTheme(subject) {
        return this.subjects[subject] || this.subjects.other;
    },

    applyToExamHeader(subject) {
        const theme = this.getTheme(subject);
        const header = document.querySelector('.exam-header');
        
        if (header) {
            header.style.background = theme.gradient;
            header.style.color = 'white';
        }
    },

    applyToWelcomeMessage(subject) {
        const theme = this.getTheme(subject);
        const welcome = document.querySelector('.welcome-message');
        
        if (welcome) {
            welcome.style.background = theme.gradient;
        }
    },

    getSubjectIcon(subject) {
        const theme = this.subjects[subject] || this.subjects.other;
        return theme.icon;
    },

    getSubjectName(subject) {
        const theme = this.subjects[subject] || this.subjects.other;
        return theme.name;
    },

    // Apply theme to entire exam screen
    applyToExamScreen(subject) {
        const theme = this.getTheme(subject);
        
        // Primary elements
        const elements = document.querySelectorAll('.btn-primary, .question-number-badge, .progress-fill, .timer');
        elements.forEach(el => {
            el.style.background = theme.primary;
        });

        // Borders and accents
        const borders = document.querySelectorAll('.exam-question, .answer-option.selected');
        borders.forEach(el => {
            el.style.borderColor = theme.primary;
        });

        // Question navigator
        const navItems = document.querySelectorAll('.question-nav-item.answered');
        navItems.forEach(el => {
            el.style.background = theme.primary;
        });

        // Progress steps
        const steps = document.querySelectorAll('.progress-step.active .step-number');
        steps.forEach(el => {
            el.style.background = theme.primary;
        });
    },

    // Create subject badge
    createSubjectBadge(subject) {
        const theme = this.getTheme(subject);
        return `
            <span class="subject-badge" style="
                background: ${theme.gradient};
                color: white;
                padding: 0.25rem 0.75rem;
                border-radius: 12px;
                font-size: 0.85rem;
                display: inline-flex;
                align-items: center;
                gap: 0.25rem;
            ">
                ${theme.icon} ${theme.name}
            </span>
        `;
    }
};

window.SubjectThemes = SubjectThemes;
