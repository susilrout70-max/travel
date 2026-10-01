import { Router } from 'express';
import { BookingsController } from './bookings.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.post('/hotels', authenticate, BookingsController.createHotelBooking);
router.post('/vehicles', authenticate, BookingsController.createVehicleBooking);
router.post('/confirm-payment', authenticate, BookingsController.confirmPayment);
router.get('/my-bookings', authenticate, BookingsController.getUserBookings);
router.post('/cancel', authenticate, BookingsController.cancelBooking);
router.post('/quote', BookingsController.getBookingQuote);
router.post('/reviews', authenticate, BookingsController.createReview);

export default router;
