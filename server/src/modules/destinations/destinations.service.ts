import { prisma } from '../../utils/prisma';
import { serverFallbackDestinations } from '../../utils/seedData';

export class DestinationsService {
  static async getAll(params: {
    category?: string;
    search?: string;
    limit?: number;
    sortBy?: 'trending' | 'name';
  }) {
    const { category, search, limit = 20, sortBy = 'trending' } = params;

    try {
      const where: any = {};
      if (category && category !== 'ALL') {
        where.category = category;
      }
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { state: { contains: search } },
          { description: { contains: search } },
        ];
      }

      const destinations = await prisma.destination.findMany({
        where,
        take: limit,
        orderBy: sortBy === 'trending' ? { trendingScore: 'desc' } : { name: 'asc' },
        include: {
          _count: {
            select: { hotels: true },
          },
        },
      });

      if (destinations.length > 0) {
        return destinations.map((d) => ({
          ...d,
          images: typeof d.images === 'string' && d.images.startsWith('[') ? JSON.parse(d.images) : d.images,
          hotelCount: d._count?.hotels || 0,
        }));
      }
    } catch (e) {
      console.warn('Database offline, using fallback destinations list');
    }

    let filtered = [...serverFallbackDestinations];
    if (category && category !== 'ALL') {
      filtered = filtered.filter((d) => d.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.state.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
      );
    }
    return filtered.slice(0, limit);
  }

  static async getBySlug(slug: string, userId?: string) {
    try {
      const dest = await prisma.destination.findUnique({
        where: { slug },
        include: {
          travelGuide: true,
          localPicks: { orderBy: { upvotes: 'desc' } },
          seasonalInsights: { orderBy: { month: 'asc' } },
          emergencyDirectory: true,
          hotels: {
            include: {
              rooms: true,
              _count: { select: { reviews: true } },
            },
          },
          liveCaches: true,
        },
      });

      if (dest) {
        let isWishlisted = false;
        if (userId) {
          try {
            const wish = await prisma.wishlist.findUnique({
              where: {
                userId_destinationId: {
                  userId,
                  destinationId: dest.id,
                },
              },
            });
            isWishlisted = !!wish;
          } catch (e) {}
        }

        return {
          ...dest,
          images: typeof dest.images === 'string' && dest.images.startsWith('[') ? JSON.parse(dest.images) : dest.images,
          isWishlisted,
          travelGuide: dest.travelGuide
            ? {
                ...dest.travelGuide,
                highlights: JSON.parse(dest.travelGuide.highlights),
                localTips: JSON.parse(dest.travelGuide.localTips),
                sampleItinerary: JSON.parse(dest.travelGuide.sampleItinerary),
              }
            : null,
          hotels: dest.hotels.map((h) => ({
            ...h,
            images: JSON.parse(h.images),
            amenities: JSON.parse(h.amenities),
            rooms: h.rooms.map((r) => ({
              ...r,
              amenities: JSON.parse(r.amenities),
              images: JSON.parse(r.images),
            })),
          })),
        };
      }
    } catch (e) {
      console.warn('Database offline, using fallback destination detail for', slug);
    }

    const fallback = serverFallbackDestinations.find((d) => d.slug === slug);
    if (!fallback) {
      throw { statusCode: 404, message: `Destination '${slug}' not found.` };
    }
    return fallback;
  }

  private static async resolveDestinationId(idOrSlug: string): Promise<string> {
    const dest = await prisma.destination.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug.toLowerCase() }],
      },
      select: { id: true },
    });
    return dest ? dest.id : idOrSlug;
  }

  static async getLocalPicks(idOrSlug: string, sort: 'upvotes' | 'recent' = 'upvotes') {
    const destinationId = await this.resolveDestinationId(idOrSlug);
    return prisma.localPick.findMany({
      where: { destinationId },
      orderBy: sort === 'recent' ? { createdAt: 'desc' } : { upvotes: 'desc' },
    });
  }

  static async upvoteLocalPick(pickId: string) {
    const pick = await prisma.localPick.findUnique({ where: { id: pickId } });
    if (!pick) {
      throw { statusCode: 404, message: 'Local pick spot not found.' };
    }
    return prisma.localPick.update({
      where: { id: pickId },
      data: { upvotes: pick.upvotes + 1 },
    });
  }

  static async getSeasonalInsights(idOrSlug: string) {
    const destinationId = await this.resolveDestinationId(idOrSlug);
    return prisma.seasonalInsight.findMany({
      where: { destinationId },
      orderBy: { month: 'asc' },
    });
  }

  static async getEmergencyDirectory(idOrSlug: string) {
    const destinationId = await this.resolveDestinationId(idOrSlug);
    return prisma.emergencyDirectory.findMany({
      where: { destinationId },
      orderBy: { type: 'asc' },
    });
  }

  static async toggleWishlist(userId: string, destinationId: string) {
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_destinationId: {
          userId,
          destinationId,
        },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      return { isWishlisted: false };
    } else {
      await prisma.wishlist.create({
        data: {
          userId,
          destinationId,
        },
      });
      return { isWishlisted: true };
    }
  }

  static async getUserWishlist(userId: string) {
    const items = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        destination: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => ({
      id: item.id,
      destination: {
        ...item.destination,
        images: JSON.parse(item.destination.images),
      },
      createdAt: item.createdAt,
    }));
  }
}
