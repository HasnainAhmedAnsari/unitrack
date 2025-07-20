const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db'); // Connects DB

const app = express();
app.use(cors());
app.use(express.json());

const studentRoutes = require('./routes/studentRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const departmentRoutes = require('./routes/departmentRoutes');

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/departments', departmentRoutes);

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/test', (req, res) => {
  res.send('API is working');
});