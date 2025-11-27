// Registration Management System
class RegistrationManager {
    constructor() {
        this.currentStep = 1;
        this.registrationData = {
            courses: [],
            financial: {
                baseTuition: 2500000,
                unitPrice: 200000,
                total: 0
            },
            validation: {
                hasConflicts: false,
                hasPrerequisitesIssues: false,
                isValid: false
            },
            payment: {
                isPaid: false,
                transactionId: null
            },
            isFinalized: false
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadRegistrationData();
    }

    setupEventListeners() {
        // Step navigation
        document.querySelectorAll('.step').forEach(step => {
            step.addEventListener('click', (e) => {
                const stepNumber = parseInt(e.currentTarget.getAttribute('data-step'));
                this.goToStep(stepNumber);
            });
        });

        // Step 1: Course validation
        document.getElementById('validate-courses')?.addEventListener('click', () => {
            this.validateCourses();
        });

        // Step 2: Financial
        document.getElementById('calculate-tuition')?.addEventListener('click', () => {
            this.calculateTuition();
        });

        document.getElementById('proceed-to-payment')?.addEventListener('click', () => {
            this.showPaymentModal();
        });

        // Step 3: Final confirmation
        document.getElementById('confirm-registration')?.addEventListener('click', () => {
            this.finalizeRegistration();
        });

        // Payment modal
        document.getElementById('process-payment')?.addEventListener('click', () => {
            this.processPayment();
        });

        document.getElementById('cancel-payment')?.addEventListener('click', () => {
            this.closePaymentModal();
        });

        // Edit selection
        document.getElementById('edit-selection')?.addEventListener('click', () => {
            this.editSelection();
        });

        // Print registration
        document.getElementById('print-registration')?.addEventListener('click', () => {
            this.printRegistration();
        });

        // Final registration from cart
        document.getElementById('final-registration')?.addEventListener('click', () => {
            this.startRegistrationProcess();
        });
    }

    loadRegistrationData() {
        const savedData = localStorage.getItem('registrationData');
        if (savedData) {
            this.registrationData = JSON.parse(savedData);
        }
        
        // Load courses from cart
        this.registrationData.courses = cartManager.getCartItems();
        this.updateUI();
    }

    saveRegistrationData() {
        localStorage.setItem('registrationData', JSON.stringify(this.registrationData));
    }

    goToStep(stepNumber) {
        if (stepNumber < 1 || stepNumber > 3) return;

        // Validate previous steps
        if (stepNumber > 1 && !this.validateStep(stepNumber - 1)) {
            app.showNotification('لطفاً مرحله قبل را تکمیل کنید', 'warning');
            return;
        }

        this.currentStep = stepNumber;
        this.updateStepUI();
    }

    validateStep(stepNumber) {
        switch (stepNumber) {
            case 1:
                return this.registrationData.validation.isValid;
            case 2:
                return this.registrationData.payment.isPaid;
            default:
                return true;
        }
    }

    updateStepUI() {
        // Update step indicators
        document.querySelectorAll('.step').forEach(step => {
            const stepNum = parseInt(step.getAttribute('data-step'));
            step.classList.toggle('active', stepNum === this.currentStep);
            step.classList.toggle('completed', stepNum < this.currentStep);
        });

        // Show/hide step cards
        document.querySelectorAll('.step-card').forEach(card => {
            const cardStep = parseInt(card.getAttribute('data-step'));
            card.classList.toggle('active', cardStep === this.currentStep);
            card.classList.toggle('completed', cardStep < this.currentStep);
        });
    }

    validateCourses() {
        const cartItems = cartManager.getCartItems();
        
        if (cartItems.length === 0) {
            app.showNotification('سبد دروس خالی است', 'error');
            return;
        }

        // Check unit limits
        const totalUnits = cartManager.getTotalUnits();
        if (totalUnits < 12) {
            this.showValidationError('حداقل تعداد واحد باید ۱۲ باشد');
            return;
        }

        if (totalUnits > 20) {
            this.showValidationError('حداکثر تعداد واحد ۲۰ می‌باشد');
            return;
        }

        // Check conflicts
        const conflicts = this.checkAllConflicts();
        if (conflicts.length > 0) {
            this.showValidationError('تداخل زمانی بین دروس وجود دارد');
            return;
        }

        // Check prerequisites
        const prerequisitesIssues = this.checkPrerequisites();
        if (prerequisitesIssues.length > 0) {
            this.showValidationError('مشکلی در پیش‌نیازها وجود دارد');
            return;
        }

        // All validations passed
        this.registrationData.validation = {
            hasConflicts: false,
            hasPrerequisitesIssues: false,
            isValid: true
        };

        this.updateStepStatus(1, 'success', 'بررسی دروس تکمیل شد');
        app.showNotification('بررسی دروس با موفقیت انجام شد', 'success');
        
        // Auto proceed to next step
        setTimeout(() => {
            this.goToStep(2);
        }, 1000);
    }

    checkAllConflicts() {
        const conflicts = [];
        const cartItems = cartManager.getCartItems();
        
        for (let i = 0; i < cartItems.length; i++) {
            for (let j = i + 1; j < cartItems.length; j++) {
                if (cartManager.doCoursesConflict(cartItems[i], cartItems[j])) {
                    conflicts.push({
                        course1: cartItems[i],
                        course2: cartItems[j]
                    });
                }
            }
        }
        
        return conflicts;
    }

    checkPrerequisites() {
        const issues = [];
        const cartItems = cartManager.getCartItems();
        const studentTranscript = this.getStudentTranscript(); // This would come from database
        
        cartItems.forEach(course => {
            if (course.prerequisites && course.prerequisites.length > 0) {
                course.prerequisites.forEach(prereq => {
                    if (!this.hasPassedPrerequisite(prereq, studentTranscript)) {
                        issues.push({
                            course: course,
                            missingPrerequisite: prereq
                        });
                    }
                });
            }
        });
        
        return issues;
    }

    hasPassedPrerequisite(prereq, transcript) {
        // Simulate prerequisite check
        // In real app, this would check against student's transcript
        const passedCourses = ['مبانی کامپیوتر', 'ساختمان داده', 'ریاضیات گسسته'];
        return passedCourses.includes(prereq);
    }

    showValidationError(message) {
        this.updateStepStatus(1, 'error', message);
        app.showNotification(message, 'error');
    }

    calculateTuition() {
        const totalUnits = cartManager.getTotalUnits();
        const totalTuition = this.registrationData.financial.baseTuition + 
                           (totalUnits * this.registrationData.financial.unitPrice);

        this.registrationData.financial.total = totalTuition;

        // Update UI
        document.getElementById('financial-units').textContent = totalUnits;
        document.getElementById('financial-total').textContent = this.formatCurrency(totalTuition);

        app.showNotification('محاسبه شهریه انجام شد', 'success');
        this.updateStepStatus(2, 'success', 'محاسبه شهریه تکمیل شد');
    }

    showPaymentModal() {
        if (this.registrationData.financial.total === 0) {
            app.showNotification('لطفاً ابتدا شهریه را محاسبه کنید', 'warning');
            return;
        }

        const modal = document.getElementById('payment-modal');
        const paymentTotal = document.getElementById('payment-total');
        
        if (paymentTotal) {
            paymentTotal.textContent = this.formatCurrency(this.registrationData.financial.total);
        }
        
        modal.classList.add('active');
    }

    closePaymentModal() {
        document.getElementById('payment-modal').classList.remove('active');
    }

    async processPayment() {
        const paymentBtn = document.getElementById('process-payment');
        const originalText = paymentBtn.innerHTML;
        
        try {
            // Show loading
            paymentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال پردازش...';
            paymentBtn.disabled = true;

            // Simulate payment processing
            await this.simulatePayment();

            this.registrationData.payment = {
                isPaid: true,
                transactionId: 'TX' + Date.now(),
                paidAt: new Date().toISOString()
            };

            this.closePaymentModal();
            this.updateStepStatus(2, 'success', 'پرداخت موفقیت‌آمیز بود');
            app.showNotification('پرداخت با موفقیت انجام شد', 'success');

            // Auto proceed to final step
            setTimeout(() => {
                this.goToStep(3);
                this.updateFinalSummary();
            }, 1500);

        } catch (error) {
            app.showNotification('خطا در پرداخت: ' + error.message, 'error');
        } finally {
            paymentBtn.innerHTML = originalText;
            paymentBtn.disabled = false;
        }
    }

    simulatePayment() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 10% chance of failure
                if (Math.random() < 0.1) {
                    reject(new Error('تراکنش ناموفق بود'));
                } else {
                    resolve();
                }
            }, 3000);
        });
    }

    updateFinalSummary() {
        const coursesList = document.getElementById('final-courses-list');
        const financialFinal = document.getElementById('financial-final');

        if (coursesList) {
            coursesList.innerHTML = this.registrationData.courses.map(course => `
                <div class="final-course-item">
                    <span class="course-name">${course.name}</span>
                    <span class="course-details">${course.instructor} - ${course.units} واحد</span>
                </div>
            `).join('');
        }

        if (financialFinal) {
            financialFinal.innerHTML = `
                <div class="financial-item">
                    <span>شهریه پایه:</span>
                    <span>${this.formatCurrency(this.registrationData.financial.baseTuition)}</span>
                </div>
                <div class="financial-item">
                    <span>هزینه واحدها:</span>
                    <span>${this.formatCurrency(this.registrationData.financial.unitPrice * this.registrationData.courses.reduce((sum, c) => sum + c.units, 0))}</span>
                </div>
                <div class="financial-divider"></div>
                <div class="financial-item total">
                    <span>مبلغ کل:</span>
                    <span>${this.formatCurrency(this.registrationData.financial.total)}</span>
                </div>
                <div class="financial-item">
                    <span>شماره تراکنش:</span>
                    <span>${this.registrationData.payment.transactionId}</span>
                </div>
            `;
        }
    }

    async finalizeRegistration() {
        if (!this.registrationData.payment.isPaid) {
            app.showNotification('لطفاً ابتدا پرداخت را انجام دهید', 'error');
            return;
        }

        try {
            // Show loading
            this.updateStepStatus(3, 'loading', 'در حال ثبت نهایی...');

            // Simulate API call
            await this.simulateFinalRegistration();

            this.registrationData.isFinalized = true;
            this.registrationData.finalizedAt = new Date().toISOString();
            this.registrationData.receiptId = 'RCP' + Date.now();

            this.updateStepStatus(3, 'success', 'ثبت نهایی انجام شد');
            this.showReceipt();
            app.showNotification('انتخاب واحد با موفقیت ثبت شد', 'success');

            // Clear cart
            cartManager.clearCart();

            // Update dashboard
            if (window.app) {
                app.loadDashboardData();
            }

        } catch (error) {
            this.updateStepStatus(3, 'error', 'خطا در ثبت نهایی');
            app.showNotification('خطا در ثبت نهایی: ' + error.message, 'error');
        }
    }

    simulateFinalRegistration() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 5% chance of failure
                if (Math.random() < 0.05) {
                    reject(new Error('خطا در سرویس ثبت نهایی'));
                } else {
                    resolve();
                }
            }, 2000);
        });
    }

    showReceipt() {
        const receipt = document.getElementById('registration-receipt');
        const receiptId = document.getElementById('receipt-id');
        const receiptContent = document.getElementById('receipt-content');

        if (receiptId) {
            receiptId.textContent = this.registrationData.receiptId;
        }

        if (receiptContent) {
            receiptContent.innerHTML = `
                <div class="receipt-section">
                    <h4>اطلاعات دانشجو</h4>
                    <div class="receipt-info">
                        <div class="info-item">
                            <span>نام دانشجو:</span>
                            <span>${authManager.currentUser?.fullname || 'نامشخص'}</span>
                        </div>
                        <div class="info-item">
                            <span>شماره دانشجویی:</span>
                            <span>${authManager.currentUser?.studentId || 'نامشخص'}</span>
                        </div>
                        <div class="info-item">
                            <span>تاریخ ثبت:</span>
                            <span>${new Date().toLocaleDateString('fa-IR')}</span>
                        </div>
                    </div>
                </div>
                <div class="receipt-section">
                    <h4>دروس ثبت شده</h4>
                    <div class="receipt-courses">
                        ${this.registrationData.courses.map(course => `
                            <div class="receipt-course">
                                <span class="course-code">${course.code}</span>
                                <span class="course-name">${course.name}</span>
                                <span class="course-units">${course.units} واحد</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="receipt-section">
                    <h4>اطلاعات مالی</h4>
                    <div class="receipt-financial">
                        <div class="financial-item">
                            <span>مبلغ پرداختی:</span>
                            <span>${this.formatCurrency(this.registrationData.financial.total)}</span>
                        </div>
                        <div class="financial-item">
                            <span>شماره تراکنش:</span>
                            <span>${this.registrationData.payment.transactionId}</span>
                        </div>
                        <div class="financial-item">
                            <span>تاریخ پرداخت:</span>
                            <span>${new Date().toLocaleDateString('fa-IR')}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        receipt.style.display = 'block';
    }

    editSelection() {
        this.goToStep(1);
        app.showPage('cart');
    }

    printRegistration() {
        window.print();
    }

    startRegistrationProcess() {
        const cartItems = cartManager.getCartItems();
        
        if (cartItems.length === 0) {
            app.showNotification('سبد دروس خالی است', 'warning');
            return;
        }

        this.registrationData.courses = cartItems;
        this.saveRegistrationData();
        app.showPage('registration');
        this.goToStep(1);
    }

    updateStepStatus(step, status, message) {
        const statusElement = document.getElementById(`step${step}-status`);
        if (!statusElement) return;

        const icons = {
            loading: 'fas fa-spinner fa-spin',
            success: 'fas fa-check-circle',
            error: 'fas fa-times-circle',
            warning: 'fas fa-exclamation-triangle'
        };

        const colors = {
            loading: 'text-info',
            success: 'text-success',
            error: 'text-danger',
            warning: 'text-warning'
        };

        statusElement.innerHTML = `
            <i class="${icons[status]} ${colors[status]}"></i>
            ${message}
        `;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('fa-IR', {
            style: 'currency',
            currency: 'IRR'
        }).format(amount);
    }

    updateUI() {
        this.updateStepUI();
        this.updateRegistrationBadge();
    }

    updateRegistrationBadge() {
        const badge = document.getElementById('registration-badge');
        if (badge) {
            const cartItems = cartManager.getCartItems();
            badge.textContent = cartItems.length;
        }
    }

    getStudentTranscript() {
        // This would typically come from a database
        // For now, return sample data
        return [
            { courseCode: 'CE101', courseName: 'مبانی کامپیوتر', grade: 18, status: 'passed' },
            { courseCode: 'CE102', courseName: 'برنامه‌نویسی مقدماتی', grade: 17, status: 'passed' },
            { courseCode: 'CE201', courseName: 'ساختمان داده', grade: 16, status: 'passed' },
            { courseCode: 'MATH101', courseName: 'ریاضیات گسسته', grade: 15, status: 'passed' }
        ];
    }
}

// Initialize registration manager
const registrationManager = new RegistrationManager();