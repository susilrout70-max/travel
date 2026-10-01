import { Router } from 'express';
import { LocationSharingController } from './location-sharing.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.post('/', authenticate, LocationSharingController.createShare);
router.get('/my-shares', authenticate, LocationSharingController.getUserShares);
router.post('/:shareId/pins', authenticate, LocationSharingController.addPin);
router.post('/:shareId/stop', authenticate, LocationSharingController.stopShare);
router.get('/view/:token', LocationSharingController.getByToken);

export default router;
