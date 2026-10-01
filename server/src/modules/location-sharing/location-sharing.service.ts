import crypto from 'crypto';
import { prisma } from '../../utils/prisma';

export class LocationSharingService {
  static async createShare(userId: string, data: { title: string; durationHours?: number }) {
    const { title, durationHours = 48 } = data;
    const shareToken = `trip-${crypto.randomBytes(6).toString('hex')}`;
    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);

    const tripShare = await prisma.tripShare.create({
      data: {
        userId,
        title,
        shareToken,
        isActive: true,
        expiresAt,
      },
      include: {
        pins: true,
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return tripShare;
  }

  static async addPin(
    userId: string,
    shareId: string,
    data: {
      latitude: number;
      longitude: number;
      label: string;
      description?: string;
    }
  ) {
    const trip = await prisma.tripShare.findUnique({
      where: { id: shareId },
    });

    if (!trip || trip.userId !== userId) {
      throw { statusCode: 404, message: 'Trip share session not found or unauthorized.' };
    }

    if (!trip.isActive || new Date() > trip.expiresAt) {
      throw { statusCode: 400, message: 'This trip share session has expired or been terminated.' };
    }

    const pin = await prisma.tripSharePin.create({
      data: {
        tripShareId: shareId,
        latitude: data.latitude,
        longitude: data.longitude,
        label: data.label,
        description: data.description,
      },
    });

    return pin;
  }

  static async getByToken(shareToken: string) {
    const trip = await prisma.tripShare.findUnique({
      where: { shareToken },
      include: {
        pins: {
          orderBy: { timestamp: 'asc' },
        },
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    if (!trip) {
      throw { statusCode: 404, message: 'Trip share link not found.' };
    }

    const isExpired = new Date() > trip.expiresAt || !trip.isActive;

    return {
      id: trip.id,
      title: trip.title,
      shareToken: trip.shareToken,
      isActive: trip.isActive && !isExpired,
      expiresAt: trip.expiresAt,
      isExpired,
      user: trip.user,
      pins: trip.pins,
    };
  }

  static async getUserShares(userId: string) {
    const shares = await prisma.tripShare.findMany({
      where: { userId },
      include: {
        pins: { orderBy: { timestamp: 'desc' } },
        _count: { select: { pins: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return shares.map((s) => ({
      ...s,
      isExpired: new Date() > s.expiresAt,
      pinCount: s._count.pins,
    }));
  }

  static async stopShare(userId: string, shareId: string) {
    const trip = await prisma.tripShare.findUnique({
      where: { id: shareId },
    });

    if (!trip || trip.userId !== userId) {
      throw { statusCode: 404, message: 'Trip share session not found.' };
    }

    const updated = await prisma.tripShare.update({
      where: { id: shareId },
      data: { isActive: false },
    });

    return updated;
  }
}
