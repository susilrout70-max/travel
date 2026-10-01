import { Request, Response, NextFunction } from 'express';
import { BookingsService } from './bookings.service';

export class BookingsController {
  static async createHotelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await BookingsService.createHotelBooking(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Hotel booking initiated.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async createVehicleBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await BookingsService.createVehicleBooking(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Vehicle booking initiated.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async confirmPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await BookingsService.confirmPayment(req.body);
      res.status(200).json({
        success: true,
        message: 'Payment confirmed and booking finalized.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getUserBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookings = await BookingsService.getUserBookings(req.user!.userId);
      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (err) {
      next(err);
    }
  }

  static async cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingType, bookingId } = req.body;
      const result = await BookingsService.cancelBooking(
        req.user!.userId,
        bookingType,
        bookingId
      );
      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully. Refund initiated.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getBookingQuote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quote = await BookingsService.getBookingQuote(req.body);
      res.status(200).json({
        success: true,
        data: quote,
      });
    } catch (err) {
      next(err);
    }
  }

  static async createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await BookingsService.createReview(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Verified review submitted successfully!',
        data: review,
      });
    } catch (err) {
      next(err);
    }
  }
}
