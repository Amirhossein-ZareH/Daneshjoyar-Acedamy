// Main Application Controller
class UniversityRegistrationSystem {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.isDarkMode = localStorage.getItem('darkMode') === 'enabled';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserData();
        this.applyDarkMode();
        this.showPage('dashboard');
        this.hideLoadingScreen();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.showPage(page);
            });
        });

        // Action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.getAttribute('data-page');
                this.showPage(page);
            });
        });

        // Dark mode toggle
        document.getElementById('dark-mode-toggle').addEventListener('click', () => {
            this.toggleDarkMode();
        });

        // Mobile menu toggle
        document.getElementById('mobile-menu-toggle').addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Modal handling
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal'));
            });
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Login/Register modals
        document.getElementById('show-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterModal();
        });

        document.getElementById('show-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginModal();
        });

        // Forms
        document.getElementById('login-form')?.addEventListener('submit', (e) => {
            this.handleLogin(e);
        });

        document.getElementById('register-form')?.addEventListener('submit', (e) => {
            this.handleRegister(e);
        });

        document.getElementById('profile-form')?.addEventListener('submit', (e) => {
            this.handleProfileUpdate(e);
        });

        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLogout();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    showPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Activate corresponding nav link
        const targetLink = document.querySelector(`[data-page="${pageName}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }

        this.currentPage = pageName;

        // Load page-specific data
        this.loadPageData(pageName);

        // Close mobile menu if open
        this.closeMobileMenu();
    }

    loadPageData(pageName) {
        switch (pageName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'courses':
                coursesManager.loadCourses();
                break;
            case 'schedule':
                scheduleManager.renderSchedule();
                break;
            case 'cart':
                cartManager.renderCart();
                break;
            case 'transcript':
                this.loadTranscriptData();
                break;
            case 'profile':
                this.loadProfileData();
                break;
        }
    }

    loadDashboardData() {
        // Load stats
        this.renderStats();
        
        // Load recent activities
        this.renderRecentActivities();
    }

    renderStats() {
        const statsContainer = document.getElementById('stats-container');
        if (!statsContainer) return;

        const stats = [
            {
                title: '۱۴',
                subtitle: 'تعداد واحد مجاز',
                icon: 'fas fa-book',
                type: 'primary'
            },
            {
                title: '۹',
                subtitle: 'واحدهای انتخاب شده',
                icon: 'fas fa-check-circle',
                type: 'success'
            },
            {
                title: '۵',
                subtitle: 'روز تا پایان مهلت',
                icon: 'fas fa-clock',
                type: 'warning'
            },
            {
                title: '۳',
                subtitle: 'درس در سبد خرید',
                icon: 'fas fa-shopping-cart',
                type: 'info'
            }
        ];

        statsContainer.innerHTML = stats.map(stat => `
            <div class="stat-card ${stat.type}">
                <div class="stat-icon">
                    <i class="${stat.icon}"></i>
                </div>
                <div class="stat-info">
                    <h3>${stat.title}</h3>
                    <p>${stat.subtitle}</p>
                </div>
            </div>
        `).join('');
    }

    renderRecentActivities() {
        const timeline = document.getElementById('activity-timeline');
        if (!timeline) return;

        const activities = [
            {
                icon: 'fas fa-book',
                title: 'ثبت درس برنامه‌نویسی وب',
                description: 'درس برنامه‌نویسی وب با کد CE201 به سبد اضافه شد',
                time: '۲ ساعت پیش'
            },
            {
                icon: 'fas fa-calendar',
                title: 'بررسی برنامه هفتگی',
                description: 'برنامه هفتگی با موفقیت به‌روزرسانی شد',
                time: 'دیروز'
            },
            {
                icon: 'fas fa-user-graduate',
                title: 'تکمیل پروفایل',
                description: 'اطلاعات پروفایل دانشجویی تکمیل شد',
                time: '۲ روز پیش'
            }
        ];

        timeline.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }

    loadTranscriptData() {
        // This would typically load from an API
        const transcriptData = {
            name: 'محمد دانشجو',
            studentId: '401234567',
            gpa: '۱۷.۸',
            passedUnits: '۸۵'
        };

        document.getElementById('transcript-name').textContent = transcriptData.name;
        document.getElementById('transcript-student-id').textContent = transcriptData.studentId;
        document.getElementById('transcript-gpa').textContent = transcriptData.gpa;
        document.getElementById('transcript-passed-units').textContent = transcriptData.passedUnits;
    }

    loadProfileData() {
        if (!this.currentUser) {
            this.showLoginModal();
            return;
        }

        // Load user data into profile form
        document.getElementById('profile-fullname').value = this.currentUser.fullname || '';
        document.getElementById('profile-student-id').value = this.currentUser.studentId || '';
        document.getElementById('profile-email').value = this.currentUser.email || '';
        document.getElementById('profile-phone').value = this.currentUser.phone || '';
        document.getElementById('profile-major').value = this.currentUser.major || 'مهندسی کامپیوتر';
        document.getElementById('profile-entry-year').value = this.currentUser.entryYear || '1400';

        // Update profile stats
        document.getElementById('profile-total-units').textContent = '۸۵';
        document.getElementById('profile-gpa').textContent = '۱۷.۸';
        document.getElementById('profile-semester').textContent = '۶';
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        this.applyDarkMode();
        localStorage.setItem('darkMode', this.isDarkMode ? 'enabled' : 'disabled');
    }

    applyDarkMode() {
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
            document.getElementById('dark-mode-toggle').innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('dark-mode');
            document.getElementById('dark-mode-toggle').innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    toggleMobileMenu() {
        document.getElementById('sidebar').classList.toggle('active');
    }

    closeMobileMenu() {
        document.getElementById('sidebar').classList.remove('active');
    }

    showLoginModal() {
        document.getElementById('login-modal').classList.add('active');
    }

    showRegisterModal() {
        document.getElementById('register-modal').classList.add('active');
    }

    closeModal(modal) {
        modal.classList.remove('active');
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');

        // Simulate API call
        this.showNotification('در حال بررسی اطلاعات...', 'info');
        
        setTimeout(() => {
            if (username && password) {
                this.currentUser = {
                    username,
                    fullname: 'محمد دانشجو',
                    studentId: '401234567',
                    email: 'm.student@university.ac.ir',
                    phone: '09123456789',
                    major: 'مهندسی کامپیوتر',
                    entryYear: '1400'
                };
                
                this.updateUserInterface();
                this.closeModal(document.getElementById('login-modal'));
                this.showNotification('ورود موفقیت‌آمیز بود', 'success');
            } else {
                this.showNotification('نام کاربری یا رمز عبور نادرست است', 'error');
            }
        }, 1000);
    }

    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        // Simulate registration
        this.showNotification('در حال ثبت نام...', 'info');
        
        setTimeout(() => {
            this.closeModal(document.getElementById('register-modal'));
            this.showLoginModal();
            this.showNotification('ثبت نام موفقیت‌آمیز بود. لطفاً وارد شوید', 'success');
        }, 1500);
    }

    async handleProfileUpdate(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        // Update user data
        if (this.currentUser) {
            this.currentUser.fullname = formData.get('fullname');
            this.currentUser.email = formData.get('email');
            this.currentUser.phone = formData.get('phone');
            
            this.updateUserInterface();
            this.showNotification('پروفایل با موفقیت به‌روزرسانی شد', 'success');
        }
    }

    handleLogout() {
        this.currentUser = null;
        this.updateUserInterface();
        this.showLoginModal();
        this.showNotification('خروج موفقیت‌آمیز بود', 'success');
    }

    updateUserInterface() {
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');
        const userMajor = document.getElementById('user-major');

        if (this.currentUser) {
            userName.textContent = this.currentUser.fullname;
            userMajor.textContent = this.currentUser.major;
            // In a real app, you'd update the avatar image source
        } else {
            userName.textContent = 'میهمان';
            userMajor.textContent = 'لطفاً وارد شوید';
        }
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            info: 'fas fa-info-circle',
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle'
        };

        notification.innerHTML = `
            <i class="${icons[type]}"></i>
            <span>${message}</span>
        `;

        container.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideInLeft 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 1000);
    }

    handleKeyboardShortcuts(e) {
        // Ctrl + / to focus search
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            const searchInput = document.getElementById('course-search');
            if (searchInput) {
                searchInput.focus();
            }
        }

        // Escape to close modals
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                this.closeModal(modal);
            });
        }
    }

    loadUserData() {
        // Try to load user from localStorage (simulated)
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUserInterface();
        } else {
            this.showLoginModal();
        }
    }
}

// Initialize the application
const app = new UniversityRegistrationSystem();

// Make app globally available for other modules
window.app = app;