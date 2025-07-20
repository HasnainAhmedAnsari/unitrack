const sql = require('mssql');
const db = require('../config/db');

// Assign instructor to course (prevent duplicate)
exports.assignInstructor = async (req, res) => {
    const { instructor_id, course_id } = req.body;
    try {
        const pool = await db;
        // Remove any previous assignment for this course
        await pool.request()
            .input('course_id', sql.Int, course_id)
            .query('DELETE FROM Teaches WHERE course_id=@course_id');
        // Assign the new instructor
        await pool.request()
            .input('instructor_id', sql.Int, instructor_id)
            .input('course_id', sql.Int, course_id)
            .query('INSERT INTO Teaches (instructor_id, course_id) VALUES (@instructor_id, @course_id)');
        res.send('Instructor assigned successfully');
    } catch (err) {
        res.status(500).send('Error assigning instructor');
    }
};


// Toggle course availability (open/closed)
exports.toggleCourseAvailability = async (req, res) => {
    const { courseId } = req.params;
    try {
        const pool = await db;
        const result = await pool.request()
            .input('courseId', sql.Int, courseId)
            .query('SELECT availability FROM Course WHERE course_id = @courseId');

        if (result.recordset.length === 0) {
            return res.status(404).send('Course not found');
        }

        const currentStatus = result.recordset[0].availability;
        const newStatus = currentStatus === 'open' ? 'closed' : 'open';

        await pool.request()
            .input('newStatus', sql.VarChar, newStatus)
            .input('courseId', sql.Int, courseId)
            .query('UPDATE Course SET availability = @newStatus WHERE course_id = @courseId');

        res.send(`Course availability toggled to ${newStatus}`);
    } catch (err) {
        res.status(500).send('Error toggling course availability');
    }
};

// View all enrollments (history)
exports.getAllEnrollments = async (req, res) => {
    try {
        const pool = await db;
        const result = await pool.request().query(`
            SELECT 
                e.student_id,
                s.student_name,
                e.course_id,
                c.title AS course_title,
                ISNULL(i.instructor_name, NULL) AS instructor_name,
                e.enroll_date,
				e.status
            FROM Enrollments e
            JOIN Student s ON e.student_id = s.student_id
            JOIN Course c ON e.course_id = c.course_id
            LEFT JOIN Teaches t ON c.course_id = t.course_id
            LEFT JOIN Instructor i ON t.instructor_id = i.instructor_id
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send('Error fetching enrollments');
    }
};