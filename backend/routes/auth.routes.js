const express = require('express');
const { signup, login, getMe, logout, listUsers, createUser, deleteUser } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');
const { signupRules, loginRules, validate } = require('../validators/auth.validator');

const router = express.Router();

router.post('/signup', authLimiter, signupRules, validate, signup);
router.post('/login', authLimiter, loginRules, validate, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), listUsers);
router.post('/users', protect, authorize('admin'), createUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
