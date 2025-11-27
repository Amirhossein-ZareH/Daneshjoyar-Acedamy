// Authentication System
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('login-form')?.addEventListener('submit', (e) => {
            this.handleLogin(e);
        });

        // Register form
        document.getElementById('register-form')?.addEventListener('submit', (e) => {
            this.handleRegister(e);
        });

        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', (e) => {
            this.handleLogout(e);
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');

        try {
            // Show loading state
            this.setFormLoading(e.target, true);

            // Simulate API call
            await this.simulateLogin(username, password);
            
            this.currentUser = {
                id: 1,
                username: username,
                fullname: 'محمد دانشجو',
                studentId: '401234567',
                email: `${username}@university.ac.ir`,
                phone: '09123456789',
                major: 'مهندسی کامپیوتر',
                entryYear: '1400',
                avatar: 'assets/images/avatar-placeholder.png'
            };

            this.saveUserToStorage();
            this.updateUI();
            this.closeAuthModals();
            
            app.showNotification('ورود موفقیت‌آمیز بود', 'success');
        } catch (error) {
            app.showNotification(error.message, 'error');
        } finally {
            this.setFormLoading(e.target, false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            this.setFormLoading(e.target, true);

            // Simulate API call
            await this.simulateRegister(formData);
            
            app.showNotification('ثبت نام موفقیت‌آمیز بود', 'success');
            this.showLoginModal();
        } catch (error) {
            app.showNotification(error.message, 'error');
        } finally {
            this.setFormLoading(e.target, false);
        }
    }

    handleLogout(e) {
        e.preventDefault();
        
        if (confirm('آیا از خروج اطمینان دارید؟')) {
            this.currentUser = null;
            this.clearUserFromStorage();
            this.updateUI();
            this.showLoginModal();
            app.showNotification('خروج موفقیت‌آمیز بود', 'success');
        }
    }

    async simulateLogin(username, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (username && password) {
                    if (password.length < 6) {
                        reject(new Error('رمز عبور باید حداقل ۶ کاراکتر باشد'));
                    } else {
                        resolve({ success: true });
                    }
                } else {
                    reject(new Error('لطفاً تمام فیلدها را پر کنید'));
                }
            }, 1500);
        });
    }

    async simulateRegister(formData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const password = formData.get('password');
                const confirmPassword = formData.get('confirm-password');
                
                if (password !== confirmPassword) {
                    reject(new Error('رمز عبور و تکرار آن مطابقت ندارند'));
                } else if (password.length < 6) {
                    reject(new Error('رمز عبور باید حداقل ۶ کاراکتر باشد'));
                } else {
                    resolve({ success: true });
                }
            }, 2000);
        });
    }

    setFormLoading(form, isLoading) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال پردازش...';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    checkAuthStatus() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUI();
        } else {
            this.showLoginModal();
        }
    }

    saveUserToStorage() {
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }

    clearUserFromStorage() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('courseCart');
    }

    updateUI() {
        this.updateUserInfo();
        this.updateNavigation();
    }

    updateUserInfo() {
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');
        const userMajor = document.getElementById('user-major');

        if (this.currentUser) {
            if (userAvatar) userAvatar.src = this.currentUser.avatar;
            if (userName) userName.textContent = this.currentUser.fullname;
            if (userMajor) userMajor.textContent = this.currentUser.major;
        } else {
            if (userName) userName.textContent = 'میهمان';
            if (userMajor) userMajor.textContent = 'لطفاً وارد شوید';
        }
    }

    updateNavigation() {
        // Enable/disable navigation based on auth status
        const navLinks = document.querySelectorAll('.nav-link:not([data-page="dashboard"])');
        
        navLinks.forEach(link => {
            if (this.currentUser) {
                link.style.opacity = '1';
                link.style.pointerEvents = 'auto';
            } else {
                link.style.opacity = '0.5';
                link.style.pointerEvents = 'none';
            }
        });
    }

    showLoginModal() {
        document.getElementById('login-modal').classList.add('active');
    }

    showRegisterModal() {
        document.getElementById('register-modal').classList.add('active');
    }

    closeAuthModals() {
        document.getElementById('login-modal').classList.remove('active');
        document.getElementById('register-modal').classList.remove('active');
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize auth manager
const authManager = new AuthManager();