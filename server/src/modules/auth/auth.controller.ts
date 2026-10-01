import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

const REFRESH_COOKIE_NAME = 'travelhub_refresh_token';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, accessToken, refreshToken } = await AuthService.register(req.body);
      res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);
      res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        data: { user, accessToken },
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await AuthService.login(email, password);
      res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);
      res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        data: { user, accessToken },
      });
    } catch (err) {
      next(err);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawToken = req.cookies[REFRESH_COOKIE_NAME] || req.body.refreshToken;
      if (!rawToken) {
        res.status(401).json({
          success: false,
          message: 'No refresh token provided.',
        });
        return;
      }

      const { accessToken, refreshToken } = await AuthService.refreshTokens(rawToken);
      res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);
      res.status(200).json({
        success: true,
        data: { accessToken },
      });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawToken = req.cookies[REFRESH_COOKIE_NAME] || req.body.refreshToken;
      await AuthService.logout(rawToken);
      res.clearCookie(REFRESH_COOKIE_NAME);
      res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.getMe(req.user!.userId);
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.updateProfile(req.user!.userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  }
}
