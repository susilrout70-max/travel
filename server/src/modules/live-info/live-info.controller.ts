import { Request, Response, NextFunction } from 'express';
import { LiveInfoService } from './live-info.service';

export class LiveInfoController {
  static async getDestinationPulse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { destinationId } = req.params;
      const pulseData = await LiveInfoService.getDestinationPulse(destinationId);

      res.status(200).json({
        success: true,
        data: pulseData,
      });
    } catch (err) {
      next(err);
    }
  }
}
