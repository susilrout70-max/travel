import { Request, Response, NextFunction } from 'express';
import { RecommendationsService } from './recommendations.service';

export class RecommendationsController {
  static async getRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const recommendations = await RecommendationsService.getRecommendations(userId);

      res.status(200).json({
        success: true,
        data: recommendations,
      });
    } catch (err) {
      next(err);
    }
  }
}
