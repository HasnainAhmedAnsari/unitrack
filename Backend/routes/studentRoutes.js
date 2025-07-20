const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// For Student Dashboard
router.get('/grades/:id', studentController.getMyGrades);
router.get('/enrolled/:id', studentController.getMyCourses);
router.get('/courses', studentController.getAllCourses);
router.post('/enroll/:student_id/:course_id', studentController.enrollInCourse);
router.get('/info/:id', studentController.getStudentInfo);

// Admin CRUD (if needed)
router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudentById);
router.post('/', studentController.createStudent);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

module.exports = router;