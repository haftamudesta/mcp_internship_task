import { Router } from 'express';
import { ReservationController } from '../controllers/ReservationController';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { CreateReservationSchema, CheckoutSchema } from '../types';

const router = Router();
const reservationController = new ReservationController();

router.use(authMiddleware);

router.post('/', validate(CreateReservationSchema), reservationController.createReservation.bind(reservationController));
router.post('/checkout', validate(CheckoutSchema), reservationController.checkout.bind(reservationController));
router.get('/active', reservationController.getUserReservations.bind(reservationController));
router.delete('/:id', reservationController.cancelReservation.bind(reservationController));

export default router;