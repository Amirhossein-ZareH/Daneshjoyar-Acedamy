import tkinter as tk
from tkinter import ttk, messagebox
import sqlite3
import os

class DatabaseManager:
    def __init__(self, db_name="university.db"):
        self.db_name = db_name
        self.init_database()
    
    def get_connection(self):
        return sqlite3.connect(self.db_name)
    
    def init_database(self):
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # ایجاد جدول دانشجویان
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS students (
                sid TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                password TEXT NOT NULL,
                major TEXT NOT NULL,
                email TEXT,
                entry_year TEXT,
                total_units INTEGER DEFAULT 0
            )
        ''')
        
        # ایجاد جدول اساتید
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS professors (
                pid TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                password TEXT NOT NULL,
                department TEXT NOT NULL
            )
        ''')
        
        # ایجاد جدول مدیران
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS admins (
                username TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                password TEXT NOT NULL
            )
        ''')
        
        # ایجاد جدول دروس
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS courses (
                course_code TEXT PRIMARY KEY,
                course_name TEXT NOT NULL,
                professor TEXT NOT NULL,
                professor_id TEXT NOT NULL,
                units INTEGER NOT NULL,
                capacity INTEGER NOT NULL,
                current_students INTEGER DEFAULT 0,
                schedule TEXT NOT NULL,
                department TEXT NOT NULL,
                classroom TEXT,
                exam_date TEXT,
                status TEXT DEFAULT 'approved'
            )
        ''')
        
        # ایجاد جدول ارتباط دانشجویان و دروس
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS student_courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT NOT NULL,
                course_code TEXT NOT NULL,
                FOREIGN KEY (student_id) REFERENCES students (sid),
                FOREIGN KEY (course_code) REFERENCES courses (course_code),
                UNIQUE(student_id, course_code)
            )
        ''')
        
        # درج داده‌های اولیه
        self._insert_sample_data(cursor)
        
        conn.commit()
        conn.close()
    
    def _insert_sample_data(self, cursor):
        # درج اساتید نمونه
        professors = [
            ("1001", "مجتبی مددیار", "123456", "برنامه سازی پیشرفته"),
            ("1002", "شعله اعلائی", "123456", "فیزیک"),
            ("2001", "فردین اسماعیلی", "123456", "کارگاه کامپیوتر"),
            ("3001", "نازنین صالح امین", "123456", "ازمایشگاه سیستم عامل"),
            ("4001", "کیا عباسی", "123456", "زبان"),
            ("5001", "عباس زارع", "123456", "ریاضی")
        ]
        
        cursor.executemany('''
            INSERT OR IGNORE INTO professors (pid, name, password, department)
            VALUES (?, ?, ?, ?)
        ''', professors)
        
        # درج مدیران نمونه
        admins = [
            ("admin", "مدیر سیستم", "admin123"),
            ("admin2", "مدیر آموزشی", "123456"),
            ("supervisor", "ناظر تحصیلی", "super123")
        ]
        
        cursor.executemany('''
            INSERT OR IGNORE INTO admins (username, name, password)
            VALUES (?, ?, ?)
        ''', admins)
        
        # درج دروس نمونه
        courses = [
            ("101", "ریاضی عمومی ۱", "دکتر احمدی", "1001", 3, 40, 0, "شنبه و دوشنبه ۱۰-۱۲", "ریاضی", "۲۰۱", "۱۴۰۴/۰۳/۲۰"),
            ("102", "فیزیک ۱", "دکتر رضایی", "1002", 3, 35, 0, "یکشنبه و سه‌شنبه ۸-۱۰", "فیزیک", "۳۰۱", "۱۴۰۴/۰۳/۲۲"),
            ("201", "برنامه‌نویسی پایتون", "مهندس محمدی", "2001", 3, 30, 0, "دوشنبه و چهارشنبه ۱۴-۱۶", "کامپیوتر", "۱۰۵", "۱۴۰۴/۰۳/۲۵"),
            ("301", "معماری کامپیوتر", "دکتر شریفی", "3001", 3, 28, 0, "شنبه و چهارشنبه ۸-۱۰", "کامپیوتر", "۲۰۳", "۱۴۰۴/۰۳/۲۸"),
            ("401", "زبان انگلیسی", "دکتر کریمی", "4001", 2, 50, 0, "یکشنبه ۱۶-۱۸", "زبان", "۱۰۱", "۱۴۰۴/۰۴/۰۱"),
            ("501", "آمار و احتمال", "دکتر حسینی", "5001", 3, 45, 0, "دوشنبه و چهارشنبه ۱۰-۱۲", "ریاضی", "۲۰۲", "۱۴۰۴/۰۴/۰۵")
        ]
        
        cursor.executemany('''
            INSERT OR IGNORE INTO courses (course_code, course_name, professor, professor_id, units, capacity, current_students, schedule, department, classroom, exam_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', courses)
        
        # درج دانشجویان نمونه
        students = [
            ("400123456", "علی محمدی", "123456", "کامپیوتر", "ali@uni.ac.ir", "1400", 0),
            ("400123457", "فاطمه احمدی", "123456", "ریاضی", "fatemeh@uni.ac.ir", "1400", 0),
            ("401123458", "محمد رضایی", "123456", "فیزیک", "mohammad@uni.ac.ir", "1401", 0)
        ]
        
        cursor.executemany('''
            INSERT OR IGNORE INTO students (sid, name, password, major, email, entry_year, total_units)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', students)


class UniversitySystem:
    def __init__(self):
        self.db = DatabaseManager()
        self._cache_data()
    
    def _cache_data(self):
        """کش کردن داده‌ها برای عملکرد بهتر"""
        self.students = self._get_all_students()
        self.professors = self._get_all_professors()
        self.admins = self._get_all_admins()
        self.courses = self._get_all_courses()
    
    def _get_all_students(self):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM students')
        students = {}
        for row in cursor.fetchall():
            sid, name, password, major, email, entry_year, total_units = row
            students[sid] = {
                "name": name,
                "password": password,
                "major": major,
                "email": email,
                "entry_year": entry_year,
                "total_units": total_units,
                "courses": self._get_student_courses(sid)
            }
        conn.close()
        return students
    
    def _get_all_professors(self):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM professors')
        professors = {}
        for row in cursor.fetchall():
            pid, name, password, department = row
            professors[pid] = {
                "name": name,
                "password": password,
                "department": department
            }
        conn.close()
        return professors
    
    def _get_all_admins(self):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM admins')
        admins = {}
        for row in cursor.fetchall():
            username, name, password = row
            admins[username] = {
                "name": name,
                "password": password
            }
        conn.close()
        return admins
    
    def _get_all_courses(self):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM courses')
        courses = {}
        for row in cursor.fetchall():
            if len(row) == 12:  # اگر ستون status وجود دارد
                course_code, course_name, professor, professor_id, units, capacity, current_students, schedule, department, classroom, exam_date, status = row
            else:  # اگر ستون status وجود ندارد
                course_code, course_name, professor, professor_id, units, capacity, current_students, schedule, department, classroom, exam_date = row
                status = "approved"  # مقدار پیش‌فرض
            
            courses[course_code] = {
                "name": course_name,
                "professor": professor,
                "professor_id": professor_id,
                "units": units,
                "capacity": capacity,
                "current_students": current_students,
                "schedule": schedule,
                "department": department,
                "classroom": classroom,
                "exam_date": exam_date,
                "status": status
            }
        conn.close()
        return courses
    
    def _get_student_courses(self, student_id):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT course_code FROM student_courses WHERE student_id = ?', (student_id,))
        courses = [row[0] for row in cursor.fetchall()]
        conn.close()
        return courses
    
    def _update_student_units(self, student_id):
        """به روزرسانی مجموع واحدهای دانشجو"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        # محاسبه مجموع واحدها
        cursor.execute('''
            SELECT SUM(c.units) 
            FROM student_courses sc 
            JOIN courses c ON sc.course_code = c.course_code 
            WHERE sc.student_id = ?
        ''', (student_id,))
        
        total_units = cursor.fetchone()[0] or 0
        
        # به روزرسانی واحدها در دیتابیس
        cursor.execute('UPDATE students SET total_units = ? WHERE sid = ?', (total_units, student_id))
        conn.commit()
        conn.close()
        
        # به روزرسانی کش
        if student_id in self.students:
            self.students[student_id]["total_units"] = total_units
    
    def _update_course_students(self, course_code):
        """به روزرسانی تعداد دانشجویان ثبت‌نام شده در درس"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM student_courses WHERE course_code = ?', (course_code,))
        current_students = cursor.fetchone()[0]
        
        cursor.execute('UPDATE courses SET current_students = ? WHERE course_code = ?', (current_students, course_code))
        conn.commit()
        conn.close()
        
        # به روزرسانی کش
        if course_code in self.courses:
            self.courses[course_code]["current_students"] = current_students

    def add_student(self, sid, name, password, major, email="", year=""):
        if sid in self.students:
            return False, "شماره دانشجویی تکراری است!"
        
        if not all([sid, name, password, major]):
            return False, "لطفا تمام فیلدهای ضروری را پر کنید!"
        
        try:
            conn = self.db.get_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO students (sid, name, password, major, email, entry_year, total_units)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (sid, name, password, major, email, year or "نامشخص", 0))
            conn.commit()
            conn.close()
            
            # به روزرسانی کش
            self.students[sid] = {
                "name": name,
                "password": password,
                "major": major,
                "email": email,
                "entry_year": year or "نامشخص",
                "total_units": 0,
                "courses": []
            }
            
            return True, "ثبت‌نام با موفقیت انجام شد!"
        except Exception as e:
            return False, f"خطا در ثبت دانشجو: {str(e)}"

    def add_course(self, data):
        code = data["course_code"]
        if code in self.courses:
            return False, "کد درس تکراری است!"
        
        required = ["course_code", "course_name", "professor", "units", "capacity", "schedule", "department"]
        if not all(data.get(f) for f in required):
            return False, "لطفا تمام فیلدهای ضروری را پر کنید!"
        
        try:
            conn = self.db.get_connection()
            cursor = conn.cursor()
            
            # بررسی وجود ستون status
            cursor.execute("PRAGMA table_info(courses)")
            columns = [column[1] for column in cursor.fetchall()]
            has_status = 'status' in columns
            
            if has_status:
                cursor.execute('''
                    INSERT INTO courses (course_code, course_name, professor, professor_id, units, capacity, schedule, department, classroom, exam_date, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    code,
                    data["course_name"],
                    data["professor"],
                    data.get("professor_id", ""),
                    int(data["units"]),
                    int(data["capacity"]),
                    data["schedule"],
                    data["department"],
                    data.get("classroom", ""),
                    data.get("exam_date", ""),
                    "pending"
                ))
            else:
                cursor.execute('''
                    INSERT INTO courses (course_code, course_name, professor, professor_id, units, capacity, schedule, department, classroom, exam_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    code,
                    data["course_name"],
                    data["professor"],
                    data.get("professor_id", ""),
                    int(data["units"]),
                    int(data["capacity"]),
                    data["schedule"],
                    data["department"],
                    data.get("classroom", ""),
                    data.get("exam_date", "")
                ))
            
            conn.commit()
            conn.close()
            
            # به روزرسانی کش
            self.courses[code] = {
                "name": data["course_name"],
                "professor": data["professor"],
                "professor_id": data.get("professor_id", ""),
                "units": int(data["units"]),
                "capacity": int(data["capacity"]),
                "current_students": 0,
                "schedule": data["schedule"],
                "department": data["department"],
                "classroom": data.get("classroom", ""),
                "exam_date": data.get("exam_date", ""),
                "status": "pending" if has_status else "approved"
            }
            
            return True, "درس با موفقیت اضافه شد!" + (" و در انتظار تأیید است!" if has_status else "")
        except Exception as e:
            return False, f"خطا در اضافه کردن درس: {str(e)}"

    def update_course(self, code, data):
        """ویرایش اطلاعات درس"""
        if code not in self.courses:
            return False, "درس یافت نشد!"
        
        try:
            conn = self.db.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE courses 
                SET course_name=?, professor=?, professor_id=?, units=?, capacity=?, 
                    schedule=?, department=?, classroom=?, exam_date=?
                WHERE course_code=?
            ''', (
                data["course_name"],
                data["professor"],
                data.get("professor_id", ""),
                int(data["units"]),
                int(data["capacity"]),
                data["schedule"],
                data["department"],
                data.get("classroom", ""),
                data.get("exam_date", ""),
                code
            ))
            
            conn.commit()
            conn.close()
            
            # به روزرسانی کش
            self.courses[code].update({
                "name": data["course_name"],
                "professor": data["professor"],
                "professor_id": data.get("professor_id", ""),
                "units": int(data["units"]),
                "capacity": int(data["capacity"]),
                "schedule": data["schedule"],
                "department": data["department"],
                "classroom": data.get("classroom", ""),
                "exam_date": data.get("exam_date", "")
            })
            
            return True, "اطلاعات درس با موفقیت به روزرسانی شد!"
        except Exception as e:
            return False, f"خطا در به روزرسانی درس: {str(e)}"

    def approve_course(self, code):
        """تأیید درس"""
        if code not in self.courses:
            return False, "درس یافت نشد!"
        
        try:
            conn = self.db.get_connection()
            cursor = conn.cursor()
            
            # بررسی وجود ستون status
            cursor.execute("PRAGMA table_info(courses)")
            columns = [column[1] for column in cursor.fetchall()]
            
            if 'status' in columns:
                cursor.execute('UPDATE courses SET status=? WHERE course_code=?', ("approved", code))
                conn.commit()
                conn.close()
                
                # به روزرسانی کش
                self.courses[code]["status"] = "approved"
                return True, "درس با موفقیت تأیید شد!"
            else:
                conn.close()
                return False, "سیستم وضعیت دروس فعال نیست!"
                
        except Exception as e:
            return False, f"خطا در تأیید درس: {str(e)}"

    def reject_course(self, code):
        """رد درس"""
        if code not in self.courses:
            return False, "درس یافت نشد!"
        
        try:
            conn = self.db.get_connection()
            cursor = conn.cursor()
            
            # بررسی وجود ستون status
            cursor.execute("PRAGMA table_info(courses)")
            columns = [column[1] for column in cursor.fetchall()]
            
            if 'status' in columns:
                cursor.execute('UPDATE courses SET status=? WHERE course_code=?', ("rejected", code))
                conn.commit()
                conn.close()
                
                # به روزرسانی کش
                self.courses[code]["status"] = "rejected"
                return True, "درس با موفقیت رد شد!"
            else:
                conn.close()
                return False, "سیستم وضعیت دروس فعال نیست!"
                
        except Exception as e:
            return False, f"خطا در رد درس: {str(e)}"

    def delete_course(self, code):
        if code not in self.courses:
            return False, "درس یافت نشد!"
        
        try:
            conn = self.db.get_connection()
            cursor = conn.cursor()
            
            # حذف ارتباطات دانشجویان با این درس
            cursor.execute('DELETE FROM student_courses WHERE course_code = ?', (code,))
            
            # حذف درس
            cursor.execute('DELETE FROM courses WHERE course_code = ?', (code,))
            
            conn.commit()
            conn.close()
            
            # به روزرسانی کش
            del self.courses[code]
            
            # به روزرسانی واحدهای تمام دانشجویان
            for student_id in self.students:
                if code in self.students[student_id]["courses"]:
                    self.students[student_id]["courses"].remove(code)
                self._update_student_units(student_id)
            
            return True, "درس با موفقیت حذف شد!"
        except Exception as e:
            return False, f"خطا در حذف درس: {str(e)}"

    def enroll_student(self, student_id, course_code):
        """ثبت نام دانشجو در درس"""
        if course_code not in self.courses:
            return False, "درس یافت نشد!"
        
        if student_id not in self.students:
            return False, "دانشجو یافت نشد!"
        
        course = self.courses[course_code]
        student = self.students[student_id]
        
        # بررسی شرایط
        if course.get("status") == "rejected":
            return False, "این درس رد شده است!"
        
        if course.get("status") == "pending":
            return False, "این درس هنوز تأیید نشده است!"
        
        if course_code in student["courses"]:
            return False, "این درس قبلاً انتخاب شده است!"
        
        if course["current_students"] >= course["capacity"]:
            return False, "ظرفیت این درس تکمیل است!"
        
        if student["total_units"] + course["units"] > 20:
            return False, "مجموع واحدهای شما نمی‌تواند از ۲۰ واحد بیشتر شود!"
        
        try:
            conn = self.db.get_connection()
            cursor = conn.cursor()
            
            # اضافه کردن به جدول ارتباطی
            cursor.execute('INSERT INTO student_courses (student_id, course_code) VALUES (?, ?)', (student_id, course_code))
            
            conn.commit()
            conn.close()
            
            # به روزرسانی کش
            student["courses"].append(course_code)
            self._update_student_units(student_id)
            self._update_course_students(course_code)
            
            return True, f"ثبت نام در درس {course['name']} با موفقیت انجام شد"
        except Exception as e:
            return False, f"خطا در ثبت نام: {str(e)}"

    def drop_student_course(self, student_id, course_code):
        """حذف درس دانشجو"""
        if course_code not in self.courses:
            return False, "درس یافت نشد!"
        
        if student_id not in self.students:
            return False, "دانشجو یافت نشد!"
        
        if course_code not in self.students[student_id]["courses"]:
            return False, "این درس در لیست دروس شما نیست!"
        
        try:
            conn = self.db.get_connection()
            cursor = conn.cursor()
            
            # حذف از جدول ارتباطی
            cursor.execute('DELETE FROM student_courses WHERE student_id = ? AND course_code = ?', (student_id, course_code))
            
            conn.commit()
            conn.close()
            
            # به روزرسانی کش
            self.students[student_id]["courses"].remove(course_code)
            self._update_student_units(student_id)
            self._update_course_students(course_code)
            
            return True, f"درس {self.courses[course_code]['name']} با موفقیت حذف شد"
        except Exception as e:
            return False, f"خطا در حذف درس: {str(e)}"


class UniversityApp:
    def __init__(self, root):
        self.root = root
        self.root.title(" سامانه آموزشی دانشگاه آزاد اسلامی")
        self.root.geometry("1200x700")
        self.root.configure(bg="#f8f9fa")

        self.colors = {'primary': '#006837', 'secondary': '#009f4f', 'success': '#27ae60', 'danger': '#e74c3c', 'warning': '#f39c12', 'bg': '#f8f9fa'}
        self.fonts = {'title': ('B Nazanin', 24, 'bold'), 'header': ('B Nazanin', 16, 'bold'), 'subheader': ('B Nazanin', 12, 'bold'), 'normal': ('B Nazanin', 11), 'small': ('B Nazanin', 10)}

        self.system = UniversitySystem()
        self.current_user = self.current_type = None
        self.show_welcome()

    def clear(self): 
        [w.destroy() for w in self.root.winfo_children()]

    def show_welcome(self):
        self.clear()
        header = tk.Frame(self.root, bg=self.colors['primary'], height=150)
        header.pack(fill='x'); header.pack_propagate(False)
        tk.Label(header, text=" دانشگاه آزاد اسلامی", font=('B Nazanin', 30, 'bold'), fg='white', bg=self.colors['primary']).pack(pady=30)
        tk.Label(header, text="سامانه جامع آموزشی - انتخاب واحد آنلاین", font=('B Nazanin', 14), fg='white', bg=self.colors['primary']).pack()

        body = tk.Frame(self.root, bg=self.colors['bg'])
        body.pack(fill='both', expand=True, padx=80, pady=40)

        for title, desc, color, cmd in [
            (" دانشجویان", "انتخاب واحد، مشاهده دروس و کارنامه", self.colors['secondary'], lambda: self.show_login("student")),
            (" اساتید", "مدیریت دروس و مشاهده دانشجویان", self.colors['warning'], lambda: self.show_login("professor")),
            (" مدیر سیستم", "تعریف درس، مدیریت دانشجویان و دروس", self.colors['danger'], lambda: self.show_login("admin")),
            (" ثبت نام جدید", "ثبت نام دانشجویان جدید در سامانه", self.colors['success'], self.show_register)
        ]:
            card = tk.Frame(body, bg='white', relief='raised', bd=3, width=250, height=200)
            card.pack(side='left', padx=15, expand=True); card.pack_propagate(False)
            tk.Label(card, text=title, font=self.fonts['header'], fg=color, bg='white').pack(pady=25)
            tk.Label(card, text=desc, font=self.fonts['normal'], bg='white', fg='#444', wraplength=200, justify='center').pack(pady=10, padx=10)
            tk.Button(card, text="ورود / ثبت نام", font=('B Nazanin', 12, 'bold'), bg=color, fg='white', bd=0, padx=30, pady=10, command=cmd, cursor="hand2").pack(pady=20)

    def show_register(self):
        self.clear()
        self._create_header(" ثبت نام دانشجوی جدید", self.colors['success'])
        entries = self._create_form([
            (" شماره دانشجویی *", "sid"), (" نام و نام خانوادگی *", "name"), (" ایمیل", "email"),
            (" رمز عبور *", "password", True), (" رشته تحصیلی *", "major"), (" سال ورود", "year")
        ])
        
        def register():
            data = {k: e.get().strip() for k, e in entries.items()}
            if not all(data.get(r) for r in ['sid', 'name', 'password', 'major']):
                return messagebox.showerror("خطا", " لطفا فیلدهای ستاره‌دار را پر کنید!")
            if not messagebox.askyesno("تأیید ثبت نام", f"آیا از اطلاعات زیر اطمینان دارید؟\n\nشماره دانشجویی: {data['sid']}\nنام: {data['name']}\nرشته: {data['major']}\nسال ورود: {data.get('year', 'تعیین نشده')}"):
                return
            success, msg = self.system.add_student(data['sid'], data['name'], data['password'], data['major'], data.get('email'), data.get('year'))
            messagebox.showinfo(" موفق", f"{msg}\n\nشماره دانشجویی شما: {data['sid']}") if success else messagebox.showerror(" خطا", msg)
            if success: self.show_welcome()

        self._create_buttons(" تایید و ثبت نام", register, self.colors['success'])

    def show_login(self, user_type):
        self.clear()
        colors = {"student": self.colors['secondary'], "professor": self.colors['warning'], "admin": self.colors['danger']}
        titles = {"student": " ورود دانشجویان", "professor": " ورود اساتید", "admin": " ورود مدیر سیستم"}
        
        self._create_header(titles[user_type], colors[user_type])
        user_entry = tk.Entry(self.root, font=self.fonts['normal'], width=30, justify='center')
        pass_entry = tk.Entry(self.root, font=self.fonts['normal'], width=30, show='*', justify='center')
        
        tk.Label(self.root, text=" نام کاربری:", font=self.fonts['subheader'], bg=self.colors['bg']).pack(pady=15)
        user_entry.pack(pady=10)
        tk.Label(self.root, text=" رمز عبور:", font=self.fonts['subheader'], bg=self.colors['bg']).pack(pady=15)
        pass_entry.pack(pady=10)

        def login():
            u, p = user_entry.get().strip(), pass_entry.get().strip()
            if not u or not p: return messagebox.showerror("خطا", " لطفا همه فیلدها را پر کنید!")
            
            user_data = getattr(self.system, f"{user_type}s", {})
            if u in user_data and user_data[u]["password"] == p:
                self.current_user, self.current_type = u, user_type
                getattr(self, f"show_{user_type}_panel")()
            else: messagebox.showerror("خطا", " نام کاربری یا رمز عبور اشتباه است!")

        self._create_buttons(" ورود به سامانه", login, colors[user_type])

    def show_student_panel(self):
        self._create_user_panel("student", self.colors['secondary'], [
            (" انتخاب واحد", self.show_course_selection),
            (" دروس من", self.show_my_courses),
            (" خروج", self.logout)
        ])

    def show_course_selection(self):
        self._clear_content()
        tk.Label(self.content, text=" انتخاب واحد ترم جاری", font=self.fonts['header'], bg=self.colors['bg']).pack(pady=15)
        
        # بررسی وجود دروس
        if not self.system.courses:
            tk.Label(self.content, text=" هیچ درسی تعریف نشده است.", font=self.fonts['normal'], fg='red').pack(expand=True)
            return

        # ایجاد فریم برای جستجو
        search_frame = tk.Frame(self.content, bg=self.colors['bg'])
        search_frame.pack(fill='x', padx=20, pady=10)
        
        tk.Label(search_frame, text=" جستجو:", font=self.fonts['normal'], bg=self.colors['bg']).pack(side='left')
        search_var = tk.StringVar()
        search_entry = tk.Entry(search_frame, textvariable=search_var, font=self.fonts['normal'], width=35)
        search_entry.pack(side='left', padx=10)

        # ایجاد فریم برای جدول
        table_frame = tk.Frame(self.content, bg=self.colors['bg'])
        table_frame.pack(fill='both', expand=True, padx=20, pady=10)

        # ایجاد جدول
        tree = ttk.Treeview(table_frame, columns=('کد', 'نام درس', 'استاد', 'دانشکده', 'واحد', 'زمان', 'ظرفیت', 'وضعیت'), 
                           show='headings', height=15)
        
        # تعریف ستون‌ها
        columns = [('کد', 70), ('نام درس', 200), ('استاد', 120), ('دانشکده', 100), 
                  ('واحد', 60), ('زمان', 150), ('ظرفیت', 80), ('وضعیت', 100)]
        
        for col, width in columns:
            tree.heading(col, text=col)
            tree.column(col, width=width, anchor='center')

        # اسکرول بار
        scrollbar = ttk.Scrollbar(table_frame, orient='vertical', command=tree.yview)
        tree.configure(yscrollcommand=scrollbar.set)
        
        tree.pack(side='left', fill='both', expand=True)
        scrollbar.pack(side='right', fill='y')

        # فریم برای دکمه‌های عملیاتی
        button_frame = tk.Frame(self.content, bg=self.colors['bg'])
        button_frame.pack(fill='x', padx=20, pady=10)
        
        def update_table():
            # پاک کردن ردیف‌های قبلی
            for item in tree.get_children():
                tree.delete(item)
            
            # پاک کردن دکمه‌های قبلی
            for widget in button_frame.winfo_children():
                widget.destroy()
                
            query = search_var.get().lower()
            enrolled = self.system.students[self.current_user]["courses"]
            
            row_buttons = []  # برای ذخیره دکمه‌های هر ردیف
            
            for i, (code, course) in enumerate(self.system.courses.items()):
                if query and query not in course["name"].lower() and query not in str(code).lower():
                    continue
                
                # فقط دروس تأیید شده را نمایش بده
                if course.get("status") in ["rejected", "pending"]:
                    continue
                
                status = " ثبت‌نام شده" if code in enrolled else " قابل ثبت‌نام" if course["current_students"] < course["capacity"] else " تکمیل ظرفیت"
                tree.insert('', 'end', values=(
                    code, course["name"], course["professor"], course["department"], 
                    course["units"], course["schedule"], 
                    f"{course['current_students']}/{course['capacity']}", 
                    status
                ))
                
                # ایجاد دکمه عملیاتی برای هر ردیف
                if code in enrolled:
                    btn = tk.Button(button_frame, text=f"حذف {code}", font=self.fonts['small'], 
                                  bg=self.colors['danger'], fg='white', bd=0, padx=8, pady=3, 
                                  cursor="hand2")
                    btn.config(command=lambda c=code: self._course_action(c, "drop", update_table))
                    row_buttons.append(btn)
                elif course["current_students"] < course["capacity"]:
                    btn = tk.Button(button_frame, text=f"انتخاب {code}", font=self.fonts['small'], 
                                  bg=self.colors['success'], fg='white', bd=0, padx=8, pady=3, 
                                  cursor="hand2")
                    btn.config(command=lambda c=code: self._course_action(c, "enroll", update_table))
                    row_buttons.append(btn)
                else:
                    # برای دروس تکمیل ظرفیت دکمه غیرفعال
                    btn = tk.Button(button_frame, text=f"تکمیل {code}", font=self.fonts['small'], 
                                  bg='#95a5a6', fg='white', bd=0, padx=8, pady=3, 
                                  state='disabled')
                    row_buttons.append(btn)
            
            # چیدمان دکمه‌ها در فریم
            for i, btn in enumerate(row_buttons):
                btn.grid(row=0, column=i, padx=5, pady=5)

        # رویداد جستجو
        def on_search(*args):
            update_table()
            
        search_var.trace_add('write', on_search)
        
        # بارگذاری اولیه داده‌ها
        update_table()

    def _course_action(self, course_code, action, callback):
        if action == "enroll":
            success, msg = self.system.enroll_student(self.current_user, course_code)
            if success:
                callback()
                messagebox.showinfo(" موفق", msg)
            else:
                messagebox.showwarning(" خطا", msg)
        else:
            success, msg = self.system.drop_student_course(self.current_user, course_code)
            if success:
                callback()
                messagebox.showinfo(" موفق", msg)
            else:
                messagebox.showwarning(" خطا", msg)

    def show_my_courses(self):
        self._clear_content()
        tk.Label(self.content, text=" دروس ثبت‌نام شده شما", font=self.fonts['header'], bg=self.colors['bg']).pack(pady=20)
        courses = self.system.students[self.current_user]["courses"]
        if not courses: 
            tk.Label(self.content, text=" هیچ درسی انتخاب نکرده‌اید.", font=self.fonts['normal'], fg='gray').pack(expand=True)
            return
        
        # ایجاد فریم برای جدول
        table_frame = tk.Frame(self.content, bg=self.colors['bg'])
        table_frame.pack(fill='both', expand=True, padx=20, pady=10)
        
        tree = ttk.Treeview(table_frame, columns=('کد', 'نام درس', 'استاد', 'واحد', 'زمان', 'امتحان'), 
                           show='headings', height=10)
        
        columns = [('کد', 80), ('نام درس', 200), ('استاد', 120), ('واحد', 60), ('زمان', 150), ('امتحان', 100)]
        
        for col, width in columns:
            tree.heading(col, text=col)
            tree.column(col, width=width, anchor='center')
        
        scrollbar = ttk.Scrollbar(table_frame, orient='vertical', command=tree.yview)
        tree.configure(yscrollcommand=scrollbar.set)
        
        tree.pack(side='left', fill='both', expand=True)
        scrollbar.pack(side='right', fill='y')
        
        for code in courses:
            c = self.system.courses[code]
            tree.insert('', 'end', values=(
                code, c["name"], c["professor"], c["units"], 
                c["schedule"], c.get("exam_date", "تعیین نشده")
            ))

    def show_professor_panel(self):
        self._create_user_panel("professor", self.colors['warning'], [
            (" دروس من", self.show_professor_courses),
            (" دانشجویان من", self.show_professor_students),
            (" خروج", self.logout)
        ])

    def show_professor_courses(self):
        self._clear_content()
        tk.Label(self.content, text=" دروس تحت تدریس", font=self.fonts['header'], bg=self.colors['bg']).pack(pady=20)
        prof_courses = [(code, c) for code, c in self.system.courses.items() if c.get("professor_id") == self.current_user]
        if not prof_courses: 
            tk.Label(self.content, text=" هیچ درسی برای شما تعریف نشده است.", font=self.fonts['normal'], fg='red').pack(expand=True)
            return
        
        table_frame = tk.Frame(self.content, bg=self.colors['bg'])
        table_frame.pack(fill='both', expand=True, padx=20, pady=10)
        
        tree = ttk.Treeview(table_frame, columns=('کد', 'نام درس', 'دانشکده', 'واحد', 'دانشجویان', 'ظرفیت', 'زمان', 'وضعیت'), 
                           show='headings', height=10)
        
        columns = [('کد', 70), ('نام درس', 180), ('دانشکده', 100), ('واحد', 60), 
                  ('دانشجویان', 80), ('ظرفیت', 70), ('زمان', 150), ('وضعیت', 100)]
        
        for col, width in columns:
            tree.heading(col, text=col)
            tree.column(col, width=width, anchor='center')
        
        scrollbar = ttk.Scrollbar(table_frame, orient='vertical', command=tree.yview)
        tree.configure(yscrollcommand=scrollbar.set)
        
        tree.pack(side='left', fill='both', expand=True)
        scrollbar.pack(side='right', fill='y')
        
        for code, course in prof_courses:
            status_text = "تأیید شده" if course.get("status") == "approved" else "در انتظار تأیید" if course.get("status") == "pending" else "رد شده"
            tree.insert('', 'end', values=(
                code, course["name"], course["department"], course["units"], 
                course["current_students"], course["capacity"], course["schedule"], status_text
            ))

    def show_professor_students(self):
        self._clear_content()
        tk.Label(self.content, text=" دانشجویان تحت تدریس", font=self.fonts['header'], bg=self.colors['bg']).pack(pady=20)
        
        # یافتن دانشجویانی که در دروس این استاد ثبت نام کرده‌اند
        prof_courses = [code for code, course in self.system.courses.items() if course.get("professor_id") == self.current_user]
        prof_students = {}
        
        for sid, student in self.system.students.items():
            for course_code in student["courses"]:
                if course_code in prof_courses:
                    prof_students[sid] = student
                    break
        
        if not prof_students: 
            tk.Label(self.content, text=" هیچ دانشجویی در دروس شما ثبت‌نام نکرده است.", font=self.fonts['normal'], fg='gray').pack(expand=True)
            return
        
        table_frame = tk.Frame(self.content, bg=self.colors['bg'])
        table_frame.pack(fill='both', expand=True, padx=20, pady=10)
        
        tree = ttk.Treeview(table_frame, columns=('شماره', 'نام', 'رشته', 'سال ورود', 'واحدها'), 
                           show='headings', height=10)
        
        columns = [('شماره', 100), ('نام', 150), ('رشته', 120), ('سال ورود', 80), ('واحدها', 70)]
        
        for col, width in columns:
            tree.heading(col, text=col)
            tree.column(col, width=width, anchor='center')
        
        scrollbar = ttk.Scrollbar(table_frame, orient='vertical', command=tree.yview)
        tree.configure(yscrollcommand=scrollbar.set)
        
        tree.pack(side='left', fill='both', expand=True)
        scrollbar.pack(side='right', fill='y')
        
        for sid, student in prof_students.items():
            tree.insert('', 'end', values=(
                sid, student["name"], student["major"], 
                student["entry_year"], student["total_units"]
            ))

    def show_admin_panel(self):
        self._create_user_panel("admin", self.colors['danger'], [
            (" تعریف درس جدید", self.show_add_course),
            (" مدیریت دروس", self.show_manage_courses),
            (" دروس انتظار تأیید", self.show_pending_courses),
            (" لیست دانشجویان", self.show_students_list),
            (" خروج", self.logout)
        ])

    def show_add_course(self):
        self._clear_admin_content()
        tk.Label(self.admin_content, text=" تعریف درس جدید", font=self.fonts['header'], bg=self.colors['bg']).pack(pady=15)
        entries = self._create_form([
            (" کد درس *", "course_code"), (" نام درس *", "course_name"), (" نام استاد *", "professor"),
            (" شماره استاد", "professor_id"), (" تعداد واحد *", "units"), (" ظرفیت *", "capacity"),
            (" زمان برگزاری *", "schedule"), (" دانشکده *", "department"), (" کلاس", "classroom"), (" تاریخ امتحان", "exam_date")
        ], self.admin_content)
        
        def add_course():
            data = {k: e.get().strip() for k, e in entries.items()}
            try: 
                if data["units"]: int(data["units"])
                if data["capacity"]: int(data["capacity"])
            except: return messagebox.showerror("خطا", " واحد و ظرفیت باید عدد باشند!")
            success, msg = self.system.add_course(data)
            messagebox.showinfo(" موفق", msg) if success else messagebox.showerror(" خطا", msg)
            if success: [e.delete(0, tk.END) for e in entries.values()]

        self._create_buttons(" ذخیره درس", add_course, self.colors['success'], self.admin_content)

    def show_manage_courses(self):
        self._clear_admin_content()
        tk.Label(self.admin_content, text=" مدیریت دروس سیستم", font=self.fonts['header'], bg=self.colors['bg']).pack(pady=15)
        if not self.system.courses: 
            tk.Label(self.admin_content, text=" هیچ درسی در سیستم تعریف نشده است.", font=self.fonts['normal'], fg='red').pack(expand=True)
            return
        
        search_frame = tk.Frame(self.admin_content, bg=self.colors['bg'])
        search_frame.pack(fill='x', padx=20, pady=10)
        
        tk.Label(search_frame, text=" جستجو:", font=self.fonts['normal'], bg=self.colors['bg']).pack(side='left')
        search_var = tk.StringVar()
        search_entry = tk.Entry(search_frame, textvariable=search_var, font=self.fonts['normal'], width=35)
        search_entry.pack(side='left', padx=10)
        
        table_frame = tk.Frame(self.admin_content, bg=self.colors['bg'])
        table_frame.pack(fill='both', expand=True, padx=20, pady=10)
        
        tree = ttk.Treeview(table_frame, columns=('کد', 'نام درس', 'استاد', 'دانشکده', 'واحد', 'دانشجویان', 'ظرفیت', 'زمان', 'وضعیت'), 
                           show='headings', height=10)
        
        columns = [('کد', 70), ('نام درس', 180), ('استاد', 120), ('دانشکده', 100), 
                  ('واحد', 60), ('دانشجویان', 80), ('ظرفیت', 70), ('زمان', 150), ('وضعیت', 100)]
        
        for col, width in columns:
            tree.heading(col, text=col)
            tree.column(col, width=width, anchor='center')
        
        scrollbar = ttk.Scrollbar(table_frame, orient='vertical', command=tree.yview)
        tree.configure(yscrollcommand=scrollbar.set)
        
        tree.pack(side='left', fill='both', expand=True)
        scrollbar.pack(side='right', fill='y')
        
        def update_table():
            tree.delete(*tree.get_children())
            query = search_var.get().lower()
            for code, course in self.system.courses.items():
                if query and query not in course["name"].lower() and query not in code:
                    continue
                
                status_text = "تأیید شده" if course.get("status") == "approved" else "در انتظار تأیید" if course.get("status") == "pending" else "رد شده"
                tree.insert('', 'end', values=(
                    code, course["name"], course["professor"], course["department"], 
                    course["units"], course["current_students"], course["capacity"], 
                    course["schedule"], status_text
                ))
        
        def edit_course():
            if not tree.selection(): 
                return messagebox.showwarning("هشدار", " لطفا یک درس را انتخاب کنید!")
            code = tree.item(tree.selection()[0])["values"][0]
            self.show_edit_course(code)
        
        def delete_course():
            if not tree.selection(): 
                return messagebox.showwarning("هشدار", " لطفا یک درس را انتخاب کنید!")
            code = tree.item(tree.selection()[0])["values"][0]
            if messagebox.askyesno(" حذف درس", f"آیا از حذف درس '{self.system.courses[code]['name']}' اطمینان دارید؟\n\n⚠️ این عمل باعث حذف این درس از کارنامه تمام دانشجویان خواهد شد!"):
                success, msg = self.system.delete_course(code)
                messagebox.showinfo(" موفق", msg) if success else messagebox.showerror(" خطا", msg)
                update_table()
        
        # فریم برای دکمه‌های عملیاتی
        button_frame = tk.Frame(self.admin_content, bg=self.colors['bg'])
        button_frame.pack(fill='x', padx=20, pady=10)
        
        tk.Button(button_frame, text=" ویرایش درس انتخاب شده", font=self.fonts['normal'], 
                 bg=self.colors['warning'], fg='white', padx=15, pady=8, command=edit_course).pack(side='left', padx=5)
        tk.Button(button_frame, text=" حذف درس انتخاب شده", font=self.fonts['normal'], 
                 bg=self.colors['danger'], fg='white', padx=15, pady=8, command=delete_course).pack(side='left', padx=5)
        
        def on_search(*args):
            update_table()
            
        search_var.trace_add('write', on_search)
        update_table()

    def show_pending_courses(self):
        """نمایش دروس در انتظار تأیید"""
        self._clear_admin_content()
        tk.Label(self.admin_content, text=" دروس در انتظار تأیید", font=self.fonts['header'], bg=self.colors['bg']).pack(pady=15)
        
        pending_courses = {code: course for code, course in self.system.courses.items() if course.get("status") == "pending"}
        
        if not pending_courses: 
            tk.Label(self.admin_content, text=" هیچ درسی در انتظار تأیید نیست.", font=self.fonts['normal'], fg='green').pack(expand=True)
            return
        
        table_frame = tk.Frame(self.admin_content, bg=self.colors['bg'])
        table_frame.pack(fill='both', expand=True, padx=20, pady=10)
        
        tree = ttk.Treeview(table_frame, columns=('کد', 'نام درس', 'استاد', 'دانشکده', 'واحد', 'ظرفیت', 'زمان'), 
                           show='headings', height=10)
        
        columns = [('کد', 70), ('نام درس', 180), ('استاد', 120), ('دانشکده', 100), 
                  ('واحد', 60), ('ظرفیت', 70), ('زمان', 150)]
        
        for col, width in columns:
            tree.heading(col, text=col)
            tree.column(col, width=width, anchor='center')
        
        scrollbar = ttk.Scrollbar(table_frame, orient='vertical', command=tree.yview)
        tree.configure(yscrollcommand=scrollbar.set)
        
        tree.pack(side='left', fill='both', expand=True)
        scrollbar.pack(side='right', fill='y')
        
        for code, course in pending_courses.items():
            tree.insert('', 'end', values=(
                code, course["name"], course["professor"], course["department"], 
                course["units"], course["capacity"], course["schedule"]
            ))
        
        def approve_course():
            if not tree.selection(): 
                return messagebox.showwarning("هشدار", " لطفا یک درس را انتخاب کنید!")
            code = tree.item(tree.selection()[0])["values"][0]
            if messagebox.askyesno(" تأیید درس", f"آیا از تأیید درس '{self.system.courses[code]['name']}' اطمینان دارید؟"):
                success, msg = self.system.approve_course(code)
                messagebox.showinfo(" موفق", msg) if success else messagebox.showerror(" خطا", msg)
                self.show_pending_courses()  # بازخوانی صفحه
        
        def reject_course():
            if not tree.selection(): 
                return messagebox.showwarning("هشدار", " لطفا یک درس را انتخاب کنید!")
            code = tree.item(tree.selection()[0])["values"][0]
            if messagebox.askyesno(" رد درس", f"آیا از رد درس '{self.system.courses[code]['name']}' اطمینان دارید؟"):
                success, msg = self.system.reject_course(code)
                messagebox.showinfo(" موفق", msg) if success else messagebox.showerror(" خطا", msg)
                self.show_pending_courses()  # بازخوانی صفحه
        
        # فریم برای دکمه‌های عملیاتی
        button_frame = tk.Frame(self.admin_content, bg=self.colors['bg'])
        button_frame.pack(fill='x', padx=20, pady=10)
        
        tk.Button(button_frame, text=" تأیید درس انتخاب شده", font=self.fonts['normal'], 
                 bg=self.colors['success'], fg='white', padx=15, pady=8, command=approve_course).pack(side='left', padx=5)
        tk.Button(button_frame, text=" رد درس انتخاب شده", font=self.fonts['normal'], 
                 bg=self.colors['danger'], fg='white', padx=15, pady=8, command=reject_course).pack(side='left', padx=5)

    def show_edit_course(self, course_code):
        """ویرایش اطلاعات درس"""
        self._clear_admin_content()
        
        if course_code not in self.system.courses:
            messagebox.showerror("خطا", "درس یافت نشد!")
            return self.show_manage_courses()
        
        course = self.system.courses[course_code]
        
        tk.Label(self.admin_content, text=f" ویرایش درس: {course['name']}", font=self.fonts['header'], bg=self.colors['bg']).pack(pady=15)
        
        entries = self._create_form([
            (" کد درس *", "course_code"), (" نام درس *", "course_name"), (" نام استاد *", "professor"),
            (" شماره استاد", "professor_id"), (" تعداد واحد *", "units"), (" ظرفیت *", "capacity"),
            (" زمان برگزاری *", "schedule"), (" دانشکده *", "department"), (" کلاس", "classroom"), (" تاریخ امتحان", "exam_date")
        ], self.admin_content)
        
        # پر کردن فیلدها با اطلاعات فعلی
        entries["course_code"].insert(0, course_code)
        entries["course_code"].config(state='readonly')
        entries["course_name"].insert(0, course["name"])
        entries["professor"].insert(0, course["professor"])
        entries["professor_id"].insert(0, course.get("professor_id", ""))
        entries["units"].insert(0, str(course["units"]))
        entries["capacity"].insert(0, str(course["capacity"]))
        entries["schedule"].insert(0, course["schedule"])
        entries["department"].insert(0, course["department"])
        entries["classroom"].insert(0, course.get("classroom", ""))
        entries["exam_date"].insert(0, course.get("exam_date", ""))
        
        def update_course():
            data = {k: e.get().strip() for k, e in entries.items()}
            try: 
                if data["units"]: int(data["units"])
                if data["capacity"]: int(data["capacity"])
            except: return messagebox.showerror("خطا", " واحد و ظرفیت باید عدد باشند!")
            
            success, msg = self.system.update_course(course_code, data)
            messagebox.showinfo(" موفق", msg) if success else messagebox.showerror(" خطا", msg)
            if success: 
                self.show_manage_courses()

        def cancel_edit():
            self.show_manage_courses()
        
        # فریم برای دکمه‌ها
        button_frame = tk.Frame(self.admin_content, bg='white')
        button_frame.pack(pady=25)
        
        tk.Button(button_frame, text=" ذخیره تغییرات", font=('B Nazanin', 14, 'bold'), 
                 bg=self.colors['success'], fg='white', padx=40, pady=12, command=update_course).pack(side='left', padx=15)
        tk.Button(button_frame, text=" انصراف", font=self.fonts['normal'], 
                 bg='#95a5a6', fg='white', padx=30, pady=10, command=cancel_edit).pack(side='left', padx=15)

    def show_students_list(self):
        self._clear_admin_content()
        tk.Label(self.admin_content, text=" لیست دانشجویان سیستم", font=self.fonts['header'], bg=self.colors['bg']).pack(pady=15)
        if not self.system.students: 
            tk.Label(self.admin_content, text=" هیچ دانشجویی در سیستم ثبت‌نام نکرده است.", font=self.fonts['normal'], fg='gray').pack(expand=True)
            return
        
        search_frame = tk.Frame(self.admin_content, bg=self.colors['bg'])
        search_frame.pack(fill='x', padx=20, pady=10)
        
        tk.Label(search_frame, text=" جستجو:", font=self.fonts['normal'], bg=self.colors['bg']).pack(side='left')
        search_var = tk.StringVar()
        search_entry = tk.Entry(search_frame, textvariable=search_var, font=self.fonts['normal'], width=35)
        search_entry.pack(side='left', padx=10)
        
        table_frame = tk.Frame(self.admin_content, bg=self.colors['bg'])
        table_frame.pack(fill='both', expand=True, padx=20, pady=10)
        
        tree = ttk.Treeview(table_frame, columns=('شماره', 'نام', 'رشته', 'سال ورود', 'ایمیل', 'واحدها', 'تعداد دروس'), 
                           show='headings', height=10)
        
        columns = [('شماره', 100), ('نام', 150), ('رشته', 120), ('سال ورود', 80), 
                  ('ایمیل', 150), ('واحدها', 70), ('تعداد دروس', 90)]
        
        for col, width in columns:
            tree.heading(col, text=col)
            tree.column(col, width=width, anchor='center')
        
        scrollbar = ttk.Scrollbar(table_frame, orient='vertical', command=tree.yview)
        tree.configure(yscrollcommand=scrollbar.set)
        
        tree.pack(side='left', fill='both', expand=True)
        scrollbar.pack(side='right', fill='y')
        
        def update_table():
            tree.delete(*tree.get_children())
            query = search_var.get().lower()
            for sid, student in self.system.students.items():
                if query and query not in student["name"].lower() and query not in sid:
                    continue
                tree.insert('', 'end', values=(
                    sid, student["name"], student["major"], student["entry_year"], 
                    student.get("email", ""), student["total_units"], len(student["courses"])
                ))
        
        def on_search(*args):
            update_table()
            
        search_var.trace_add('write', on_search)
        update_table()

    # متدهای کمکی
    def _create_header(self, text, color):
        header = tk.Frame(self.root, bg=color, height=120)
        header.pack(fill='x'); header.pack_propagate(False)
        tk.Label(header, text=text, font=self.fonts['title'], fg='white', bg=color).pack(pady=35)

    def _create_form(self, fields, parent=None):
        parent = parent or self.root
        form = tk.Frame(parent, bg='white', relief='raised', bd=3, padx=50, pady=40)
        form.pack(fill='both', expand=True, padx=80, pady=15)
        entries = {}
        for label, key, *pw in fields:
            row = tk.Frame(form, bg='white'); row.pack(fill='x', pady=10)
            tk.Label(row, text=label, font=self.fonts['normal'], bg='white', width=18, anchor='e').pack(side='left')
            e = tk.Entry(row, font=self.fonts['normal'], width=30, show='*' if pw else ''); e.pack(side='right', padx=10)
            entries[key] = e
        return entries

    def _create_buttons(self, text, command, color, parent=None):
        parent = parent or self.root
        btns = tk.Frame(parent, bg='white'); btns.pack(pady=25)
        tk.Button(btns, text=text, font=('B Nazanin', 14, 'bold'), bg=color, fg='white', padx=40, pady=12, command=command).pack(side='left', padx=15)
        tk.Button(btns, text=" بازگشت", font=self.fonts['normal'], bg='#95a5a6', fg='white', padx=30, pady=10, command=self.show_welcome).pack(side='left', padx=15)

    def _create_user_panel(self, user_type, color, menu_buttons):
        self.clear()
        user_data = getattr(self.system, f"{user_type}s")[self.current_user]
        header = tk.Frame(self.root, bg=color, height=140); header.pack(fill='x'); header.pack_propagate(False)
        tk.Label(header, text=f" خوش آمدید، {user_data['name']}", font=self.fonts['title'], fg='white', bg=color).pack(pady=25)
        if user_type == "student": 
            tk.Label(header, text=f" رشته: {user_data['major']} | سال ورود: {user_data['entry_year']} | مجموع واحد: {user_data['total_units']}", 
                    font=self.fonts['normal'], fg='white', bg=color).pack()
        elif user_type == "professor": 
            tk.Label(header, text=f"🎓 دانشکده: {user_data['department']}", font=self.fonts['normal'], fg='white', bg=color).pack()
        
        menu = tk.Frame(self.root, bg=self.colors['primary'], height=60); menu.pack(fill='x'); menu.pack_propagate(False)
        for text, cmd in menu_buttons:
            btn_color = self.colors['danger'] if text == " خروج" else self.colors['primary']
            tk.Button(menu, text=text, font=self.fonts['subheader'], bg=btn_color, fg='white', bd=0, padx=30, pady=15, command=cmd).pack(side='left', padx=15)
        
        setattr(self, "content" if user_type != "admin" else "admin_content", tk.Frame(self.root, bg=self.colors['bg']))
        getattr(self, "content" if user_type != "admin" else "admin_content").pack(fill='both', expand=True, padx=40, pady=20)
        
        # نمایش صفحه پیش‌فرض بر اساس نوع کاربر
        if user_type == "student":
            self.show_course_selection()
        elif user_type == "professor":
            self.show_professor_courses()
        else:
            self.show_manage_courses()

    def _clear_content(self): 
        if hasattr(self, 'content'):
            [w.destroy() for w in self.content.winfo_children()]

    def _clear_admin_content(self): 
        if hasattr(self, 'admin_content'):
            [w.destroy() for w in self.admin_content.winfo_children()]

    def logout(self):
        if messagebox.askyesno(" خروج", "آیا مایل به خروج از حساب کاربری هستید؟"):
            self.current_user = self.current_type = None
            self.show_welcome()

if __name__ == "__main__":
    root = tk.Tk()
    app = UniversityApp(root)
    root.mainloop()
    