import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { RegisterSchema, LoginSchema } from '../types';
import rateLimit from 'express-rate-limit';
import { requireAdmin } from '../middlewares/auth';

const router = Router();
const authController = new AuthController();


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: {
    success: false,
    error: 'Too many auth attempts',
    message: 'Please try again after 15 minutes'
  }
});

router.post('/register', authLimiter, validate(RegisterSchema), authController.register.bind(authController));
router.post('/login', authLimiter, validate(LoginSchema), authController.login.bind(authController));

router.get('/me', authMiddleware, authController.getProfile.bind(authController));
router.put('/me', authMiddleware, authController.updateProfile.bind(authController));

// Admin only routes
router.get('/users', authMiddleware, requireAdmin, authController.getAllUsers.bind(authController));
router.put('/users/role', authMiddleware, requireAdmin, authController.updateUserRole.bind(authController));
router.delete('/users/:id', authMiddleware, requireAdmin, authController.deleteUser.bind(authController));

export default router;