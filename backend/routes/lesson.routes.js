const express = require('express');
const {
  createLesson,
  getLessons,
  updateLesson,
  deleteLesson,
} = require('../controllers/lesson.controller');
const { protect } = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

const router = express.Router();
const upload = require('../middleware/upload.middleware');

router.post('/', protect, authorize('admin', 'instructor'), upload.fields([{ name: 'content_file', maxCount: 1 }, { name: 'video_file', maxCount: 1 }]), createLesson);
router.get('/course/:courseId', getLessons);
router.put('/:id', protect, authorize('admin', 'instructor'), upload.fields([{ name: 'content_file', maxCount: 1 }, { name: 'video_file', maxCount: 1 }]), updateLesson);
router.delete('/:id', protect, authorize('admin', 'instructor'), deleteLesson);

module.exports = router;
