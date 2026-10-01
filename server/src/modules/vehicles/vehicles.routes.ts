import { Router } from 'express';
import { VehiclesController } from './vehicles.controller';

const router = Router();

router.get('/', VehiclesController.search);
router.get('/:id', VehiclesController.getById);

export default router;
