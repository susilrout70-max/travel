import bcrypt from 'bcryptjs';
import { prisma } from '../../utils/prisma';

export class AdminService {
  /**
   * Platform overview statistics
   */
  static async getDashboardStats() {
    const now = new Date();

    const [
      totalUsers,
      totalHotelBookings,
      totalVehicleBookings,
      activeSessionsCount,
      usersByRole,
      hotelBookingsByStatus,
      vehicleBookingsByStatus,
      successfulPayments,
      recentHotelBookings,
      recentVehicleBookings,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.hotelBooking.count(),
      prisma.vehicleBooking.count(),
      prisma.refreshToken.count({
        where: {
          isRevoked: false,
          expiresAt: { gt: now },
        },
      }),
      prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
      }),
      prisma.hotelBooking.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { totalPrice: true },
      }),
      prisma.vehicleBooking.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { totalPrice: true },
      }),
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.hotelBooking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          hotel: { select: { id: true, name: true } },
          room: { select: { id: true, roomType: true } },
          payment: true,
        },
      }),
      prisma.vehicleBooking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          vehicle: { select: { id: true, name: true, type: true } },
          payment: true,
        },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          avatarUrl: true,
          _count: {
            select: {
              hotelBookings: true,
              vehicleBookings: true,
            },
          },
        },
      }),
    ]);

    // Calculate total confirmed revenue
    const totalConfirmedRevenue = successfulPayments._sum.amount || 0;

    // Combine recent bookings into a single activity list
    const combinedRecentBookings = [
      ...recentHotelBookings.map((b) => ({
        id: b.id,
        bookingType: 'HOTEL' as const,
        customerName: b.user.name,
        customerEmail: b.user.email,
        customerAvatar: b.user.avatarUrl,
        itemTitle: `${b.hotel.name} (${b.room.roomType})`,
        amount: b.totalPrice,
        status: b.status,
        createdAt: b.createdAt,
      })),
      ...recentVehicleBookings.map((b) => ({
        id: b.id,
        bookingType: 'VEHICLE' as const,
        customerName: b.user.name,
        customerEmail: b.user.email,
        customerAvatar: b.user.avatarUrl,
        itemTitle: `${b.vehicle.name} (${b.vehicle.type})`,
        amount: b.totalPrice,
        status: b.status,
        createdAt: b.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      metrics: {
        totalUsers,
        totalBookings: totalHotelBookings + totalVehicleBookings,
        totalHotelBookings,
        totalVehicleBookings,
        activeSessionsCount,
        totalRevenue: totalConfirmedRevenue,
      },
      breakdowns: {
        usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count.id })),
        hotelStatuses: hotelBookingsByStatus.map((s) => ({
          status: s.status,
          count: s._count.id,
          totalAmount: s._sum.totalPrice || 0,
        })),
        vehicleStatuses: vehicleBookingsByStatus.map((s) => ({
          status: s.status,
          count: s._count.id,
          totalAmount: s._sum.totalPrice || 0,
        })),
      },
      recentBookings: combinedRecentBookings.slice(0, 8),
      recentUsers,
    };
  }

  /**
   * Get all bookings with filtering & search
   */
  static async getAllBookings(params: {
    type?: 'ALL' | 'HOTEL' | 'VEHICLE';
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { type = 'ALL', status, search, page = 1, limit = 50 } = params;

    let hotelBookings: any[] = [];
    let vehicleBookings: any[] = [];

    const statusFilter = status && status !== 'ALL' ? status : undefined;

    // Search filter
    const userSearch = search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : undefined;

    if (type === 'ALL' || type === 'HOTEL') {
      const hotelWhere: any = {};
      if (statusFilter) hotelWhere.status = statusFilter;
      if (userSearch) hotelWhere.user = userSearch;
      if (search) {
        hotelWhere.OR = [
          { id: { contains: search } },
          { hotel: { name: { contains: search } } },
          { user: userSearch },
        ];
      }

      hotelBookings = await prisma.hotelBooking.findMany({
        where: hotelWhere,
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, avatarUrl: true, role: true },
          },
          hotel: {
            include: { destination: { select: { id: true, name: true, state: true } } },
          },
          room: true,
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (type === 'ALL' || type === 'VEHICLE') {
      const vehicleWhere: any = {};
      if (statusFilter) vehicleWhere.status = statusFilter;
      if (userSearch) vehicleWhere.user = userSearch;
      if (search) {
        vehicleWhere.OR = [
          { id: { contains: search } },
          { vehicle: { name: { contains: search } } },
          { user: userSearch },
        ];
      }

      vehicleBookings = await prisma.vehicleBooking.findMany({
        where: vehicleWhere,
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, avatarUrl: true, role: true },
          },
          vehicle: true,
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Normalizing records
    const normalizedHotels = hotelBookings.map((b) => ({
      id: b.id,
      bookingType: 'HOTEL' as const,
      user: b.user,
      item: {
        id: b.hotel.id,
        name: b.hotel.name,
        roomType: b.room.roomType,
        destination: b.hotel.destination?.name,
        state: b.hotel.destination?.state,
        image: b.hotel.images ? JSON.parse(b.hotel.images)[0] : null,
      },
      dates: {
        start: b.checkInDate,
        end: b.checkOutDate,
        details: `${b.guestCount} Guest(s)`,
      },
      totalPrice: b.totalPrice,
      status: b.status,
      voucherUrl: b.voucherUrl,
      payment: b.payment,
      createdAt: b.createdAt,
    }));

    const normalizedVehicles = vehicleBookings.map((b) => ({
      id: b.id,
      bookingType: 'VEHICLE' as const,
      user: b.user,
      item: {
        id: b.vehicle.id,
        name: b.vehicle.name,
        type: b.vehicle.type,
        city: b.vehicle.city,
        image: b.vehicle.images ? JSON.parse(b.vehicle.images)[0] : null,
      },
      dates: {
        start: b.startTime,
        end: b.endTime,
        details: `${b.pickupLocation} → ${b.dropLocation} ${b.withDriver ? '(With Driver)' : '(Self Drive)'}`,
      },
      totalPrice: b.totalPrice,
      status: b.status,
      voucherUrl: null,
      payment: b.payment,
      createdAt: b.createdAt,
    }));

    const combined = [...normalizedHotels, ...normalizedVehicles].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const startIndex = (page - 1) * limit;
    const paginated = combined.slice(startIndex, startIndex + limit);

    return {
      total: combined.length,
      page,
      limit,
      bookings: paginated,
    };
  }

  /**
   * Update booking status (and synchronized payment status)
   */
  static async updateBookingStatus(
    bookingType: 'HOTEL' | 'VEHICLE',
    bookingId: string,
    status: string
  ) {
    const validStatuses = [
      'PENDING',
      'CONFIRMED',
      'ONGOING',
      'COMPLETED',
      'CANCELLED',
      'REFUNDED',
    ];
    if (!validStatuses.includes(status)) {
      throw { statusCode: 400, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` };
    }

    if (bookingType === 'HOTEL') {
      const booking = await prisma.hotelBooking.findUnique({
        where: { id: bookingId },
        include: { payment: true },
      });

      if (!booking) {
        throw { statusCode: 404, message: 'Hotel booking not found.' };
      }

      const updated = await prisma.hotelBooking.update({
        where: { id: bookingId },
        data: { status },
      });

      // Update payment status if cancelled or refunded
      if (booking.payment) {
        if (status === 'CANCELLED' || status === 'REFUNDED') {
          await prisma.payment.update({
            where: { id: booking.payment.id },
            data: { status: 'REFUNDED' },
          });
        } else if (status === 'CONFIRMED' && booking.payment.status === 'PENDING') {
          await prisma.payment.update({
            where: { id: booking.payment.id },
            data: { status: 'SUCCESS' },
          });
        }
      }

      return updated;
    } else {
      const booking = await prisma.vehicleBooking.findUnique({
        where: { id: bookingId },
        include: { payment: true },
      });

      if (!booking) {
        throw { statusCode: 404, message: 'Vehicle booking not found.' };
      }

      const updated = await prisma.vehicleBooking.update({
        where: { id: bookingId },
        data: { status },
      });

      // Update payment status if cancelled or refunded
      if (booking.payment) {
        if (status === 'CANCELLED' || status === 'REFUNDED') {
          await prisma.payment.update({
            where: { id: booking.payment.id },
            data: { status: 'REFUNDED' },
          });
        } else if (status === 'CONFIRMED' && booking.payment.status === 'PENDING') {
          await prisma.payment.update({
            where: { id: booking.payment.id },
            data: { status: 'SUCCESS' },
          });
        }
      }

      return updated;
    }
  }

  /**
   * Delete booking
   */
  static async deleteBooking(bookingType: 'HOTEL' | 'VEHICLE', bookingId: string) {
    if (bookingType === 'HOTEL') {
      await prisma.payment.deleteMany({
        where: { hotelBookingId: bookingId },
      });
      await prisma.hotelBooking.delete({
        where: { id: bookingId },
      });
    } else {
      await prisma.payment.deleteMany({
        where: { vehicleBookingId: bookingId },
      });
      await prisma.vehicleBooking.delete({
        where: { id: bookingId },
      });
    }
    return { success: true };
  }

  /**
   * Get all users with search, role filters, and activity counts
   */
  static async getAllUsers(params: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { role, search, page = 1, limit = 50 } = params;

    const where: any = {};
    if (role && role !== 'ALL') {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isEmailVerified: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              hotelBookings: true,
              vehicleBookings: true,
              refreshTokens: {
                where: {
                  isRevoked: false,
                  expiresAt: { gt: new Date() },
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      users: users.map((u) => ({
        ...u,
        totalBookings: u._count.hotelBookings + u._count.vehicleBookings,
        activeSessions: u._count.refreshTokens,
      })),
    };
  }

  /**
   * Create a new user / admin / partner account
   */
  static async createUser(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
    isEmailVerified?: boolean;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw { statusCode: 409, message: 'User with this email already exists.' };
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        phone: data.phone,
        role: data.role || 'USER',
        isEmailVerified: data.isEmailVerified ?? true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Get detailed user info
   */
  static async getUserDetails(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        hotelBookings: {
          include: {
            hotel: { select: { id: true, name: true } },
            room: { select: { id: true, roomType: true } },
            payment: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        vehicleBookings: {
          include: {
            vehicle: { select: { id: true, name: true, type: true } },
            payment: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        refreshTokens: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        tripShares: {
          select: { id: true, title: true, isActive: true, createdAt: true },
        },
      },
    });

    if (!user) {
      throw { statusCode: 404, message: 'User not found.' };
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Update user info / role
   */
  static async updateUser(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      role?: string;
      isEmailVerified?: boolean;
    }
  ) {
    const validRoles = ['USER', 'ADMIN', 'PARTNER', 'GUEST'];
    if (data.role && !validRoles.includes(data.role)) {
      throw { statusCode: 400, message: `Invalid role. Must be one of: ${validRoles.join(', ')}` };
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.email ? { email: data.email.toLowerCase() } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.role ? { role: data.role } : {}),
        ...(data.isEmailVerified !== undefined ? { isEmailVerified: data.isEmailVerified } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  /**
   * Delete user
   */
  static async deleteUser(id: string) {
    // Delete associated refresh tokens, trip share pins, etc.
    await prisma.refreshToken.deleteMany({ where: { userId: id } });
    await prisma.wishlist.deleteMany({ where: { userId: id } });
    await prisma.review.deleteMany({ where: { userId: id } });

    // Remove trip shares
    const trips = await prisma.tripShare.findMany({ where: { userId: id } });
    for (const t of trips) {
      await prisma.tripSharePin.deleteMany({ where: { tripShareId: t.id } });
    }
    await prisma.tripShare.deleteMany({ where: { userId: id } });

    await prisma.user.delete({ where: { id } });
    return { success: true };
  }

  /**
   * Revoke all sessions for a specific user
   */
  static async revokeAllUserSessions(userId: string) {
    const result = await prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });

    return { revokedCount: result.count };
  }

  /**
   * Get all active and recent sessions
   */
  static async getAllSessions(params: { search?: string; status?: 'active' | 'revoked' | 'all' }) {
    const { search, status = 'all' } = params;
    const now = new Date();

    const where: any = {};
    if (status === 'active') {
      where.isRevoked = false;
      where.expiresAt = { gt: now };
    } else if (status === 'revoked') {
      where.OR = [{ isRevoked: true }, { expiresAt: { lte: now } }];
    }

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      };
    }

    const sessions = await prisma.refreshToken.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return sessions.map((s) => ({
      id: s.id,
      familyId: s.familyId,
      isRevoked: s.isRevoked,
      isExpired: s.expiresAt <= now,
      isActive: !s.isRevoked && s.expiresAt > now,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      user: s.user,
    }));
  }

  /**
   * Revoke a specific session
   */
  static async revokeSession(sessionId: string) {
    const session = await prisma.refreshToken.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw { statusCode: 404, message: 'Session not found.' };
    }

    // Revoke whole family for security
    const result = await prisma.refreshToken.updateMany({
      where: { familyId: session.familyId },
      data: { isRevoked: true },
    });

    return { success: true, count: result.count };
  }
}
