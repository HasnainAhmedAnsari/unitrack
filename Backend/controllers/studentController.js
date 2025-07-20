const sql = require('mssql');
const db = require('../config/db');

// ─────────────────────────────────────────────
//  CRUD ENDPOINTS (Admin)
// ─────────────────────────────────────────────

// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const pool = await db;
        const result = await pool.request().query(`
            SELECT 
                s.student_id,
                s.student_name,
                s.email,
                s.dob,
                d.department_name,
                s.department_id,
                COUNT(e.course_id) AS courses_enrolled
            FROM Student s
            LEFT JOIN Department d ON s.department_id = d.department_id
            LEFT JOIN Enrollments e ON s.student_id = e.student_id
            GROUP BY s.student_id, s.student_name, s.email, s.dob, d.department_name, s.department_id
            ORDER BY s.student_id
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send('Error fetching students');
    }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
    try {
        const pool = await db;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM Student WHERE student_id = @id');
        if (result.recordset.length === 0) return res.status(404).send('Student not found');
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).send('Error fetching student');
    }
};

// Create student
exports.createStudent = async (req, res) => {
    const { student_name, email, dob, department_id } = req.body;
    if (!student_name || !email || !dob || !department_id) return res.status(400).send('All fields required');
    try {
        const pool = await db;
        await pool.request()
            .input('student_name', sql.VarChar, student_name)
            .input('email', sql.VarChar, email)
            .input('dob', sql.Date, dob)
            .input('department_id', sql.Int, department_id)
            .query('INSERT INTO Student (student_name, email, dob, department_id) VALUES (@student_name, @email, @dob, @department_id)');
        res.send('Student created successfully');
    } catch (err) {
        res.status(500).send('Error creating student');
    }
};



// Update student
exports.updateStudent = async (req, res) => {
    const { student_name, email, dob, department_id } = req.body;
    try {
        const pool = await db;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('student_name', sql.VarChar, student_name)
            .input('email', sql.VarChar, email)
            .input('dob', sql.Date, dob)
            .input('department_id', sql.Int, department_id)
            .query('UPDATE Student SET student_name=@student_name, email=@email, dob=@dob, department_id=@department_id WHERE student_id=@id');
        res.send('Student updated successfully');
    } catch (err) {
        res.status(500).send('Error updating student');
    }
};


// Delete student
exports.deleteStudent = async (req, res) => {
    try {
        const pool = await db;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Student WHERE student_id=@id');
        res.send('Student deleted successfully');
    } catch (err) {
        res.status(500).send('Error deleting student');
    }
};

// ─────────────────────────────────────────────
//  STUDENT DASHBOARD ENDPOINTS
// ─────────────────────────────────────────────

// Get student profile/info (with department)
exports.getStudentInfo = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await db;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT s.*, d.department_name
                FROM Student s
                JOIN Department d ON s.department_id = d.department_id
                WHERE s.student_id = @id
            `);
        if (result.recordset.length === 0) return res.status(404).send('Student not found');
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).send('Error fetching student info');
    }
};

// Get all courses (for enrollment page)
exports.getAllCourses = async (req, res) => {
    try {
        const pool = await db;
        const result = await pool.request()
            .query(`SELECT c.*, d.department_name FROM Course c JOIN Department d ON c.department_id = d.department_id where c.availability = 'Open';`);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send('Error fetching courses');
    }
};

// Get my enrolled courses
exports.getMyCourses = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await db;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT 
                    c.*, 
                    d.department_name,
                    i.instructor_name,
                    e.status
                FROM Enrollments e
                JOIN Course c ON e.course_id = c.course_id
                JOIN Department d ON c.department_id = d.department_id
                LEFT JOIN Teaches t ON c.course_id = t.course_id
                LEFT JOIN Instructor i ON t.instructor_id = i.instructor_id
                WHERE e.student_id = @id
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send('Error fetching enrolled courses');
    }
};


// Get my grades (all courses)
exports.getMyGrades = async (req, res) => {
    const { id } = req.params; // student_id
    try {
        const pool = await db;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT g.*, c.title AS course_title, c.code AS course_code
                FROM Grades g
                JOIN Course c ON g.course_id = c.course_id
                WHERE g.student_id = @id
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send('Error fetching grades');
    }
};

// Enroll in a course
exports.enrollInCourse = async (req, res) => {
    const { student_id, course_id } = req.params;
    try {
        const pool = await db;
        // Prevent duplicate enrollment
        const check = await pool.request()
            .input('student_id', sql.Int, student_id)
            .input('course_id', sql.Int, course_id)
            .query('SELECT * FROM Enrollments WHERE student_id=@student_id AND course_id=@course_id');
        if (check.recordset.length > 0) return res.status(400).send('Already enrolled');
        await pool.request()
            .input('student_id', sql.Int, student_id)
            .input('course_id', sql.Int, course_id)
            .query('INSERT INTO Enrollments (student_id, course_id) VALUES (@student_id, @course_id)');
        res.send('Enrolled successfully');
    } catch (err) {
        res.status(500).send('Error enrolling in course');
    }
};