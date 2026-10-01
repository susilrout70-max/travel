import { prisma } from '../../utils/prisma';
import { serverFallbackVehicles } from '../../utils/seedData';

export class VehiclesService {
  static async search(params: {
    type?: 'CAR' | 'BIKE' | 'ALL';
    city?: string;
    fuelType?: string;
    transmission?: string;
    maxDailyPrice?: number;
    sortBy?: 'price_asc' | 'price_desc' | 'popular';
  }) {
    const { type, city, fuelType, transmission, maxDailyPrice, sortBy } = params;

    try {
      const where: any = { isAvailable: true };

      if (type && type !== 'ALL') {
        where.type = type;
      }
      if (city) {
        where.city = { contains: city };
      }
      if (fuelType && fuelType !== 'ALL') {
        where.fuelType = fuelType;
      }
      if (transmission && transmission !== 'ALL') {
        where.transmission = transmission;
      }
      if (maxDailyPrice) {
        where.pricePerDay = { lte: Number(maxDailyPrice) };
      }

      let orderBy: any = { pricePerDay: 'asc' };
      if (sortBy === 'price_desc') {
        orderBy = { pricePerDay: 'desc' };
      } else if (sortBy === 'price_asc') {
        orderBy = { pricePerDay: 'asc' };
      }

      const vehicles = await prisma.vehicle.findMany({
        where,
        orderBy,
      });

      if (vehicles.length > 0) {
        return vehicles.map((v) => ({
          ...v,
          images: typeof v.images === 'string' && v.images.startsWith('[') ? JSON.parse(v.images) : v.images,
        }));
      }
    } catch (e) {
      console.warn('Database offline, using fallback vehicles list');
    }

    let filtered = [...serverFallbackVehicles];
    if (type && type !== 'ALL') {
      filtered = filtered.filter((v) => v.type === type);
    }
    if (city) {
      filtered = filtered.filter((v) => v.city.toLowerCase().includes(city.toLowerCase()));
    }
    if (transmission && transmission !== 'ALL') {
      filtered = filtered.filter((v) => v.transmission === transmission);
    }
    if (fuelType && fuelType !== 'ALL') {
      filtered = filtered.filter((v) => v.fuelType === fuelType);
    }
    return filtered;
  }

  static async getById(id: string) {
    try {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id },
      });

      if (vehicle) {
        return {
          ...vehicle,
          images: typeof vehicle.images === 'string' && vehicle.images.startsWith('[') ? JSON.parse(vehicle.images) : vehicle.images,
        };
      }
    } catch (e) {
      console.warn('Database offline, using fallback vehicle for', id);
    }

    const fallback = serverFallbackVehicles.find((v) => v.id === id) || serverFallbackVehicles[0];
    return fallback;
  }
}
