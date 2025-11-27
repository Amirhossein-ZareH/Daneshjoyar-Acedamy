// Cart Management System
class CartManager {
    constructor() {
        this.cart = [];
        this.maxUnits = 20;
        this.init();
    }

    init() {
        this.loadCartFromStorage();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Clear cart
        document.getElementById('clear-cart')?.addEventListener('click', () => {
            this.clearCart();
        });

        // Submit registration
        document.getElementById('submit-registration')?.addEventListener('click', () => {
            this.submitRegistration();
        });
    }

    loadCartFromStorage() {
        const savedCart = localStorage.getItem('courseCart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }
        this.updateCartBadge();
    }

    saveCartToStorage() {
        localStorage.setItem('courseCart', JSON.stringify(this.cart));
        this.updateCartBadge();
    }

    updateCartBadge() {
        const badge = document.getElementById('cart-badge');
        if (badge) {
            badge.textContent = this.cart.length;
        }
    }

    getCartItems() {
        return this.cart;
    }

    isCourseInCart(courseId) {
        return this.cart.some(item => item.id === courseId);
    }

    addToCart(course) {
        if (this.isCourseInCart(course.id)) {
            app.showNotification('این درس قبلاً به سبد اضافه شده است', 'warning');
            return false;
        }

        // Check for conflicts
        const conflict = this.checkTimeConflict(course);
        if (conflict) {
            this.showConflictWarning(conflict, course);
            return false;
        }

        // Check unit limit
        const newTotalUnits = this.getTotalUnits() + course.units;
        if (newTotalUnits > this.maxUnits) {
            app.showNotification(`تعداد واحدها از ${this.maxUnits} واحد بیشتر می‌شود`, 'error');
            return false;
        }

        this.cart.push(course);
        this.saveCartToStorage();
        this.renderCart();
        
        // Update schedule
        if (scheduleManager) {
            scheduleManager.renderSchedule();
        }
        
        return true;
    }

    removeFromCart(courseId) {
        this.cart = this.cart.filter(item => item.id !== courseId);
        this.saveCartToStorage();
        this.renderCart();
        
        // Update schedule
        if (scheduleManager) {
            scheduleManager.renderSchedule();
        }
    }

    checkTimeConflict(newCourse) {
        for (const existingCourse of this.cart) {
            if (this.doCoursesConflict(existingCourse, newCourse)) {
                return {
                    existing: existingCourse,
                    new: newCourse
                };
            }
        }
        return null;
    }

    doCoursesConflict(course1, course2) {
        // Extract day and time from course time strings
        const time1 = this.parseCourseTime(course1.time);
        const time2 = this.parseCourseTime(course2.time);
        
        if (!time1 || !time2) return false;
        
        // Check if same day
        if (time1.day !== time2.day) return false;
        
        // Check time overlap
        return this.doTimeRangesOverlap(time1.start, time1.end, time2.start, time2.end);
    }

    parseCourseTime(timeString) {
        const days = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه'];
        const timeMatch = timeString.match(/(\d+)-(\d+)/);
        const day = days.find(day => timeString.includes(day));
        
        if (!timeMatch || !day) return null;
        
        return {
            day: day,
            start: parseInt(timeMatch[1]),
            end: parseInt(timeMatch[2])
        };
    }

    doTimeRangesOverlap(start1, end1, start2, end2) {
        return start1 < end2 && start2 < end1;
    }

    showConflictWarning(conflict, newCourse) {
        const conflictCard = document.getElementById('conflict-check-card');
        const conflictList = document.getElementById('conflict-list');
        
        if (!conflictCard || !conflictList) return;

        conflictList.innerHTML = `
            <div class="conflict-item">
                <i class="fas fa-exclamation-triangle"></i>
                <div class="conflict-details">
                    <h4>تداخل زمانی</h4>
                    <p>درس "${newCourse.name}" با درس "${conflict.existing.name}" تداخل زمانی دارد</p>
                    <p>زمان: ${newCourse.time} - ${conflict.existing.time}</p>
                </div>
                <button class="btn btn-danger btn-sm" onclick="cartManager.resolveConflict(${conflict.existing.id}, ${newCourse.id})">
                    حذف درس قبلی
                </button>
            </div>
        `;

        conflictCard.style.display = 'block';
        app.showNotification('تداخل زمانی شناسایی شد', 'warning');
    }

    resolveConflict(existingCourseId, newCourseId) {
        this.removeFromCart(existingCourseId);
        
        const newCourse = coursesManager.courses.find(c => c.id === newCourseId);
        if (newCourse) {
            this.addToCart(newCourse);
        }
        
        // Hide conflict card
        const conflictCard = document.getElementById('conflict-check-card');
        if (conflictCard) {
            conflictCard.style.display = 'none';
        }
    }

    getTotalUnits() {
        return this.cart.reduce((total, course) => total + course.units, 0);
    }

    renderCart() {
        const container = document.getElementById('cart-items-container');
        const emptyState = document.getElementById('empty-cart');
        const conflictCard = document.getElementById('conflict-check-card');

        if (!container || !emptyState) return;

        // Hide conflict card when cart is empty
        if (conflictCard && this.cart.length === 0) {
            conflictCard.style.display = 'none';
        }

        if (this.cart.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            this.updateCartSummary();
            return;
        }

        emptyState.classList.add('hidden');

        const cartHTML = this.cart.map(course => `
            <div class="cart-item" data-course-id="${course.id}">
                <div class="cart-item-info">
                    <h4>${course.name}</h4>
                    <p>${course.instructor} - ${course.time} - ${course.location}</p>
                </div>
                <div class="cart-item-actions">
                    <span class="cart-item-units">${course.units} واحد</span>
                    <button class="btn btn-outline btn-sm view-course-btn" onclick="coursesManager.showCourseDetails(${course.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-danger btn-sm remove-course-btn" onclick="cartManager.removeFromCart(${course.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = cartHTML;
        this.updateCartSummary();
    }

    updateCartSummary() {
        const totalUnits = this.getTotalUnits();
        const remainingUnits = this.maxUnits - totalUnits;
        const progress = (totalUnits / this.maxUnits) * 100;

        // Update summary stats
        document.getElementById('cart-courses-count').textContent = this.cart.length;
        document.getElementById('cart-total-units').textContent = totalUnits;
        document.getElementById('cart-remaining-units').textContent = remainingUnits;

        // Update progress bar
        const progressFill = document.getElementById('cart-progress');
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
            
            // Change color based on progress
            if (progress > 90) {
                progressFill.style.background = 'var(--danger)';
            } else if (progress > 70) {
                progressFill.style.background = 'var(--warning)';
            } else {
                progressFill.style.background = 'var(--success)';
            }
        }
    }

    clearCart() {
        if (this.cart.length === 0) {
            app.showNotification('سبد دروس already empty', 'info');
            return;
        }

        if (confirm('آیا از خالی کردن سبد دروس اطمینان دارید؟')) {
            this.cart = [];
            this.saveCartToStorage();
            this.renderCart();
            app.showNotification('سبد دروس خالی شد', 'success');
            
            // Update schedule
            if (scheduleManager) {
                scheduleManager.renderSchedule();
            }
        }
    }

    submitRegistration() {
        if (this.cart.length === 0) {
            app.showNotification('سبد دروس خالی است', 'warning');
            return;
        }

        const totalUnits = this.getTotalUnits();
        if (totalUnits < 12) {
            app.showNotification('حداقل تعداد واحد باید 12 باشد', 'error');
            return;
        }

        // Show confirmation
        app.showNotification('در حال ثبت نهایی دروس...', 'info');

        // Simulate API call
        setTimeout(() => {
            app.showNotification('ثبت دروس با موفقیت انجام شد', 'success');
            this.clearCart();
        }, 2000);
    }
}

// Initialize cart manager
const cartManager = new CartManager();