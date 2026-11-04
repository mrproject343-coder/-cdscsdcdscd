// ===== Authentication =====

const Auth = {
    currentUser: null,

    async init() {
        // Check existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            this.currentUser = session.user;
            await this.handleAuthRedirect();
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                await this.handleAuthRedirect();
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                Router.navigate('/');
            }
        });
    },

    async signInWithGoogle() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/teacher'
                }
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    },

    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            Storage.clear();
            Router.navigate('/');
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    },

    async handleAuthRedirect() {
        if (!this.currentUser) return;

        const email = this.currentUser.email;

        // Check if admin
        if (email === CONFIG.ADMIN_EMAIL) {
            Router.navigate('/admin');
            return;
        }

        // Check teacher status
        const teacher = await this.getTeacherByEmail(email);
        
        if (!teacher) {
            // New teacher - redirect to onboarding
            Router.navigate('/teacher?onboarding=true');
        } else if (teacher.status === 'pending') {
            Router.navigate('/teacher?status=pending');
        } else if (teacher.status === 'rejected') {
            Router.navigate('/teacher?status=rejected');
        } else if (teacher.status === 'active') {
            Router.navigate('/teacher');
        }
    },

    async getTeacherByEmail(email) {
        try {
            const { data, error } = await supabase
                .from('teachers')
                .select('*')
                .eq('email', email)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (error) {
            console.error('Error fetching teacher:', error);
            return null;
        }
    },

    async createTeacher(teacherData) {
        try {
            const { data, error } = await supabase
                .from('teachers')
                .insert([{
                    email: this.currentUser.email,
                    name: teacherData.name,
                    phone: teacherData.phone,
                    subject: teacherData.subject,
                    status: 'pending',
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error creating teacher:', error);
            return { success: false, error: error.message };
        }
    },

    isAuthenticated() {
        return !!this.currentUser;
    },

    isAdmin() {
        return this.currentUser?.email === CONFIG.ADMIN_EMAIL;
    }
};

window.Auth = Auth;
