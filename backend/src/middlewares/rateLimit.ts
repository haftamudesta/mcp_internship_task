import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

export const apiRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Please try again later'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, 
  skipSuccessfulRequests: false, 
  skipFailedRequests: false, 
  keyGenerator: (req: Request): string => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: `Please try again after ${Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 60000)} minutes`
    });
  }
});

export const reservationRateLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 10, 
  message: {
    success: false,
    error: 'Too many reservation attempts',
    message: 'Please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, 
  message: {
    success: false,
    error: 'Too many login attempts',
    message: 'Please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true 
});