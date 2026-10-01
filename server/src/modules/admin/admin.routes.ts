import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// Protect all admin routes with authentication & ADMIN role requirement
router.use(authenticate);
router.use(requireRole('ADMIN'));

// Platform Statistics
router.get('/stats', AdminController.getStats);

// Bookings Management
router.get('/bookings', AdminController.getBookings);
router.patch('/bookings/:type/:id/status', AdminController.updateBookingStatus);
router.delete('/bookings/:type/:id', AdminController.deleteBooking);

// User Management
router.get('/users', AdminController.getUsers);
router.post('/users', AdminController.createUser);
router.get('/users/:id', AdminController.getUserDetails);
router.patch('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);
router.post('/users/:id/revoke-sessions', AdminController.revokeUserSessions);

// Logins & Active Sessions Management
router.get('/sessions', AdminController.getSessions);
router.delete('/sessions/:id', AdminController.revokeSession);

export default router;
