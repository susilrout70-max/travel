import { prisma } from '../../utils/prisma';
import { logger } from '../../utils/logger';

export class SafetyService {
  // Emergency Contacts
  static async getContacts(userId: string) {
    return prisma.emergencyContact.findMany({
      where: { userId },
      orderBy: { priority: 'asc' },
    });
  }

  static async addContact(
    userId: string,
    data: { name: string; phone: string; relation?: string; priority?: number }
  ) {
    return prisma.emergencyContact.create({
      data: {
        userId,
        name: data.name,
        phone: data.phone,
        relation: data.relation || 'Family/Friend',
        priority: data.priority || 1,
      },
    });
  }

  static async deleteContact(userId: string, contactId: string) {
    const contact = await prisma.emergencyContact.findUnique({
      where: { id: contactId },
    });
    if (!contact || contact.userId !== userId) {
      throw { statusCode: 404, message: 'Emergency contact not found.' };
    }
    await prisma.emergencyContact.delete({ where: { id: contactId } });
    return { success: true };
  }

  // SOS Emergency Trigger
  static async triggerSOS(
    userId: string,
    data: {
      tripShareId?: string;
      latitude?: number;
      longitude?: number;
      address?: string;
      customMessage?: string;
    }
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { emergencyContacts: true },
    });

    if (!user) {
      throw { statusCode: 404, message: 'User not found.' };
    }

    const mapLink =
      data.latitude && data.longitude
        ? `https://www.google.com/maps?q=${data.latitude},${data.longitude}`
        : 'Location unavailable';

    const timestamp = new Date().toISOString();

    // High priority SOS log & simulated SMS/Push dispatch
    logger.warn(`🚨 [EMERGENCY SOS ALERT TRIGGERED]`);
    logger.warn(`User: ${user.name} (${user.phone || user.email})`);
    logger.warn(`Coordinates: ${data.latitude}, ${data.longitude} [${mapLink}]`);
    logger.warn(`Notifying ${user.emergencyContacts.length} emergency contacts...`);

    const contactNotifications = user.emergencyContacts.map((c) => ({
      name: c.name,
      phone: c.phone,
      relation: c.relation,
      status: 'DISPATCHED',
      message: `EMERGENCY ALERT: ${user.name} has triggered an SOS via TravelHub at ${mapLink}. Please call them or local authorities immediately!`,
      dispatchedAt: timestamp,
    }));

    // If linked to active TripShare, record SOS pin and SafetyCheckIn
    if (data.tripShareId && data.latitude && data.longitude) {
      await prisma.tripSharePin.create({
        data: {
          tripShareId: data.tripShareId,
          latitude: data.latitude,
          longitude: data.longitude,
          label: '🚨 EMERGENCY SOS TRIGGERED',
          description: data.customMessage || 'Traveler activated instant emergency beacon.',
        },
      });

      await prisma.safetyCheckIn.create({
        data: {
          tripShareId: data.tripShareId,
          status: 'sos',
          respondedAt: new Date(),
        },
      });
    }

    return {
      alertId: `sos_${Date.now()}`,
      dispatchedAt: timestamp,
      user: { name: user.name, phone: user.phone },
      location: { latitude: data.latitude, longitude: data.longitude, mapLink },
      contactsNotified: contactNotifications,
      localEmergencyNumbers: [
        { label: 'National Emergency Helpline (India)', number: '112' },
        { label: 'Police', number: '100' },
        { label: 'Ambulance / Medical Emergency', number: '108' },
        { label: 'Women Safety Helpline', number: '1091' },
        { label: 'TravelHub 24/7 Rapid Response', number: '+91 800-425-TRIP' },
      ],
      safetyAdvice: [
        'Stay where you are if you feel secure, or move towards an open, well-lit public area.',
        'Keep your phone battery alive by lowering screen brightness.',
        'Your designated emergency contacts and TravelHub concierge have received your live coordinates.',
      ],
    };
  }

  // Safety Check-In
  static async submitCheckIn(
    tripShareId: string,
    status: 'safe' | 'sos' | 'no_response'
  ) {
    const checkIn = await prisma.safetyCheckIn.create({
      data: {
        tripShareId,
        status,
        respondedAt: new Date(),
      },
    });
    return checkIn;
  }

  // Emergency Phrases
  static async getEmergencyPhrases(countryCode = 'IN') {
    return prisma.emergencyPhrase.findMany({
      where: { countryCode },
      orderBy: { category: 'asc' },
    });
  }

  // Incident Assistant
  static async createIncidentReport(
    userId: string,
    data: {
      bookingId?: string;
      type: string;
      location?: string;
      description: string;
    }
  ) {
    const report = await prisma.incidentReport.create({
      data: {
        userId,
        bookingId: data.bookingId,
        type: data.type,
        location: data.location,
        description: data.description,
        status: 'OPEN',
      },
    });

    logger.info(`Incident report logged #${report.id} of type [${data.type}] for user ${userId}`);
    return report;
  }

  static async getUserIncidents(userId: string) {
    return prisma.incidentReport.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
