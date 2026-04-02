const express = require('express');
const router = express.Router();
const { submitRating, getCourseRating, getUserRating } = require('../controllers/rating.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, submitRating);
router.get('/course/:courseId', getCourseRating);
router.get('/user/:courseId', protect, getUserRating);

module.exports = router;
