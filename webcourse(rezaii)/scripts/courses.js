// Courses Management System
class CoursesManager {
    constructor() {
        this.courses = [];
        this.filteredCourses = [];
        this.currentPage = 1;
        this.coursesPerPage = 6;
        this.filters = {
            search: '',
            department: '',
            day: '',
            instructor: '',
            units: ''
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCoursesData();
    }

    setupEventListeners() {
        // Search input
        document.getElementById('course-search')?.addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.filterCourses();
        });

        // Filter selects
        document.getElementById('department-filter')?.addEventListener('change', (e) => {
            this.filters.department = e.target.value;
            this.filterCourses();
        });

        document.getElementById('day-filter')?.addEventListener('change', (e) => {
            this.filters.day = e.target.value;
            this.filterCourses();
        });

        document.getElementById('instructor-filter')?.addEventListener('change', (e) => {
            this.filters.instructor = e.target.value;
            this.filterCourses();
        });

        document.getElementById('unit-filter')?.addEventListener('change', (e) => {
            this.filters.units = e.target.value;
            this.filterCourses();
        });

        // Reset filters
        document.getElementById('reset-filters')?.addEventListener('click', () => {
            this.resetFilters();
        });

        // Finalize selection
        document.getElementById('finalize-selection')?.addEventListener('click', () => {
            this.finalizeSelection();
        });
    }

    async loadCoursesData() {
        try {
            // In a real app, this would be an API call
            const response = await fetch('data/courses.json');
            this.courses = await response.json();
            this.initializeFilters();
            this.filterCourses();
        } catch (error) {
            console.error('Error loading courses:', error);
            // Fallback to sample data
            this.loadSampleData();
        }
    }

    loadSampleData() {
        this.courses = [
            {
                id: 1,
                name: "برنامه‌نویسی وب",
                code: "CE201",
                units: 3,
                instructor: "دکتر احمدی",
                time: "شنبه 10-12",
                location: "کلاس 101",
                capacity: 30,
                enrolled: 25,
                department: "مهندسی کامپیوتر",
                description: "این درس به آموزش مفاهیم پایه‌ای برنامه‌نویسی تحت وب می‌پردازد.",
                prerequisites: ["مبانی کامپیوتر"],
                color: "#4361ee",
                examDate: "1403/01/20"
            },
            {
                id: 2,
                name: "پایگاه داده",
                code: "CE202",
                units: 3,
                instructor: "دکتر رضایی",
                time: "یکشنبه 8-10",
                location: "کلاس 102",
                capacity: 25,
                enrolled: 20,
                department: "مهندسی کامپیوتر",
                description: "مبانی طراحی و پیاده‌سازی سیستم‌های پایگاه داده رابطه‌ای.",
                prerequisites: ["ساختمان داده"],
                color: "#4cc9f0",
                examDate: "1403/01/25"
            },
            {
                id: 3,
                name: "هوش مصنوعی",
                code: "CE301",
                units: 3,
                instructor: "دکتر کریمی",
                time: "دوشنبه 14-16",
                location: "کلاس 201",
                capacity: 20,
                enrolled: 18,
                department: "مهندسی کامپیوتر",
                description: "آشنایی با مفاهیم پایه‌ای هوش مصنوعی و الگوریتم‌های جستجو.",
                prerequisites: ["ساختمان داده", "ریاضیات گسسته"],
                color: "#7209b7",
                examDate: "1403/02/01"
            },
            {
                id: 4,
                name: "شبکه‌های کامپیوتری",
                code: "CE302",
                units: 3,
                instructor: "دکتر محمدی",
                time: "سه‌شنبه 10-12",
                location: "کلاس 202",
                capacity: 25,
                enrolled: 22,
                department: "مهندسی کامپیوتر",
                description: "مبانی شبکه‌های کامپیوتری و پروتکل‌های ارتباطی.",
                prerequisites: ["مبانی کامپیوتر"],
                color: "#f8961e",
                examDate: "1403/02/05"
            },
            {
                id: 5,
                name: "مهندسی نرم‌افزار",
                code: "CE401",
                units: 3,
                instructor: "دکتر حسینی",
                time: "چهارشنبه 16-18",
                location: "کلاس 301",
                capacity: 30,
                enrolled: 28,
                department: "مهندسی کامپیوتر",
                description: "روش‌های سیستماتیک توسعه نرم‌افزار و مدیریت پروژه.",
                prerequisites: ["برنامه‌نویسی پیشرفته"],
                color: "#f72585",
                examDate: "1403/02/10"
            },
            {
                id: 6,
                name: "الگوریتم‌های پیشرفته",
                code: "CE402",
                units: 3,
                instructor: "دکتر جعفری",
                time: "شنبه 14-16",
                location: "کلاس 302",
                capacity: 20,
                enrolled: 15,
                department: "مهندسی کامپیوتر",
                description: "طراحی و تحلیل الگوریتم‌های پیشرفته کامپیوتری.",
                prerequisites: ["ساختمان داده", "ریاضیات گسسته"],
                color: "#3a0ca3",
                examDate: "1403/02/15"
            }
        ];
        this.initializeFilters();
        this.filterCourses();
    }

    initializeFilters() {
        // Initialize department filter
        const departments = [...new Set(this.courses.map(course => course.department))];
        const departmentFilter = document.getElementById('department-filter');
        if (departmentFilter) {
            departmentFilter.innerHTML = '<option value="">همه گروه‌ها</option>' +
                departments.map(dept => `<option value="${dept}">${dept}</option>`).join('');
        }

        // Initialize day filter
        const days = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه'];
        const dayFilter = document.getElementById('day-filter');
        if (dayFilter) {
            dayFilter.innerHTML = '<option value="">همه روزها</option>' +
                days.map(day => `<option value="${day}">${day}</option>`).join('');
        }

        // Initialize instructor filter
        const instructors = [...new Set(this.courses.map(course => course.instructor))];
        const instructorFilter = document.getElementById('instructor-filter');
        if (instructorFilter) {
            instructorFilter.innerHTML = '<option value="">همه اساتید</option>' +
                instructors.map(instructor => `<option value="${instructor}">${instructor}</option>`).join('');
        }

        // Initialize unit filter
        const units = [...new Set(this.courses.map(course => course.units))].sort();
        const unitFilter = document.getElementById('unit-filter');
        if (unitFilter) {
            unitFilter.innerHTML = '<option value="">همه واحدها</option>' +
                units.map(unit => `<option value="${unit}">${unit} واحد</option>`).join('');
        }
    }

    filterCourses() {
        this.filteredCourses = this.courses.filter(course => {
            // Search filter
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                const searchableText = `${course.name} ${course.code} ${course.instructor}`.toLowerCase();
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }

            // Department filter
            if (this.filters.department && course.department !== this.filters.department) {
                return false;
            }

            // Day filter
            if (this.filters.day && !course.time.includes(this.filters.day)) {
                return false;
            }

            // Instructor filter
            if (this.filters.instructor && course.instructor !== this.filters.instructor) {
                return false;
            }

            // Units filter
            if (this.filters.units && course.units !== parseInt(this.filters.units)) {
                return false;
            }

            return true;
        });

        this.currentPage = 1;
        this.renderCourses();
        this.renderPagination();
    }

    resetFilters() {
        this.filters = {
            search: '',
            department: '',
            day: '',
            instructor: '',
            units: ''
        };

        // Reset form elements
        document.getElementById('course-search').value = '';
        document.getElementById('department-filter').value = '';
        document.getElementById('day-filter').value = '';
        document.getElementById('instructor-filter').value = '';
        document.getElementById('unit-filter').value = '';

        this.filterCourses();
    }

    renderCourses() {
        const container = document.getElementById('courses-grid');
        const loading = document.getElementById('loading-courses');
        const empty = document.getElementById('no-courses');

        if (!container) return;

        // Show loading state
        if (loading) loading.classList.add('hidden');
        if (empty) empty.classList.add('hidden');

        if (this.filteredCourses.length === 0) {
            if (empty) empty.classList.remove('hidden');
            container.innerHTML = '';
            return;
        }

        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.coursesPerPage;
        const endIndex = startIndex + this.coursesPerPage;
        const coursesToShow = this.filteredCourses.slice(startIndex, endIndex);

        container.innerHTML = coursesToShow.map(course => this.createCourseCard(course)).join('');

        // Add event listeners to course cards
        this.attachCourseCardEvents();
    }

    createCourseCard(course) {
        const isInCart = cartManager.isCourseInCart(course.id);
        const isFull = course.enrolled >= course.capacity;
        const progress = (course.enrolled / course.capacity) * 100;

        return `
            <div class="course-card" data-course-id="${course.id}">
                <div class="course-card-header">
                    <h3 class="course-card-title">${course.name}</h3>
                    <div class="course-card-code">${course.code}</div>
                </div>
                <div class="course-card-body">
                    <div class="course-info">
                        <span class="course-info-label">استاد:</span>
                        <span class="course-info-value">${course.instructor}</span>
                    </div>
                    <div class="course-info">
                        <span class="course-info-label">زمان:</span>
                        <span class="course-info-value">${course.time}</span>
                    </div>
                    <div class="course-info">
                        <span class="course-info-label">مکان:</span>
                        <span class="course-info-value">${course.location}</span>
                    </div>
                    <div class="course-info">
                        <span class="course-info-label">واحد:</span>
                        <span class="course-info-value">${course.units}</span>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="course-info">
                            <span class="course-info-label">ظرفیت:</span>
                            <span class="course-info-value ${isFull ? 'text-danger' : ''}">
                                ${course.enrolled}/${course.capacity}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="course-card-footer">
                    <div>
                        ${isFull ? 
                            '<span class="badge badge-danger">تکمیل ظرفیت</span>' : 
                            isInCart ? 
                            '<span class="badge badge-success">در سبد شما</span>' : 
                            '<span class="badge badge-warning">ظرفیت موجود</span>'
                        }
                    </div>
                    <div class="course-actions">
                        <button class="btn btn-outline btn-sm view-course-btn" data-course-id="${course.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn ${isInCart ? 'btn-danger' : 'btn-primary'} btn-sm toggle-course-btn" 
                                data-course-id="${course.id}"
                                ${isFull && !isInCart ? 'disabled' : ''}>
                            <i class="fas ${isInCart ? 'fa-trash' : 'fa-cart-plus'}"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    attachCourseCardEvents() {
        // View course details
        document.querySelectorAll('.view-course-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const courseId = parseInt(e.target.closest('.view-course-btn').getAttribute('data-course-id'));
                this.showCourseDetails(courseId);
            });
        });

        // Add/remove from cart
        document.querySelectorAll('.toggle-course-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const courseId = parseInt(e.target.closest('.toggle-course-btn').getAttribute('data-course-id'));
                this.toggleCourseInCart(courseId);
            });
        });
    }

    showCourseDetails(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        if (!course) return;

        const modal = document.getElementById('course-modal');
        const modalTitle = document.getElementById('course-modal-title');
        const modalContent = document.getElementById('course-modal-content');
        const addToCartBtn = document.getElementById('add-to-cart-btn');

        if (!modal || !modalTitle || !modalContent) return;

        const isInCart = cartManager.isCourseInCart(courseId);
        const isFull = course.enrolled >= course.capacity;

        modalTitle.textContent = course.name;
        
        modalContent.innerHTML = `
            <div class="course-detail-header">
                <div class="course-badge" style="background: ${course.color}; color: white; padding: 0.5rem 1rem; border-radius: var(--border-radius); display: inline-block;">
                    ${course.code}
                </div>
                <div class="course-meta">
                    <span><i class="fas fa-user-graduate"></i> ${course.instructor}</span>
                    <span><i class="fas fa-clock"></i> ${course.time}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${course.location}</span>
                    <span><i class="fas fa-book"></i> ${course.units} واحد</span>
                </div>
            </div>
            
            <div class="course-description">
                <h4>توضیحات درس</h4>
                <p>${course.description}</p>
            </div>
            
            <div class="course-details-grid">
                <div class="detail-item">
                    <label>ظرفیت:</label>
                    <span>${course.enrolled} / ${course.capacity}</span>
                </div>
                <div class="detail-item">
                    <label>گروه آموزشی:</label>
                    <span>${course.department}</span>
                </div>
                <div class="detail-item">
                    <label>تاریخ امتحان:</label>
                    <span>${course.examDate}</span>
                </div>
                <div class="detail-item">
                    <label>وضعیت:</label>
                    <span class="${isFull ? 'text-danger' : 'text-success'}">
                        ${isFull ? 'تکمیل ظرفیت' : 'ظرفیت موجود'}
                    </span>
                </div>
            </div>
            
            ${course.prerequisites.length > 0 ? `
                <div class="course-prerequisites">
                    <h4>پیش‌نیازها</h4>
                    <div class="prerequisites-list">
                        ${course.prerequisites.map(pre => `
                            <span class="badge badge-warning">${pre}</span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;

        // Update add to cart button
        if (isInCart) {
            addToCartBtn.innerHTML = '<i class="fas fa-trash"></i> حذف از سبد';
            addToCartBtn.className = 'btn btn-danger';
        } else if (isFull) {
            addToCartBtn.innerHTML = 'تکمیل ظرفیت';
            addToCartBtn.className = 'btn btn-outline';
            addToCartBtn.disabled = true;
        } else {
            addToCartBtn.innerHTML = '<i class="fas fa-cart-plus"></i> افزودن به سبد';
            addToCartBtn.className = 'btn btn-primary';
            addToCartBtn.disabled = false;
        }

        // Update event listener
        addToCartBtn.onclick = () => {
            this.toggleCourseInCart(courseId);
            modal.classList.remove('active');
        };

        modal.classList.add('active');
    }

    toggleCourseInCart(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        if (!course) return;

        if (cartManager.isCourseInCart(courseId)) {
            cartManager.removeFromCart(courseId);
            app.showNotification(`درس ${course.name} از سبد حذف شد`, 'success');
        } else {
            if (course.enrolled >= course.capacity) {
                app.showNotification('ظرفیت این درس تکمیل شده است', 'error');
                return;
            }
            cartManager.addToCart(course);
            app.showNotification(`درس ${course.name} به سبد اضافه شد`, 'success');
        }

        // Update UI
        this.renderCourses();
    }

    renderPagination() {
        const pagination = document.getElementById('courses-pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(this.filteredCourses.length / this.coursesPerPage);

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${this.currentPage - 1}">
                        <i class="fas fa-chevron-right"></i>
                    </a>
                </li>
            `;
        }

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                paginationHTML += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        // Next button
        if (this.currentPage < totalPages) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${this.currentPage + 1}">
                        <i class="fas fa-chevron-left"></i>
                    </a>
                </li>
            `;
        }

        pagination.innerHTML = paginationHTML;

        // Add event listeners
        pagination.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(link.getAttribute('data-page'));
                if (page) {
                    this.goToPage(page);
                }
            });
        });
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderCourses();
        this.renderPagination();
        
        // Scroll to top of courses section
        const coursesSection = document.getElementById('courses-grid');
        if (coursesSection) {
            coursesSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    finalizeSelection() {
        if (cartManager.getCartItems().length === 0) {
            app.showNotification('سبد دروس خالی است', 'warning');
            return;
        }

        // Show confirmation modal
        app.showNotification('در حال نهایی کردن انتخاب واحد...', 'info');
        
        // Simulate API call
        setTimeout(() => {
            app.showNotification('انتخاب واحد با موفقیت نهایی شد', 'success');
            cartManager.clearCart();
            this.renderCourses();
        }, 2000);
    }

    loadCourses() {
        this.renderCourses();
        this.renderPagination();
    }
}

// Initialize courses manager
const coursesManager = new CoursesManager();