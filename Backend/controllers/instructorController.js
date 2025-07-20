const sql = require('mssql');
const db = require('../config/db');

// ─────────────────────────────────────────────
//  CRUD ENDPOINTS (Admin)
// ─────────────────────────────────────────────

// Get all instructors
exports.getAllInstructors = async (req, res) => {
    try {
        const pool = await db;
        const result = await pool.request().query(`
            SELECT 
                i.instructor_id,
                i.instructor_name,
                i.email,
                i.salary,
                i.faculty_type,
                d.department_name,
                i.department_id,
                COUNT(t.course_id) AS courses_teaches
            FROM Instructor i
            LEFT JOIN Department d ON i.department_id = d.department_id
            LEFT JOIN Teaches t ON i.instructor_id = t.instructor_id
            GROUP BY i.instructor_id, i.instructor_name, i.email, i.salary, i.faculty_type, d.department_name, i.department_id
            ORDER BY i.instructor_id
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching instructors');
    }
};

// Get instructor by ID
exports.getInstructorById = async (req, res) => {
    try {
        const pool = await db;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM Instructor WHERE instructor_id = @id');
        if (result.recordset.length === 0) return res.status(404).send('Instructor not found');
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).send('Error fetching instructor');
    }
};

// Create instructor
exports.createInstructor = async (req, res) => {
    const { instructor_name, email, department_id, salary, faculty_type } = req.body;
    if (!instructor_name || !email || !department_id || !salary || !faculty_type)
        return res.status(400).send('All fields required');
    try {
        const pool = await db;
        await pool.request()
            .input('instructor_name', sql.VarChar, instructor_name)
            .input('email', sql.VarChar, email)
            .input('department_id', sql.Int, department_id)
            .input('salary', sql.Decimal(10,2), salary)
            .input('faculty_type', sql.VarChar, faculty_type)
            .query('INSERT INTO Instructor (instructor_name, email, department_id, salary, faculty_type) VALUES (@instructor_name, @email, @department_id, @salary, @faculty_type)');
        res.send('Instructor created successfully');
    } catch (err) {
        res.status(500).send('Error creating instructor');
    }
};

// Update instructor
exports.updateInstructor = async (req, res) => {
    const { instructor_name, email, department_id, salary, faculty_type } = req.body;
    try {
        const pool = await db;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('instructor_name', sql.VarChar, instructor_name)
            .input('email', sql.VarChar, email)
            .input('department_id', sql.Int, department_id)
            .input('salary', sql.Decimal(10,2), salary)
            .input('faculty_type', sql.VarChar, faculty_type)
            .query('UPDATE Instructor SET instructor_name=@instructor_name, email=@email, department_id=@department_id, salary=@salary, faculty_type=@faculty_type WHERE instructor_id=@id');
        res.send('Instructor updated successfully');
    } catch (err) {
        res.status(500).send('Error updating instructor');
    }
};

// Delete instructor
exports.deleteInstructor = async (req, res) => {
    try {
        const pool = await db;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Instructor WHERE instructor_id=@id');
        res.send('Instructor deleted successfully');
    } catch (err) {
        res.status(500).send('Error deleting instructor');
    }
};

// ─────────────────────────────────────────────
//  INSTRUCTOR DASHBOARD ENDPOINTS
// ─────────────────────────────────────────────

// Get instructor profile/info (with department)
exports.getInstructorInfo = async (req, res) => {
    const { instructor_id } = req.params;
    const numericInstructorId = instructor_id.startsWith('I') ? parseInt(instructor_id.replace('I', '')) : parseInt(instructor_id);
    try {
        const pool = await db;
        const result = await pool.request()
            .input('instructor_id', sql.Int, numericInstructorId)
            .query(`
                SELECT i.instructor_id, i.instructor_name, i.department_id, d.department_name
                FROM Instructor i
                JOIN Department d ON i.department_id = d.department_id
                WHERE i.instructor_id = @instructor_id
            `);
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Instructor not found" });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Get instructor's assigned courses (with department)
exports.getInstructorCourses = async (req, res) => {
    const { instructorId } = req.params;
    const numericId = instructorId.startsWith('I') ? parseInt(instructorId.replace('I', '')) : parseInt(instructorId);
    try {
        const pool = await db;
        const result = await pool.request()
            .input('instructorId', sql.Int, numericId)
            .query(`
                SELECT 
                    c.course_id, 
                    c.title, 
                    c.code, 
                    c.availability, 
                    COUNT(e.student_id) AS total_students,
                    c.department_id,
                    d.department_name
                FROM dbo.Teaches t
                JOIN dbo.Course c ON t.course_id = c.course_id
                JOIN dbo.Department d ON c.department_id = d.department_id
                LEFT JOIN dbo.Enrollments e ON t.course_id = e.course_id
                WHERE t.instructor_id = @instructorId
                GROUP BY c.course_id, c.title, c.code, c.availability, c.department_id, d.department_name
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving instructor courses');
    }
};

// Get students with grades for a specific course
exports.getStudentsWithGrades = async (req, res) => {
    const { course_id } = req.params;
    try {
        const pool = await db;
        const result = await pool.request()
            .input('course_id', sql.Int, course_id)
            .query(`
                SELECT 
                  s.student_id, 
                  s.student_name, 
                  g.assignment1, g.assignment2, g.quiz1, g.quiz2, g.mid, g.final, 
                  g.total_marks,
                  g.grade
                FROM Enrollments e
                JOIN Student s ON e.student_id = s.student_id
                LEFT JOIN Grades g ON e.student_id = g.student_id AND e.course_id = g.course_id
                WHERE e.course_id = @course_id;
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Assign grades to a student in a course using stored procedure
exports.assignGrades = async (req, res) => {
    const { instructorId } = req.params;
    const {
        course_id,
        student_id,
        assignment1,
        assignment2,
        quiz1,
        quiz2,
        mid,
        final
    } = req.body;

    try {
        const pool = await db;
        await pool.request()
            .input('student_id', sql.Int, student_id)
            .input('course_id', sql.Int, course_id)
            .input('assignment1', sql.Int, assignment1)
            .input('assignment2', sql.Int, assignment2)
            .input('quiz1', sql.Int, quiz1)
            .input('quiz2', sql.Int, quiz2)
            .input('mid', sql.Int, mid)
            .input('final', sql.Int, final)
            .execute('sp_AssignGrades');
        res.send('Grades assigned successfully.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error assigning grades.');
    }
};