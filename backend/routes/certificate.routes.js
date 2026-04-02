const express = require('express');
const { generateCertificate } = require('../controllers/certificate.controller');
const { certificateLimiter } = require('../middleware/rateLimit.middleware');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/:courseId', protect, certificateLimiter, generateCertificate);

module.exports = router;
