// ===== Anti-Cheat System =====

const AntiCheat = {
    violations: [],
    warningCount: 0,
    isActive: false,
    gracePeriod: false,
    cooldown: false,
    examStartTime: null,

    init(examId, studentCode) {
        this.examId = examId;
        this.studentCode = studentCode;
        this.examStartTime = Date.now();
        this.loadFromStorage();
        this.startMonitoring();
    },

    startMonitoring() {
        if (this.isActive) return;
        this.isActive = true;

        // Request fullscreen
        this.requestFullscreen();

        // Visibility change detection
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

        // Window blur detection
        window.addEventListener('blur', this.handleBlur.bind(this));

        // Fullscreen exit detection
        document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));

        // Prevent right-click
        document.addEventListener('contextmenu', (e) => e.preventDefault());

        // Prevent keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        console.log('Anti-cheat monitoring started');
    },

    requestFullscreen() {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.warn('Fullscreen request failed:', err);
            });
        }
    },

    handleVisibilityChange() {
        if (document.hidden) {
            this.logViolation('tab_switch', 'تغيير التاب');
        }
    },

    handleBlur() {
        // Ignore blur on mobile (keyboard shows)
        if (this.isMobile()) {
            return;
        }

        // Grace period check
        if (this.gracePeriod || this.cooldown) {
            return;
        }

        this.logViolation('focus_loss', 'فقدان التركيز');
    },

    handleFullscreenChange() {
        if (!document.fullscreenElement) {
            this.logViolation('fullscreen_exit', 'الخروج من ملء الشاشة');
        }
    },

    handleKeyDown(e) {
        // Block common shortcuts
        const blockedKeys = [
            'F12',           // DevTools
            'I',             // Ctrl+Shift+I (DevTools)
            'J',             // Ctrl+Shift+J (Console)
            'C',             // Ctrl+Shift+C (Inspect)
            'U',             // Ctrl+U (View Source)
        ];

        if ((e.ctrlKey || e.metaKey) && (e.shiftKey || e.altKey)) {
            if (blockedKeys.includes(e.key.toUpperCase())) {
                e.preventDefault();
                this.logViolation('blocked_shortcut', 'محاولة استخدام اختصار ممنوع');
            }
        }

        // Block F12
        if (e.key === 'F12') {
            e.preventDefault();
            this.logViolation('blocked_shortcut', 'محاولة فتح أدوات المطور');
        }
    },

    logViolation(type, description) {
        const violation = {
            type: type,
            description: description,
            timestamp: new Date().toISOString(),
            timeFromStart: Date.now() - this.examStartTime
        };

        this.violations.push(violation);
        this.warningCount++;

        console.warn('Violation detected:', violation);

        // Save to storage
        this.saveToStorage();

        // Show warning
        this.showWarning(description);

        // Check if exceeded max violations
        if (this.warningCount >= CONFIG.ANTI_CHEAT.MAX_VIOLATIONS) {
            this.handleExcessViolations();
        }

        // Start grace period
        this.startGracePeriod();
    },

    showWarning(description) {
        // Create warning overlay
        const overlay = document.createElement('div');
        overlay.className = 'cheat-warning-overlay';
        overlay.innerHTML = `
            <div class="cheat-warning">
                <div class="warning-icon">⚠️</div>
                <h3>تحذير!</h3>
                <p>${description}</p>
                <p class="warning-count">التحذير ${this.warningCount} من ${CONFIG.ANTI_CHEAT.MAX_VIOLATIONS}</p>
                <button class="btn btn-primary" onclick="AntiCheat.dismissWarning()">فهمت</button>
            </div>
        `;
        document.body.appendChild(overlay);

        // Auto dismiss after 5 seconds
        setTimeout(() => {
            this.dismissWarning();
        }, 5000);
    },

    dismissWarning() {
        const overlay = document.querySelector('.cheat-warning-overlay');
        if (overlay) {
            overlay.remove();
        }
    },

    startGracePeriod() {
        this.gracePeriod = true;
        
        setTimeout(() => {
            this.gracePeriod = false;
            this.startCooldown();
        }, CONFIG.ANTI_CHEAT.GRACE_PERIOD_MS);
    },

    startCooldown() {
        this.cooldown = true;
        
        setTimeout(() => {
            this.cooldown = false;
        }, CONFIG.ANTI_CHEAT.COOLDOWN_MS);
    },

    handleExcessViolations() {
        alert('تم تجاوز الحد الأقصى للمخالفات. سيتم تسليم الامتحان تلقائياً بدرجة صفر.');
        
        // Force submit with zero score
        if (window.ExamScreen) {
            window.ExamScreen.forceSubmit(true);
        }
    },

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    saveToStorage() {
        Storage.saveDraft(this.studentCode, this.examId, {
            cheat_log: this.violations,
            warning_count: this.warningCount
        });
    },

    loadFromStorage() {
        const draft = Storage.getDraft(this.studentCode, this.examId);
        if (draft) {
            this.violations = draft.cheat_log || [];
            this.warningCount = draft.warning_count || 0;
        }
    },

    getViolations() {
        return {
            violations: this.violations,
            count: this.warningCount,
            forceZero: this.warningCount >= CONFIG.ANTI_CHEAT.MAX_VIOLATIONS
        };
    },

    stop() {
        this.isActive = false;
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('blur', this.handleBlur);
        document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
        document.removeEventListener('contextmenu', (e) => e.preventDefault());
        document.removeEventListener('keydown', this.handleKeyDown);

        // Exit fullscreen
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }

        console.log('Anti-cheat monitoring stopped');
    }
};

window.AntiCheat = AntiCheat;
