const express = require('express');
const { updateProgress, getCourseProgress } = require('../controllers/progress.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/update', protect, updateProgress);
router.get('/course/:courseId', protect, getCourseProgress);

module.exports = router;
