const rateLimit = require('express-rate-limit');

/**
 * Global API Limiter
 * Standard limit for general API requests to prevent basic script abuse.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Increased to 5000 for development stability
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

/**
 * Authentication Limiter
 * Stricter limit for login and signup to prevent brute-force attacks.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased to 100 for dev testing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes',
  },
});

/**
 * Certificate Limiter
 * Moderate limit to prevent spamming resource-heavy certificate generation.
 */
const certificateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Certificate generation limit reached, please try again later',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  certificateLimiter,
};
