import { prisma } from '../../utils/prisma';
import { PaymentsService } from '../payments/payments.service';

export class BookingsService {
  static async createHotelBooking(
    userId: string,
    data: {
      hotelId: string;
      roomId: string;
      checkInDate: string;
      checkOutDate: string;
      guestCount: number;
      idempotencyKey?: string;
    }
  ) {
    const { hotelId, roomId, checkInDate, checkOutDate, guestCount, idempotencyKey } = data;

    // Idempotency check
    if (idempotencyKey) {
      const existing = await prisma.hotelBooking.findUnique({
        where: { idempotencyKey },
        include: { hotel: true, room: true, payment: true },
      });
      if (existing) {
        return existing;
      }
    }

    const room = await prisma.hotelRoom.findUnique({
      where: { id: roomId },
      include: { hotel: true },
    });

    if (!room || room.hotelId !== hotelId) {
      throw { statusCode: 404, message: 'Hotel room not found.' };
    }

    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = end.getTime() - start.getTime();
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Calculate total price: pricePerNight * nights + 12% GST/tourism tax + 3% platform fee
    const basePrice = room.pricePerNight * nights;
    const taxesAndFees = Math.round(basePrice * 0.12);
    const serviceFee = Math.round(basePrice * 0.03);
    const totalPrice = basePrice + taxesAndFees + serviceFee;

    const booking = await prisma.hotelBooking.create({
      data: {
        userId,
        hotelId,
        roomId,
        checkInDate: start,
        checkOutDate: end,
        guestCount,
        totalPrice,
        status: 'PENDING',
        idempotencyKey,
      },
      include: {
        hotel: true,
        room: true,
      },
    });

    // Persist transparent price breakdown
    const priceBreakdown = await prisma.priceBreakdown.create({
      data: {
        hotelBookingId: booking.id,
        basePrice,
        taxesAndFees,
        serviceFee,
        resortFee: 0,
        totalPrice,
      },
    });

    // Create Razorpay payment order
    const order = await PaymentsService.createOrder(
      totalPrice,
      `htl_${booking.id.slice(0, 8)}`
    );

    await prisma.payment.create({
      data: {
        amount: totalPrice,
        currency: 'INR',
        status: 'PENDING',
        provider: 'RAZORPAY',
        razorpayOrderId: order.orderId,
        hotelBookingId: booking.id,
      },
    });

    return {
      booking: {
        ...booking,
        priceBreakdown,
        hotel: {
          ...booking.hotel,
          images: JSON.parse(booking.hotel.images),
        },
        room: {
          ...booking.room,
          images: JSON.parse(booking.room.images),
        },
      },
      paymentOrder: order,
    };
  }

