import { Request, Response } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/auth';
import { env } from '../../config/env';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return sendError(res, 'Name, email, and password are required', 400);
      }

      if (password.length < 6) {
        return sendError(res, 'Password must be at least 6 characters', 400);
      }

      const result = await authService.register(name, email, password);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/',
      });

      return sendSuccess(res, {
        user: result.user,
        accessToken: result.accessToken,
      }, 'Registration successful', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Registration failed', error.status || 500);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return sendError(res, 'Email and password are required', 400);
      }

      const result = await authService.login(email, password);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      return sendSuccess(res, {
        user: result.user,
        accessToken: result.accessToken,
      }, 'Login successful');
    } catch (error: any) {
      return sendError(res, error.message || 'Login failed', error.status || 500);
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        return sendError(res, 'Refresh token required', 401);
      }

      const result = await authService.refresh(refreshToken);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      return sendSuccess(res, {
        user: result.user,
        accessToken: result.accessToken,
      }, 'Token refreshed');
    } catch (error: any) {
      return sendError(res, error.message || 'Token refresh failed', error.status || 500);
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.clearCookie('refreshToken', { path: '/' });

      return sendSuccess(res, null, 'Logged out successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Logout failed', error.status || 500);
    }
  }

  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const profile = await authService.getProfile(userId);
      return sendSuccess(res, profile);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to get profile', error.status || 500);
    }
  }
}

export const authController = new AuthController();
