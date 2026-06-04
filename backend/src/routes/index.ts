import { Router } from 'express';
import productRoutes from './productRoutes';
import reservationRoutes from './reservationRoutes';
import authRoutes from './authRoutes';
import tokenRoutes from './tokenRoutes';
import healthRoutes from './healthRoutes';
import metricsRoutes from './metricsRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/metrics', metricsRoutes);
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/reservations', reservationRoutes);
router.use('/token', tokenRoutes);

// Legacy support (without version)
router.use('/api/auth', authRoutes);
router.use('/api/products', productRoutes);
router.use('/api/reservations', reservationRoutes);
router.use('/api/token', tokenRoutes);

export default router;