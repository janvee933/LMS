const express = require('express');
const {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  getInstructorStats,
} = require('../controllers/course.controller');
const { protect } = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/instructor-stats', protect, authorize('instructor'), getInstructorStats);

router
  .route('/')
  .get(getCourses)
  .post(protect, authorize('admin', 'instructor'), upload.single('thumbnail'), createCourse);

router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('admin', 'instructor'), upload.single('thumbnail'), updateCourse)
  .delete(protect, authorize('admin', 'instructor'), deleteCourse);

module.exports = router;
