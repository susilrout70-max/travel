import { Router } from 'express';
import { LiveInfoController } from './live-info.controller';

const router = Router();

router.get('/:destinationId', LiveInfoController.getDestinationPulse);

export default router;
