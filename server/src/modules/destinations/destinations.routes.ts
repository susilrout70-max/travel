import { Router } from 'express';
import { DestinationsController } from './destinations.controller';
import { authenticate, optionalAuth } from '../../middleware/auth';

const router = Router();

router.get('/', DestinationsController.getAll);
router.get('/wishlist', authenticate, DestinationsController.getUserWishlist);
router.post('/wishlist/toggle', authenticate, DestinationsController.toggleWishlist);
router.get('/:id/local-picks', DestinationsController.getLocalPicks);
router.post('/:id/local-picks/:pickId/upvote', DestinationsController.upvoteLocalPick);
router.get('/:id/seasonal-insight', DestinationsController.getSeasonalInsights);
router.get('/:id/emergency-directory', DestinationsController.getEmergencyDirectory);
router.get('/:slug', optionalAuth, DestinationsController.getBySlug);

export default router;
