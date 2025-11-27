// Database Simulation
class Database {
    constructor() {
        this.students = this.loadFromStorage('students') || [];
        this.courses = this.loadFromStorage('courses') || [];
        this.departments = this.loadFromStorage('departments') || [];
        this.registrations = this.loadFromStorage('registrations') || [];
        this.transcripts = this.loadFromStorage('transcripts') || [];
        
        this.initializeSampleData();
    }

    initializeSampleData() {
        if (this.students.length === 0) {
            this.students = [
                {
                    id: 1,
                    studentId: "401234567",
                    username: "401234567",
                    password: "123456",
                    fullname: "محمد دانشجو",
                    email: "m.student@university.ac.ir",
                    phone: "09123456789",
                    major: "مهندسی کامپیوتر",
                    entryYear: "1400",
                    semester: 6,
                    totalUnits: 85,
                    gpa: 17.8,
                    avatar: "assets/images/avatar-placeholder.png"
                }
            ];
            this.saveToStorage('students', this.students);
        }

        if (this.courses.length === 0) {
            // Load from courses.json or use sample data
            this.courses = window.sampleCourses || [];
            this.saveToStorage('courses', this.courses);
        }

        if (this.departments.length === 0) {
            this.departments = [
                { id: 1, name: "مهندسی کامپیوتر", code: "CE" },
                { id: 2, name: "مهندسی برق", code: "EE" },
                { id: 3, name: "مهندسی عمران", code: "CE" },
                { id: 4, name: "مهندسی مکانیک", code: "ME" },
                { id: 5, name: "ریاضیات", code: "MATH" },
                { id: 6, name: "فیزیک", code: "PHY" }
            ];
            this.saveToStorage('departments', this.departments);
        }
    }

    // Student methods
    getStudentByCredentials(username, password) {
        return this.students.find(s => 
            s.username === username && s.password === password
        );
    }

    getStudentById(id) {
        return this.students.find(s => s.id === id);
    }

    updateStudent(id, updates) {
        const index = this.students.findIndex(s => s.id === id);
        if (index !== -1) {
            this.students[index] = { ...this.students[index], ...updates };
            this.saveToStorage('students', this.students);
            return this.students[index];
        }
        return null;
    }

    // Course methods
    getAllCourses() {
        return this.courses;
    }

    getCourseById(id) {
        return this.courses.find(c => c.id === id);
    }

    getCoursesByDepartment(department) {
        return this.courses.filter(c => c.department === department);
    }

    updateCourseCapacity(courseId, newEnrolled) {
        const course = this.getCourseById(courseId);
        if (course && newEnrolled <= course.capacity) {
            course.enrolled = newEnrolled;
            this.saveToStorage('courses', this.courses);
            return true;
        }
        return false;
    }

    // Registration methods
    createRegistration(registrationData) {
        const registration = {
            id: this.generateId(),
            studentId: registrationData.studentId,
            semester: registrationData.semester,
            courses: registrationData.courses,
            totalUnits: registrationData.totalUnits,
            tuition: registrationData.tuition,
            paymentStatus: 'paid',
            transactionId: registrationData.transactionId,
            createdAt: new Date().toISOString(),
            status: 'registered'
        };

        this.registrations.push(registration);
        this.saveToStorage('registrations', this.registrations);

        // Update course capacities
        registrationData.courses.forEach(course => {
            this.updateCourseCapacity(course.id, course.enrolled + 1);
        });

        return registration;
    }

    getStudentRegistrations(studentId) {
        return this.registrations.filter(r => r.studentId === studentId);
    }

    // Transcript methods
    getStudentTranscript(studentId) {
        let transcript = this.transcripts.find(t => t.studentId === studentId);
        
        if (!transcript) {
            // Create initial transcript
            transcript = {
                studentId: studentId,
                courses: [],
                totalUnits: 0,
                passedUnits: 0,
                gpa: 0
            };
            this.transcripts.push(transcript);
            this.saveToStorage('transcripts', this.transcripts);
        }

        return transcript;
    }

    addCourseToTranscript(studentId, courseData, grade) {
        const transcript = this.getStudentTranscript(studentId);
        const courseEntry = {
            ...courseData,
            grade: grade,
            status: grade >= 10 ? 'passed' : 'failed',
            semester: '2-1403',
            takenAt: new Date().toISOString()
        };

        transcript.courses.push(courseEntry);
        
        // Update totals
        transcript.totalUnits += courseData.units;
        if (grade >= 10) {
            transcript.passedUnits += courseData.units;
        }

        // Calculate GPA
        this.calculateGPA(transcript);

        this.saveToStorage('transcripts', this.transcripts);
        return transcript;
    }

    calculateGPA(transcript) {
        if (transcript.courses.length === 0) {
            transcript.gpa = 0;
            return;
        }

        const totalPoints = transcript.courses.reduce((sum, course) => {
            return sum + (course.grade * course.units);
        }, 0);

        const totalUnits = transcript.courses.reduce((sum, course) => {
            return sum + course.units;
        }, 0);

        transcript.gpa = totalPoints / totalUnits;
    }

    // Utility methods
    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to storage:', error);
            return false;
        }
    }

    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading from storage:', error);
            return null;
        }
    }

    // Search methods
    searchCourses(query, filters = {}) {
        return this.courses.filter(course => {
            // Text search
            const searchableText = `${course.name} ${course.code} ${course.instructor} ${course.department}`.toLowerCase();
            if (query && !searchableText.includes(query.toLowerCase())) {
                return false;
            }

            // Department filter
            if (filters.department && course.department !== filters.department) {
                return false;
            }

            // Day filter
            if (filters.day && !course.time.includes(filters.day)) {
                return false;
            }

            // Instructor filter
            if (filters.instructor && course.instructor !== filters.instructor) {
                return false;
            }

            // Units filter
            if (filters.units && course.units !== parseInt(filters.units)) {
                return false;
            }

            // Course type filter
            if (filters.courseType && course.type !== filters.courseType) {
                return false;
            }

            return true;
        });
    }

    // Statistics methods
    getRegistrationStatistics() {
        const currentSemester = '2-1403';
        const semesterRegistrations = this.registrations.filter(r => r.semester === currentSemester);
        
        return {
            totalRegistrations: semesterRegistrations.length,
            totalUnits: semesterRegistrations.reduce((sum, r) => sum + r.totalUnits, 0),
            averageUnits: semesterRegistrations.length > 0 ? 
                semesterRegistrations.reduce((sum, r) => sum + r.totalUnits, 0) / semesterRegistrations.length : 0
        };
    }

    getCourseStatistics(courseId) {
        const course = this.getCourseById(courseId);
        if (!course) return null;

        const courseRegistrations = this.registrations.filter(r => 
            r.courses.some(c => c.id === courseId)
        );

        return {
            course: course,
            totalRegistrations: courseRegistrations.length,
            capacity: course.capacity,
            enrolled: course.enrolled,
            remaining: course.capacity - course.enrolled,
            fillPercentage: (course.enrolled / course.capacity) * 100
        };
    }
}

// Initialize database
const database = new Database();

// Make sample courses available globally for fallback
window.sampleCourses = [
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
        type: "تخصصی",
        description: "این درس به آموزش مفاهیم پایه‌ای برنامه‌نویسی تحت وب می‌پردازد.",
        prerequisites: ["مبانی کامپیوتر"],
        color: "#4361ee",
        examDate: "1403/01/20"
    },
];