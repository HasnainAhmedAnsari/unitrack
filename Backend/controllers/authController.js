const sql = require('mssql');
const db = require('../config/db');

const adminCredentials = {
  username: 'admin',
  password: '1234',
};

exports.loginUser = async (req, res) => {
  const { id, password, role } = req.body;

  // Admin check (handled in frontend, but verified here)
  if (role === 'admin') {
    if (id === adminCredentials.username && password === adminCredentials.password) {
      return res.json({ success: true, role: 'admin' });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }
  }

  try {
    const pool = await db;
    const result = await pool
      .request()
      .input('id', sql.VarChar, id)
      .query('SELECT * FROM Users WHERE user_id = @id');

    const user = result.recordset[0];

    if (!user || user.role !== role) {
      return res.status(404).json({ message: 'User not found or role mismatch' });
    }

    // Plain text password comparison
    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    return res.json({
      success: true,
      userId: user.user_id,
      role: user.role,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
