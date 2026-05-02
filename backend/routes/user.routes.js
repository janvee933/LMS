const express = require('express');
const { 
  updateProfile, 
  changePassword, 
  updateSettings, 
  getLoginActivity 
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.put('/profile', protect, upload.single('profile_image'), updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/settings', protect, updateSettings);
router.get('/activity', protect, getLoginActivity);

module.exports = router;
