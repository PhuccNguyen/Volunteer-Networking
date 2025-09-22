// Rate limiting middleware for enhanced security
import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for auth
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Increase delay between requests
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Password change rate limiter
export const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit password changes to 3 per hour
  message: {
    error: 'Too many password change attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Email/Mobile update rate limiter
export const contactUpdateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit contact updates to 5 per hour
  message: {
    error: 'Too many contact update attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});