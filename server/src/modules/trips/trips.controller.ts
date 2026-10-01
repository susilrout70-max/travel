import { Request, Response, NextFunction } from 'express';
import { TripsService } from './trips.service';

export class TripsController {
  static async getUserTrips(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const trips = await TripsService.getUserTrips(req.user!.userId);
      res.status(200).json({ success: true, data: trips });
    } catch (err) {
      next(err);
    }
  }

  static async createTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const trip = await TripsService.createTrip(req.user!.userId, req.body);
      res.status(201).json({ success: true, message: 'Trip created successfully!', data: trip });
    } catch (err) {
      next(err);
    }
  }

  static async getTripDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dashboard = await TripsService.getTripDashboard(req.user!.userId, req.params.id);
      res.status(200).json({ success: true, data: dashboard });
    } catch (err) {
      next(err);
    }
  }

  static async toggleChecklistItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await TripsService.toggleChecklistItem(
        req.user!.userId,
        req.params.id,
        req.params.itemId
      );
      res.status(200).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  static async addChecklistItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await TripsService.addChecklistItem(
        req.user!.userId,
        req.params.id,
        req.body
      );
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }
}
