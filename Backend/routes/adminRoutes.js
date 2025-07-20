const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Assign instructor to course
router.post('/assign-instructor', adminController.assignInstructor);

// Toggle course availability
router.put('/courses/:courseId/toggle-availability', adminController.toggleCourseAvailability);

// View all enrollments
router.get('/enrollments', adminController.getAllEnrollments);

module.exports = router;