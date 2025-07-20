const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');

// CRUD (Admin)
router.get('/', instructorController.getAllInstructors);
router.get('/:id', instructorController.getInstructorById);
router.post('/', instructorController.createInstructor);
router.put('/:id', instructorController.updateInstructor);
router.delete('/:id', instructorController.deleteInstructor);

// Instructor Dashboard
router.get('/info/:instructor_id', instructorController.getInstructorInfo);
router.get('/:instructorId/courses', instructorController.getInstructorCourses);
router.get('/students-grades/:course_id', instructorController.getStudentsWithGrades);
router.post('/:instructorId/assign-grades', instructorController.assignGrades);

module.exports = router;