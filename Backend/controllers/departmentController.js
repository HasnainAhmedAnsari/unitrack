const sql = require("mssql");
const db = require("../config/db");

// Get all departments with instructor and course counts
exports.getAllDepartments = async (req, res) => {
  try {
    const pool = await db;
    const result = await pool.request().query(`
      SELECT 
        d.department_id,
        d.department_name,
        d.building,
        COUNT(DISTINCT i.instructor_id) AS instructor_count,
        COUNT(DISTINCT c.course_id) AS course_count,
        COUNT(DISTINCT e.student_id) AS student_count
      FROM Department d
      LEFT JOIN Instructor i ON d.department_id = i.department_id
      LEFT JOIN Course c ON d.department_id = c.department_id
      LEFT JOIN Enrollments e ON c.course_id = e.course_id
      GROUP BY d.department_id, d.department_name, d.building
      ORDER BY d.department_id
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send("Error fetching departments");
  }
};


// Create department
exports.createDepartment = async (req, res) => {
  const { department_name, building } = req.body;
  if (!department_name || !building)
    return res.status(400).send("All fields required");
  try {
    const pool = await db;
    await pool.request()
      .input("department_name", sql.VarChar, department_name)
      .input("building", sql.VarChar, building)
      .query("INSERT INTO Department (department_name, building) VALUES (@department_name, @building)");
    res.send("Department created successfully");
  } catch (err) {
    res.status(500).send("Error creating department");
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  const { department_name, building } = req.body;
  try {
    const pool = await db;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .input("department_name", sql.VarChar, department_name)
      .input("building", sql.VarChar, building)
      .query("UPDATE Department SET department_name=@department_name, building=@building WHERE department_id=@id");
    res.send("Department updated successfully");
  } catch (err) {
    res.status(500).send("Error updating department");
  }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
  try {
    const pool = await db;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM Department WHERE department_id=@id");
    res.send("Department deleted successfully");
  } catch (err) {
    res.status(500).send("Error deleting department");
  }
};