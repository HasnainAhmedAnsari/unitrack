const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.get('/', courseController.getAllCourses);
router.post('/', courseController.createCourse);
router.put('/:id', courseController.updateCourse);
router.put('/:id/availability', courseController.updateCourseAvailability);
router.delete('/:id', courseController.deleteCourse);

module.exports = router;