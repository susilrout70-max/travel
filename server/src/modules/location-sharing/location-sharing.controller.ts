import { Request, Response, NextFunction } from 'express';
import { LocationSharingService } from './location-sharing.service';

export class LocationSharingController {
  static async createShare(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const share = await LocationSharingService.createShare(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Trip share session created.',
        data: share,
      });
    } catch (err) {
      next(err);
    }
  }

  static async addPin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { shareId } = req.params;
      const pin = await LocationSharingService.addPin(req.user!.userId, shareId, req.body);
      res.status(201).json({
        success: true,
        message: 'Pin added to trip map.',
        data: pin,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getByToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      const trip = await LocationSharingService.getByToken(token);
      res.status(200).json({
        success: true,
        data: trip,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getUserShares(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const shares = await LocationSharingService.getUserShares(req.user!.userId);
      res.status(200).json({
        success: true,
        data: shares,
      });
    } catch (err) {
      next(err);
    }
  }

  static async stopShare(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { shareId } = req.params;
      const share = await LocationSharingService.stopShare(req.user!.userId, shareId);
      res.status(200).json({
        success: true,
        message: 'Trip sharing stopped.',
        data: share,
      });
    } catch (err) {
      next(err);
    }
  }
}
