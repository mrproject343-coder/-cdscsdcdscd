// ===== Simple Router =====

const Router = {
    routes: {},
    
    init() {
        window.addEventListener('popstate', () => this.handleRoute());
        this.handleRoute();
    },

    register(path, handler) {
        this.routes[path] = handler;
    },

    navigate(path, data = {}) {
        window.history.pushState(data, '', path);
        this.handleRoute();
    },

    handleRoute() {
        const path = window.location.pathname;
        const handler = this.routes[path] || this.routes['/'];
        
        if (handler) {
            handler();
        } else {
            console.warn('No handler for path:', path);
        }
    },

    redirect(path) {
        window.location.href = path;
    },

    reload() {
        window.location.reload();
    }
};

// Register routes
Router.register('/', () => {
    // Home page - already rendered
});

Router.register('/admin', () => {
    Router.redirect('pages/admin.html');
});

Router.register('/teacher', () => {
    Router.redirect('pages/teacher.html');
});

Router.register('/student', () => {
    Router.redirect('pages/student.html');
});

window.Router = Router;
