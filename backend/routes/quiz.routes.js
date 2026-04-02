const express = require('express');
const {
  createQuizQuestion,
  getLessonQuizzes,
  updateQuizQuestion,
  deleteQuizQuestion,
  getFinalQuiz,
  submitFinalQuiz,
  getQuizStatus,
  grantExtraAttempt
} = require('../controllers/quiz.controller');
const { protect } = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

const router = express.Router();

// Student/Player routes
router.get('/lesson/:lessonId', getLessonQuizzes);
router.get('/course/:courseId', protect, getFinalQuiz);
router.get('/status/:courseId', protect, getQuizStatus);
router.post('/submit', protect, submitFinalQuiz);

// Management routes (Instructor/Admin)
router.post('/', protect, authorize('admin', 'instructor'), createQuizQuestion);
router.put('/:id', protect, authorize('admin', 'instructor'), updateQuizQuestion);
router.delete('/:id', protect, authorize('admin', 'instructor'), deleteQuizQuestion);
router.post('/grant-attempt', protect, authorize('admin', 'instructor'), grantExtraAttempt);

module.exports = router;
