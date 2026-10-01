import { Request, Response, NextFunction } from 'express';
import { VehiclesService } from './vehicles.service';

export class VehiclesController {
  static async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, city, fuelType, transmission, maxDailyPrice, sortBy } = req.query;

      const vehicles = await VehiclesService.search({
        type: type as any,
        city: city as string,
        fuelType: fuelType as string,
        transmission: transmission as string,
        maxDailyPrice: maxDailyPrice ? parseFloat(maxDailyPrice as string) : undefined,
        sortBy: sortBy as any,
      });

      res.status(200).json({
        success: true,
        data: vehicles,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const vehicle = await VehiclesService.getById(id);

      res.status(200).json({
        success: true,
        data: vehicle,
      });
    } catch (err) {
      next(err);
    }
  }
}