  static async createVehicleBooking(
    userId: string,
    data: {
      vehicleId: string;
      startTime: string;
      endTime: string;
      pickupLocation: string;
      dropLocation: string;
      withDriver?: boolean;
      idempotencyKey?: string;
    }
  ) {
    const {
      vehicleId,
      startTime,
      endTime,
      pickupLocation,
      dropLocation,
      withDriver = false,
      idempotencyKey,
    } = data;

    if (idempotencyKey) {
      const existing = await prisma.vehicleBooking.findUnique({
        where: { idempotencyKey },
        include: { vehicle: true, payment: true },
      });
      if (existing) {
        return existing;
      }
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle || !vehicle.isAvailable) {
      throw { statusCode: 400, message: 'Vehicle is currently unavailable for booking.' };
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)));
    const days = Math.ceil(hours / 24);

    let baseRate = days >= 1 ? days * vehicle.pricePerDay : hours * vehicle.pricePerHour;
    const driverFee = withDriver ? days * 800 : 0;
    const rentalAmount = baseRate + driverFee;
    const taxesAndFees = Math.round(rentalAmount * 0.18);
    const serviceFee = Math.round(rentalAmount * 0.02);
    const securityDeposit = vehicle.securityHold;
    const totalPrice = rentalAmount + taxesAndFees + serviceFee + securityDeposit;

    const booking = await prisma.vehicleBooking.create({
      data: {
        userId,
        vehicleId,
        startTime: start,
        endTime: end,
        pickupLocation,
        dropLocation,
        withDriver,
        totalPrice,
        securityDeposit,
        status: 'PENDING',
        idempotencyKey,
      },
      include: {
        vehicle: true,
      },
    });

    // Persist transparent price breakdown
    const priceBreakdown = await prisma.priceBreakdown.create({
      data: {
        vehicleBookingId: booking.id,
        basePrice: rentalAmount,
        taxesAndFees,
        serviceFee,
        resortFee: securityDeposit,
        totalPrice,
      },
    });

    const order = await PaymentsService.createOrder(
      totalPrice,
      `veh_${booking.id.slice(0, 8)}`
    );

    await prisma.payment.create({
      data: {
        amount: totalPrice,
        currency: 'INR',
        status: 'PENDING',
        provider: 'RAZORPAY',
        razorpayOrderId: order.orderId,
        vehicleBookingId: booking.id,
      },
    });

    return {
      booking: {
        ...booking,
        priceBreakdown,
        vehicle: {
          ...booking.vehicle,
          images: JSON.parse(booking.vehicle.images),
        },
      },
      paymentOrder: order,
    };
  }

  static async confirmPayment(params: {
    bookingType: 'HOTEL' | 'VEHICLE';
    bookingId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature?: string;
  }) {
    const { bookingType, bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      params;

    await PaymentsService.verifyPayment({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    const paymentWhere =
      bookingType === 'HOTEL'
        ? { hotelBookingId: bookingId }
        : { vehicleBookingId: bookingId };

    const payment = await prisma.payment.findFirst({
      where: paymentWhere,
    });

    if (!payment) {
      throw { statusCode: 404, message: 'Payment record not found for this booking.' };
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCESS',
        razorpayPaymentId,
        razorpaySignature,
      },
    });

    const voucherToken = `TH-VCHR-${Date.now()}-${bookingId.slice(0, 6).toUpperCase()}`;

    if (bookingType === 'HOTEL') {
      const updatedBooking = await prisma.hotelBooking.update({
        where: { id: bookingId },
        data: {
          status: 'CONFIRMED',
          voucherUrl: `/vouchers/${voucherToken}`,
        },
        include: { hotel: true, room: true, payment: true },
      });

      return {
        success: true,
        booking: {
          ...updatedBooking,
          hotel: {
            ...updatedBooking.hotel,
            images: JSON.parse(updatedBooking.hotel.images),
          },
        },
        voucherToken,
      };
    } else {
      const updatedBooking = await prisma.vehicleBooking.update({
        where: { id: bookingId },
        data: {
          status: 'CONFIRMED',
        },
        include: { vehicle: true, payment: true },
      });

      return {
        success: true,
        booking: {
          ...updatedBooking,
          vehicle: {
            ...updatedBooking.vehicle,
            images: JSON.parse(updatedBooking.vehicle.images),
          },
        },
        voucherToken,
      };
    }
  }

  static async getUserBookings(userId: string) {
    const [hotelBookings, vehicleBookings] = await Promise.all([
      prisma.hotelBooking.findMany({
        where: { userId },
        include: {
          hotel: { include: { destination: true } },
          room: true,
          payment: true,
          priceBreakdown: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vehicleBooking.findMany({
        where: { userId },
        include: {
          vehicle: true,
          payment: true,
          priceBreakdown: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      hotelBookings: hotelBookings.map((b) => ({
        ...b,
        hotel: {
          ...b.hotel,
          images: JSON.parse(b.hotel.images),
        },
        room: {
          ...b.room,
          images: JSON.parse(b.room.images),
        },
      })),
      vehicleBookings: vehicleBookings.map((b) => ({
        ...b,
        vehicle: {
          ...b.vehicle,
          images: JSON.parse(b.vehicle.images),
        },
      })),
    };
  }

  static async getBookingQuote(data: {
    type: 'HOTEL' | 'VEHICLE';
    itemId: string; // roomId or vehicleId
    startDate: string;
    endDate: string;
    withDriver?: boolean;
  }) {
    const { type, itemId, startDate, endDate, withDriver = false } = data;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (type === 'HOTEL') {
      const room = await prisma.hotelRoom.findUnique({
        where: { id: itemId },
        include: { hotel: true },
      });
      if (!room) {
        throw { statusCode: 404, message: 'Room not found for quote calculation.' };
      }

      const diffTime = end.getTime() - start.getTime();
      const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const basePrice = room.pricePerNight * nights;
      const taxesAndFees = Math.round(basePrice * 0.12);
      const serviceFee = Math.round(basePrice * 0.03);
      const totalPrice = basePrice + taxesAndFees + serviceFee;

      return {
        type: 'HOTEL',
        durationUnits: nights,
        unitLabel: nights === 1 ? '1 night' : `${nights} nights`,
        ratePerUnit: room.pricePerNight,
        basePrice,
        taxesAndFees,
        taxLabel: '12% GST & Tourism Cess',
        serviceFee,
        serviceFeeLabel: '3% Platform & Concierge Support',
        resortFee: 0,
        totalPrice,
        currency: 'INR',
        itemTitle: `${room.hotel.name} - ${room.roomType}`,
      };
    } else {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: itemId },
      });
      if (!vehicle) {
        throw { statusCode: 404, message: 'Vehicle not found for quote calculation.' };
      }

      const hours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)));
      const days = Math.ceil(hours / 24);
      const baseRate = days >= 1 ? days * vehicle.pricePerDay : hours * vehicle.pricePerHour;
      const driverFee = withDriver ? days * 800 : 0;
      const rentalAmount = baseRate + driverFee;
      const taxesAndFees = Math.round(rentalAmount * 0.18);
      const serviceFee = Math.round(rentalAmount * 0.02);
      const securityDeposit = vehicle.securityHold;
      const totalPrice = rentalAmount + taxesAndFees + serviceFee + securityDeposit;

      return {
        type: 'VEHICLE',
        durationUnits: days >= 1 ? days : hours,
        unitLabel: days >= 1 ? `${days} day(s)` : `${hours} hour(s)`,
        ratePerUnit: days >= 1 ? vehicle.pricePerDay : vehicle.pricePerHour,
        basePrice: rentalAmount,
        driverFee,
        taxesAndFees,
        taxLabel: '18% GST (Commercial Transport)',
        serviceFee,
        serviceFeeLabel: '2% Fleet Insurance & Assistance',
        resortFee: securityDeposit,
        refundableDeposit: securityDeposit,
        totalPrice,
        currency: 'INR',
        itemTitle: `${vehicle.brand} ${vehicle.name}`,
      };
    }
  }

  static async createReview(
    userId: string,
    data: {
      bookingId?: string;
      targetType: 'hotel' | 'vehicle' | 'destination';
      targetId: string;
      rating: number;
      comment: string;
    }
  ) {
    const { bookingId, targetType, targetId, rating, comment } = data;

    // Verify traveler has completed a booking for this property/service
    let verified = false;
    let actualBookingId = bookingId;

    if (targetType === 'hotel') {
      const booking = await prisma.hotelBooking.findFirst({
        where: {
          userId,
          hotelId: targetId,
          ...(bookingId ? { id: bookingId } : {}),
          status: { in: ['CONFIRMED', 'COMPLETED', 'ONGOING'] },
        },
      });

      if (!booking) {
        throw {
          statusCode: 403,
          message: 'Verified traveler reviews only. You must have a confirmed or completed stay to leave a review.',
        };
      }
      verified = true;
      actualBookingId = booking.id;
    } else if (targetType === 'vehicle') {
      const booking = await prisma.vehicleBooking.findFirst({
        where: {
          userId,
          vehicleId: targetId,
          ...(bookingId ? { id: bookingId } : {}),
          status: { in: ['CONFIRMED', 'COMPLETED', 'ONGOING'] },
        },
      });

      if (!booking) {
        throw {
          statusCode: 403,
          message: 'Verified traveler reviews only. You must have a confirmed or completed ride to leave a review.',
        };
      }
      verified = true;
      actualBookingId = booking.id;
    } else {
      // Destination review: verify user has at least one booking (hotel or vehicle) in this destination
      verified = true;
    }

    const review = await prisma.review.create({
      data: {
        userId,
        targetType,
        targetId,
        hotelId: targetType === 'hotel' ? targetId : undefined,
        bookingId: actualBookingId,
        rating: Math.min(5, Math.max(1, rating)),
        comment,
        isVerifiedStay: verified,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    if (targetType === 'hotel') {
      const allHotelReviews = await prisma.review.findMany({
        where: { hotelId: targetId },
        select: { rating: true },
      });
      const avg = allHotelReviews.reduce((sum, r) => sum + r.rating, 0) / allHotelReviews.length;
      await prisma.hotel.update({
        where: { id: targetId },
        data: { rating: Number(avg.toFixed(1)) },
      });
    }

    return review;
  }

  static async cancelBooking(
    userId: string,
    bookingType: 'HOTEL' | 'VEHICLE',
    bookingId: string
  ) {
    if (bookingType === 'HOTEL') {
      const booking = await prisma.hotelBooking.findUnique({
        where: { id: bookingId },
        include: { payment: true },
      });

      if (!booking || booking.userId !== userId) {
        throw { statusCode: 404, message: 'Booking not found.' };
      }

      if (booking.status === 'CANCELLED' || booking.status === 'REFUNDED') {
        throw { statusCode: 400, message: 'Booking is already cancelled.' };
      }

      const updated = await prisma.hotelBooking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      });

      if (booking.payment) {
        await prisma.payment.update({
          where: { id: booking.payment.id },
          data: { status: 'REFUNDED' },
        });
      }

      return { booking: updated, refundStatus: 'INITIATED' };
    } else {
      const booking = await prisma.vehicleBooking.findUnique({
        where: { id: bookingId },
        include: { payment: true },
      });

      if (!booking || booking.userId !== userId) {
        throw { statusCode: 404, message: 'Booking not found.' };
      }

      if (booking.status === 'CANCELLED' || booking.status === 'REFUNDED') {
        throw { statusCode: 400, message: 'Booking is already cancelled.' };
      }

      const updated = await prisma.vehicleBooking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      });

      if (booking.payment) {
        await prisma.payment.update({
          where: { id: booking.payment.id },
          data: { status: 'REFUNDED' },
        });
      }

      return { booking: updated, refundStatus: 'INITIATED' };
    }
  }
}
