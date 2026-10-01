import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../../utils/prisma';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '../../utils/jwt';

export class AuthService {
  static async register(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw { statusCode: 409, message: 'An account with this email already exists.' };
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
        phone: data.phone,
        role: 'USER',
        isEmailVerified: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const familyId = crypto.randomUUID();
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const rawRefreshToken = signRefreshToken({ userId: user.id, familyId });
    const tokenHash = hashToken(rawRefreshToken);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        familyId,
        expiresAt,
      },
    });

    return { user, accessToken, refreshToken: rawRefreshToken };
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw { statusCode: 401, message: 'Invalid email or password credentials.' };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw { statusCode: 401, message: 'Invalid email or password credentials.' };
    }

    const familyId = crypto.randomUUID();
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const rawRefreshToken = signRefreshToken({ userId: user.id, familyId });
    const tokenHash = hashToken(rawRefreshToken);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        familyId,
        expiresAt,
      },
    });

    const userSafe = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl,
      preferences: user.preferences ? JSON.parse(user.preferences) : null,
      createdAt: user.createdAt,
    };

    return { user: userSafe, accessToken, refreshToken: rawRefreshToken };
  }

  static async refreshTokens(rawToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(rawToken);
    } catch (err) {
      throw { statusCode: 401, message: 'Expired or invalid refresh token.' };
    }

    const incomingHash = hashToken(rawToken);
    const existingToken = await prisma.refreshToken.findUnique({
      where: { tokenHash: incomingHash },
      include: { user: true },
    });

    // If token not found or already revoked, revoke the whole family for safety
    if (!existingToken || existingToken.isRevoked) {
      if (existingToken) {
        await prisma.refreshToken.updateMany({
          where: { familyId: existingToken.familyId },
          data: { isRevoked: true },
        });
      }
      throw {
        statusCode: 401,
        message: 'Invalid session token reuse detected. Please log in again.',
      };
    }

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: existingToken.id },
      data: { isRevoked: true },
    });

    const user = existingToken.user;

    // Issue new pair
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const newRefreshToken = signRefreshToken({
      userId: user.id,
      familyId: existingToken.familyId,
    });
    const newHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        tokenHash: newHash,
        userId: user.id,
        familyId: existingToken.familyId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  static async logout(rawToken?: string) {
    if (rawToken) {
      const tokenHash = hashToken(rawToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { isRevoked: true },
      });
    }
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatarUrl: true,
        preferences: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw { statusCode: 404, message: 'User not found.' };
    }

    return {
      ...user,
      preferences: user.preferences ? JSON.parse(user.preferences) : null,
    };
  }

  static async updateProfile(
    userId: string,
    data: {
      name?: string;
      phone?: string;
      avatarUrl?: string;
      preferences?: any;
    }
  ) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
        ...(data.preferences ? { preferences: JSON.stringify(data.preferences) } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatarUrl: true,
        preferences: true,
      },
    });

    return {
      ...updated,
      preferences: updated.preferences ? JSON.parse(updated.preferences) : null,
    };
  }
}
