import { Request, Response, NextFunction } from 'express';
import { DestinationsService } from './destinations.service';

export class DestinationsController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, search, limit, sortBy } = req.query;
      const destinations = await DestinationsService.getAll({
        category: category as string,
        search: search as string,
        limit: limit ? parseInt(limit as string, 10) : 20,
        sortBy: sortBy as any,
      });

      res.status(200).json({
        success: true,
        data: destinations,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const userId = req.user?.userId;
      const destination = await DestinationsService.getBySlug(slug, userId);

      res.status(200).json({
        success: true,
        data: destination,
      });
    } catch (err) {
      next(err);
    }
  }

  static async toggleWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { destinationId } = req.body;
      const result = await DestinationsService.toggleWishlist(req.user!.userId, destinationId);

      res.status(200).json({
        success: true,
        message: result.isWishlisted ? 'Added to wishlist' : 'Removed from wishlist',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getLocalPicks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sort = (req.query.sort as 'upvotes' | 'recent') || 'upvotes';
      const picks = await DestinationsService.getLocalPicks(req.params.id, sort);
      res.status(200).json({ success: true, data: picks });
    } catch (err) {
      next(err);
    }
  }

  static async upvoteLocalPick(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pick = await DestinationsService.upvoteLocalPick(req.params.pickId);
      res.status(200).json({ success: true, data: pick });
    } catch (err) {
      next(err);
    }
  }

  static async getSeasonalInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const insights = await DestinationsService.getSeasonalInsights(req.params.id);
      res.status(200).json({ success: true, data: insights });
    } catch (err) {
      next(err);
    }
  }

  static async getEmergencyDirectory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const directory = await DestinationsService.getEmergencyDirectory(req.params.id);
      res.status(200).json({ success: true, data: directory });
    } catch (err) {
      next(err);
    }
  }

  static async getUserWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const wishlist = await DestinationsService.getUserWishlist(req.user!.userId);
      res.status(200).json({ success: true, data: wishlist });
    } catch (err) {
      next(err);
    }
  }
}
