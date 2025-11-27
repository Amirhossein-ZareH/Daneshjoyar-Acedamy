// Schedule Management System
class ScheduleManager {
    constructor() {
        this.scheduleData = {};
        this.currentView = 'weekly';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadScheduleData();
    }

    setupEventListeners() {
        // View options
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.getAttribute('data-view');
                this.switchView(view);
            });
        });

        // Print schedule
        document.getElementById('print-schedule')?.addEventListener('click', () => {
            this.printSchedule();
        });

        // Export schedule
        document.getElementById('export-schedule')?.addEventListener('click', () => {
            this.exportSchedule();
        });

        // Semester selector
        document.getElementById('semester-select')?.addEventListener('change', (e) => {
            this.loadScheduleData(e.target.value);
        });
    }

    loadScheduleData(semester = '1') {
        // In a real app, this would load from an API based on semester
        // For now, we'll generate schedule from cart items
        this.generateScheduleFromCart();
        this.renderSchedule();
    }

    generateScheduleFromCart() {
        const cartItems = cartManager.getCartItems();
        const schedule = {
            "8-10": ["", "", "", "", "", ""],
            "10-12": ["", "", "", "", "", ""],
            "14-16": ["", "", "", "", "", ""],
            "16-18": ["", "", "", "", "", ""]
        };

        const days = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه'];

        cartItems.forEach(course => {
            const timeMatch = course.time.match(/(\d+)-(\d+)/);
            if (timeMatch) {
                const timeKey = `${timeMatch[1]}-${timeMatch[2]}`;
                const dayIndex = days.findIndex(day => course.time.includes(day));
                
                if (schedule[timeKey] && dayIndex !== -1) {
                    schedule[timeKey][dayIndex] = course.name;
                }
            }
        });

        this.scheduleData = schedule;
    }

    renderSchedule() {
        this.renderWeeklySchedule();
        this.renderListSchedule();
        this.updateScheduleStats();
    }

    renderWeeklySchedule() {
        const container = document.getElementById('weekly-schedule');
        if (!container) return;

        const days = ['ساعت', 'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه'];
        const timeSlots = Object.keys(this.scheduleData);

        let scheduleHTML = '<div class="schedule">';

        // Header row
        days.forEach(day => {
            scheduleHTML += `<div class="schedule-header">${day}</div>`;
        });

        // Time slots
        timeSlots.forEach(time => {
            // Time cell
            scheduleHTML += `<div class="schedule-header">${time}</div>`;
            
            // Day cells
            this.scheduleData[time].forEach((course, index) => {
                if (course) {
                    const courseData = coursesManager.courses.find(c => c.name === course);
                    scheduleHTML += `
                        <div class="schedule-cell course" style="background: ${courseData?.color || '#4361ee'};" 
                             data-course="${course}" title="${course} - ${time}">
                            <div class="course-name">${course}</div>
                            <div class="course-details">${courseData?.location || ''}</div>
                        </div>
                    `;
                } else {
                    scheduleHTML += `<div class="schedule-cell empty"></div>`;
                }
            });
        });

        scheduleHTML += '</div>';
        container.innerHTML = scheduleHTML;

        // Add click events to course cells
        container.querySelectorAll('.schedule-cell.course').forEach(cell => {
            cell.addEventListener('click', () => {
                const courseName = cell.getAttribute('data-course');
                const course = coursesManager.courses.find(c => c.name === courseName);
                if (course) {
                    coursesManager.showCourseDetails(course.id);
                }
            });
        });
    }

    renderListSchedule() {
        const container = document.getElementById('list-schedule');
        if (!container) return;

        const cartItems = cartManager.getCartItems();
        
        if (cartItems.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">هیچ درسی در برنامه هفتگی وجود ندارد</p>';
            return;
        }

        const scheduleHTML = cartItems.map(course => `
            <div class="schedule-list-item">
                <div class="schedule-list-time">${course.time}</div>
                <div class="schedule-list-details">
                    <h4>${course.name}</h4>
                    <p>${course.instructor} - ${course.location} - ${course.units} واحد</p>
                </div>
                <button class="btn btn-outline btn-sm" onclick="coursesManager.showCourseDetails(${course.id})">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        `).join('');

        container.innerHTML = scheduleHTML;
    }

    switchView(view) {
        this.currentView = view;
        
        // Update active button
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-view') === view);
        });

        // Show/hide views
        const weeklyView = document.getElementById('weekly-schedule');
        const listView = document.getElementById('list-schedule');

        if (view === 'weekly') {
            weeklyView.classList.remove('hidden');
            listView.classList.add('hidden');
        } else {
            weeklyView.classList.add('hidden');
            listView.classList.remove('hidden');
        }
    }

    updateScheduleStats() {
        const cartItems = cartManager.getCartItems();
        const totalUnits = cartItems.reduce((sum, course) => sum + course.units, 0);
        
        const totalUnitsElement = document.getElementById('schedule-total-units');
        if (totalUnitsElement) {
            totalUnitsElement.textContent = totalUnits;
        }
    }

    printSchedule() {
        window.print();
    }

    exportSchedule() {
        // In a real app, this would generate a PDF
        app.showNotification('در حال تولید فایل PDF...', 'info');
        
        setTimeout(() => {
            app.showNotification('فایل PDF با موفقیت تولید شد', 'success');
            
            // Simulate download
            const link = document.createElement('a');
            link.download = 'program-haftegi.pdf';
            link.href = '#';
            link.click();
        }, 1500);
    }
}

// Initialize schedule manager
const scheduleManager = new ScheduleManager();