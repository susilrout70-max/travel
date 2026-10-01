import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';

export class AdminController {
  static async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await AdminService.getDashboardStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, status, search, page, limit } = req.query;
      const result = await AdminService.getAllBookings({
        type: type as any,
        status: status as string,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 50,
      });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateBookingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, id } = req.params;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({ success: false, message: 'Status is required.' });
        return;
      }

      const updated = await AdminService.updateBookingStatus(
        type.toUpperCase() as 'HOTEL' | 'VEHICLE',
        id,
        status.toUpperCase()
      );

      res.status(200).json({
        success: true,
        message: `Booking status updated to ${status}.`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, id } = req.params;
      await AdminService.deleteBooking(type.toUpperCase() as 'HOTEL' | 'VEHICLE', id);
      res.status(200).json({
        success: true,
        message: 'Booking deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, search, page, limit } = req.query;
      const result = await AdminService.getAllUsers({
        role: role as string,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 50,
      });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, phone, role, isEmailVerified } = req.body;
      if (!name || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'Name, email, and password are required.',
        });
        return;
      }

      const user = await AdminService.createUser({
        name,
        email,
        password,
        phone,
        role,
        isEmailVerified,
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully.',
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getUserDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await AdminService.getUserDetails(id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await AdminService.updateUser(id, req.body);
      res.status(200).json({
        success: true,
        message: 'User updated successfully.',
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await AdminService.deleteUser(id);
      res.status(200).json({
        success: true,
        message: 'User account and sessions deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  static async revokeUserSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await AdminService.revokeAllUserSessions(id);
      res.status(200).json({
        success: true,
        message: `Revoked ${result.revokedCount} active login session(s).`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, status } = req.query;
      const sessions = await AdminService.getAllSessions({
        search: search as string,
        status: status as any,
      });
      res.status(200).json({
        success: true,
        data: sessions,
      });
    } catch (err) {
      next(err);
    }
  }

  static async revokeSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await AdminService.revokeSession(id);
      res.status(200).json({
        success: true,
        message: 'Session revoked successfully.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
