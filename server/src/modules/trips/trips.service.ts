import { prisma } from '../../utils/prisma';
import { LiveInfoService } from '../live-info/live-info.service';

export class TripsService {
  static async getUserTrips(userId: string) {
    const trips = await prisma.trip.findMany({
      where: { userId },
      include: {
        destination: true,
        checklist: true,
      },
      orderBy: { startDate: 'asc' },
    });

    return trips.map((t) => ({
      ...t,
      destination: {
        ...t.destination,
        images: JSON.parse(t.destination.images),
      },
      hotelBookingIds: JSON.parse(t.hotelBookingIds || '[]'),
      vehicleBookingIds: JSON.parse(t.vehicleBookingIds || '[]'),
    }));
  }

  static async createTrip(
    userId: string,
    data: {
      name: string;
      destinationId: string;
      startDate: string;
      endDate: string;
      hotelBookingIds?: string[];
      vehicleBookingIds?: string[];
      notes?: string;
    }
  ) {
    const destination = await prisma.destination.findUnique({
      where: { id: data.destinationId },
    });

    if (!destination) {
      throw { statusCode: 404, message: 'Destination not found.' };
    }

    const trip = await prisma.trip.create({
      data: {
        userId,
        name: data.name,
        destinationId: data.destinationId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        hotelBookingIds: JSON.stringify(data.hotelBookingIds || []),
        vehicleBookingIds: JSON.stringify(data.vehicleBookingIds || []),
        notes: data.notes,
      },
    });

    // Auto-generate smart checklist items based on destination category
    const autoChecklist: { label: string; category: string }[] = [
      { label: 'Download offline maps & emergency contacts pack', category: 'SAFETY' },
      { label: 'Carry Gov ID / Aadhaar card / Driving license originals', category: 'DOCUMENTS' },
      { label: 'Configure Trip Safety Mode & set alert contacts', category: 'SAFETY' },
      { label: 'Comfortable walking shoes & power bank', category: 'PACKING' },
    ];

    if (destination.category === 'HILL_STATION') {
      autoChecklist.push(
        { label: 'Pack thermals, windcheater & woolen gloves', category: 'PACKING' },
        { label: 'Motion sickness & high altitude acclimatization tablets', category: 'SAFETY' },
        { label: 'Check Atal Tunnel / Rohtang Pass permits in advance', category: 'DOCUMENTS' }
      );
    } else if (destination.category === 'BEACH') {
      autoChecklist.push(
        { label: 'Pack SPF 50+ sunscreen, swimwear & sunglasses', category: 'PACKING' },
        { label: 'Waterproof phone pouch for beach sports', category: 'PACKING' }
      );
    } else if (destination.category === 'WILDLIFE') {
      autoChecklist.push(
        { label: 'Binoculars and mosquito repellent spray', category: 'PACKING' },
        { label: 'National park safari entry permits', category: 'DOCUMENTS' }
      );
    }

    await prisma.tripChecklistItem.createMany({
      data: autoChecklist.map((item) => ({
        tripId: trip.id,
        label: item.label,
        category: item.category,
        isDone: false,
        isAuto: true,
      })),
    });

    return this.getTripDashboard(userId, trip.id);
  }

  static async getTripDashboard(userId: string, tripId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        destination: {
          include: {
            travelGuide: true,
            emergencyDirectory: true,
            localPicks: true,
            seasonalInsights: true,
          },
        },
        checklist: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!trip || trip.userId !== userId) {
      throw { statusCode: 404, message: 'Trip workspace not found.' };
    }

    const hotelBookingIds: string[] = JSON.parse(trip.hotelBookingIds || '[]');
    const vehicleBookingIds: string[] = JSON.parse(trip.vehicleBookingIds || '[]');

    // Fetch linked bookings with price breakdown
    const [hotels, vehicles, liveInfo] = await Promise.all([
      hotelBookingIds.length > 0
        ? prisma.hotelBooking.findMany({
            where: { id: { in: hotelBookingIds } },
            include: { hotel: true, room: true, priceBreakdown: true, payment: true },
          })
        : [],
      vehicleBookingIds.length > 0
        ? prisma.vehicleBooking.findMany({
            where: { id: { in: vehicleBookingIds } },
            include: { vehicle: true, priceBreakdown: true, payment: true },
          })
        : [],
      LiveInfoService.getDestinationLiveInfo(trip.destination.slug).catch(() => null),
    ]);

    return {
      trip: {
        id: trip.id,
        name: trip.name,
        startDate: trip.startDate,
        endDate: trip.endDate,
        notes: trip.notes,
        createdAt: trip.createdAt,
      },
      destination: {
        id: trip.destination.id,
        name: trip.destination.name,
        slug: trip.destination.slug,
        state: trip.destination.state,
        category: trip.destination.category,
        description: trip.destination.description,
        images: JSON.parse(trip.destination.images),
        travelGuide: trip.destination.travelGuide
          ? {
              highlights: JSON.parse(trip.destination.travelGuide.highlights),
              bestTimeToVisit: trip.destination.travelGuide.bestTimeToVisit,
              localTips: JSON.parse(trip.destination.travelGuide.localTips),
              sampleItinerary: JSON.parse(trip.destination.travelGuide.sampleItinerary),
            }
          : null,
        emergencyDirectory: trip.destination.emergencyDirectory,
        localPicks: trip.destination.localPicks,
        seasonalInsights: trip.destination.seasonalInsights,
      },
      bookings: {
        hotels: hotels.map((h) => ({
          ...h,
          hotel: { ...h.hotel, images: JSON.parse(h.hotel.images) },
          room: { ...h.room, images: JSON.parse(h.room.images) },
        })),
        vehicles: vehicles.map((v) => ({
          ...v,
          vehicle: { ...v.vehicle, images: JSON.parse(v.vehicle.images) },
        })),
      },
      checklist: trip.checklist,
      liveInfo,
    };
  }

  static async toggleChecklistItem(userId: string, tripId: string, itemId: string) {
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip || trip.userId !== userId) {
      throw { statusCode: 404, message: 'Trip not found.' };
    }

    const item = await prisma.tripChecklistItem.findUnique({ where: { id: itemId } });
    if (!item || item.tripId !== tripId) {
      throw { statusCode: 404, message: 'Checklist item not found.' };
    }

    return prisma.tripChecklistItem.update({
      where: { id: itemId },
      data: { isDone: !item.isDone },
    });
  }

  static async addChecklistItem(
    userId: string,
    tripId: string,
    data: { label: string; category?: string }
  ) {
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip || trip.userId !== userId) {
      throw { statusCode: 404, message: 'Trip not found.' };
    }

    return prisma.tripChecklistItem.create({
      data: {
        tripId,
        label: data.label,
        category: data.category || 'GENERAL',
        isDone: false,
        isAuto: false,
      },
    });
  }
}
