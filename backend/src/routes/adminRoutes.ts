// Admin routes
import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware } from '../middlewares';
import { requireAdminOrOwner } from '../middlewares/auth';

const router = Router();
const adminController = new AdminController();

router.use(authMiddleware);

router.get('/reservations', adminController.getAllReservations.bind(adminController));
router.get('/reservations/stats', adminController.getReservationStats.bind(adminController));
router.delete('/reservations/:id', adminController.cancelReservation.bind(adminController));
router.get('/analytics/daily', requireAdminOrOwner, adminController.getDailyAnalytics.bind(adminController))

export default router;