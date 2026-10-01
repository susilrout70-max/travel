import { Router } from 'express';
import { RecommendationsController } from './recommendations.controller';
import { optionalAuth } from '../../middleware/auth';

const router = Router();

router.get('/', optionalAuth, RecommendationsController.getRecommendations);

export default router;
