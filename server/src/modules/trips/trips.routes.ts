import { Router } from 'express';
import { TripsController } from './trips.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, TripsController.getUserTrips);
router.post('/', authenticate, TripsController.createTrip);
router.get('/:id/dashboard', authenticate, TripsController.getTripDashboard);
router.patch('/:id/checklist/:itemId', authenticate, TripsController.toggleChecklistItem);
router.post('/:id/checklist', authenticate, TripsController.addChecklistItem);

export default router;
