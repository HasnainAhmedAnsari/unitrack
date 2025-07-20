const sql = require("mssql");
const db = require('../config/db');

// Get all courses with department, instructor, and student count
exports.getAllCourses = async (req, res) => {
    try {
        const pool = await db;
        const result = await pool.request().query(`
            SELECT 
                c.course_id,
                c.title,
                c.code,
                c.credits,
                c.availability,
                c.department_id,
                d.department_name,
                i.instructor_name,
                COUNT(e.student_id) AS students_enrolled
            FROM Course c
            LEFT JOIN Department d ON c.department_id = d.department_id
            LEFT JOIN Teaches t ON c.course_id = t.course_id
            LEFT JOIN Instructor i ON t.instructor_id = i.instructor_id
            LEFT JOIN Enrollments e ON c.course_id = e.course_id
            GROUP BY c.course_id, c.title, c.code, c.credits, c.availability, c.department_id, d.department_name, i.instructor_name
            ORDER BY c.course_id
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching courses');
    }
};

// Create a new course
exports.createCourse = async (req, res) => {
    const { title, code, credits, department_id } = req.body;
    const availability =
        req.body.availability?.charAt(0).toUpperCase() +
        req.body.availability?.slice(1).toLowerCase();
    if (!title || !code || !credits || !availability || !department_id)
        return res.status(400).send('All fields required');
    try {
        const pool = await db;
        await pool.request()
            .input('title', sql.VarChar, title)
            .input('code', sql.VarChar, code)
            .input('credits', sql.Int, credits)
            .input('availability', sql.VarChar, availability)
            .input('department_id', sql.Int, department_id)
            .query('INSERT INTO Course (title, code, credits, availability, department_id) VALUES (@title, @code, @credits, @availability, @department_id)');
        res.send('Course created successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating course');
    }
};

// Update a course (all fields)
exports.updateCourse = async (req, res) => {
const { title, code, credits, department_id } = req.body;
    const availability =
      req.body.availability?.charAt(0).toUpperCase() +
      req.body.availability?.slice(1).toLowerCase();
        try {
        const pool = await db;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('title', sql.VarChar, title)
            .input('code', sql.VarChar, code)
            .input('credits', sql.Int, credits)
            .input('availability', sql.VarChar, availability)
            .input('department_id', sql.Int, department_id)
            .query('UPDATE Course SET title=@title, code=@code, credits=@credits, availability=@availability, department_id=@department_id WHERE course_id=@id');
        res.send('Course updated successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating course');
    }
};

// Update only course availability and handle related logic
exports.updateCourseAvailability = async (req, res) => {
    const availability =
      req.body.availability?.charAt(0).toUpperCase() +
      req.body.availability?.slice(1).toLowerCase();
    
    const { id } = req.params;
    try {
        const pool = await db;
        // Update course availability
        await pool.request()
            .input('id', sql.Int, id)
            .input('availability', sql.VarChar, availability)
            .query('UPDATE Course SET availability=@availability WHERE course_id=@id');

        if (availability === "Closed") {
            // Remove assigned instructor(s)
            await pool.request()
                .input('course_id', sql.Int, id)
                .query('DELETE FROM Teaches WHERE course_id=@course_id');

            // Update enrollments' status based on grades
            await pool.request()
                .input('course_id', sql.Int, id)
                .query(`
                    UPDATE e
                    SET status = CASE 
                        WHEN g.grade IS NULL OR g.grade = 'F' THEN 'Failed'
                        ELSE 'Passed'
                    END
                    FROM Enrollments e
                    LEFT JOIN Grades g ON e.student_id = g.student_id AND e.course_id = g.course_id
                    WHERE e.course_id = @course_id
                `);
        }
        // If re-opening, do nothing to existing enrollments (as discussed)
        res.send('Course availability updated and related data adjusted.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating course availability');
    }
};

// Delete a course
exports.deleteCourse = async (req, res) => {
    try {
        const pool = await db;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Course WHERE course_id=@id');
        res.send('Course deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting course');
    }
};