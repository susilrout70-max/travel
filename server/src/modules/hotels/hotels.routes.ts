import { Router } from 'express';
import { HotelsController } from './hotels.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/', HotelsController.search);
router.get('/:id', HotelsController.getById);
router.post('/:id/reviews', authenticate, HotelsController.addReview);

export default router;
