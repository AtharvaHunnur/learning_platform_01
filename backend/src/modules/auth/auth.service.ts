import prisma from '../../config/db';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import crypto from 'crypto';

export class AuthService {
  async register(name: string, email: string, password: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw { status: 409, message: 'Email already registered' };
    }

    const password_hash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, password_hash },
      select: { id: true, name: true, email: true, role: true, created_at: true },
    });

    const tokens = await this.generateTokens(user.id, user.role);
    return { user, ...tokens };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw { status: 401, message: 'Invalid email or password' };
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      throw { status: 401, message: 'Invalid email or password' };
    }

    const tokens = await this.generateTokens(user.id, user.role);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const tokenHash = this.hashToken(refreshToken);

      const storedToken = await prisma.refreshToken.findFirst({
        where: {
          token_hash: tokenHash,
          user_id: decoded.userId,
          revoked_at: null,
          expires_at: { gt: new Date() },
        },
      });

      if (!storedToken) {
        throw { status: 401, message: 'Invalid refresh token' };
      }

      // Revoke old token
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked_at: new Date() },
      });

      // Generate new tokens
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, email: true, role: true },
      });

      if (!user) {
        throw { status: 401, message: 'User not found' };
      }

      const tokens = await this.generateTokens(user.id, user.role);
      return { user, ...tokens };
    } catch (error: any) {
      if (error.status) throw error;
      throw { status: 401, message: 'Invalid refresh token' };
    }
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { token_hash: tokenHash, revoked_at: null },
      data: { revoked_at: new Date() },
    });
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        enrollments: {
          include: {
            subject: {
              select: { id: true, title: true, slug: true, thumbnail_url: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    return user;
  }

  private async generateTokens(userId: string, role: string) {
    const accessToken = generateAccessToken({ userId, role });
    const refreshToken = generateRefreshToken({ userId, role });

    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.refreshToken.create({
      data: {
        token_hash: tokenHash,
        user_id: userId,
        expires_at: expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

export const authService = new AuthService();
