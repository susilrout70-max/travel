import { Request, Response, NextFunction } from 'express';
import { HotelsService } from './hotels.service';

export class HotelsController {
  static async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        destinationSlug,
        destinationId,
        search,
        minPrice,
        maxPrice,
        minRating,
        amenities,
        sortBy,
      } = req.query;

      let amenitiesList: string[] | undefined;
      if (amenities) {
        amenitiesList = typeof amenities === 'string' ? amenities.split(',') : (amenities as string[]);
      }

      const hotels = await HotelsService.search({
        destinationSlug: destinationSlug as string,
        destinationId: destinationId as string,
        search: search as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        amenities: amenitiesList,
        sortBy: sortBy as any,
      });

      res.status(200).json({
        success: true,
        data: hotels,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const hotel = await HotelsService.getById(id);

      res.status(200).json({
        success: true,
        data: hotel,
      });
    } catch (err) {
      next(err);
    }
  }

  static async addReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      const review = await HotelsService.addReview(req.user!.userId, id, Number(rating), comment);

      res.status(201).json({
        success: true,
        message: 'Review posted successfully.',
        data: review,
      });
    } catch (err) {
      next(err);
    }
  }
}
