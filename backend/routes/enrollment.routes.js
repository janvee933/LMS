const express = require('express');
const { enrollCourse, getMyEnrollments, assignCourse, getAllEnrollmentsAdmin, getInstructorEnrollments, getCourseStudents } = require('../controllers/enrollment.controller');
const { protect } = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

const router = express.Router();

router.post('/enroll', protect, enrollCourse);
router.post('/assign', protect, authorize('admin', 'instructor'), assignCourse);
router.get('/my-enrollments', protect, getMyEnrollments);
router.get('/admin/all', protect, authorize('admin'), getAllEnrollmentsAdmin);
router.get('/instructor/all', protect, authorize('instructor'), getInstructorEnrollments);
router.get('/course/:courseId/students', protect, authorize('admin', 'instructor'), getCourseStudents);

module.exports = router;
