import { prisma } from '../../utils/prisma';
import { serverFallbackDestinations } from '../../utils/seedData';

export class RecommendationsService {
  static async getRecommendations(userId?: string) {
    let allDestinations: any[] = [];
    try {
      allDestinations = await prisma.destination.findMany({
        include: {
          _count: { select: { hotels: true } },
        },
      });
    } catch (dbErr) {
      console.warn('Database offline/unreachable, serving verified destinations');
      allDestinations = serverFallbackDestinations.map((d) => ({
        ...d,
        images: JSON.stringify(d.images),
        _count: { hotels: d.hotelCount },
      }));
    }

    let preferredCategories: string[] = [];

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          wishlists: {
            include: { destination: true },
          },
          hotelBookings: {
            include: { hotel: { include: { destination: true } } },
          },
        },
      });

      if (user?.preferences) {
        try {
          const pref = JSON.parse(user.preferences);
          if (Array.isArray(pref.preferredCategories)) {
            preferredCategories = pref.preferredCategories;
          }
        } catch (e) {
          // ignore
        }
      }

      // Add categories from user wishlist & past bookings
      user?.wishlists.forEach((w) => {
        if (!preferredCategories.includes(w.destination.category)) {
          preferredCategories.push(w.destination.category);
        }
      });
      user?.hotelBookings.forEach((b) => {
        if (!preferredCategories.includes(b.hotel.destination.category)) {
          preferredCategories.push(b.hotel.destination.category);
        }
      });
    }

    // Current month determination for seasonality
    const month = new Date().getMonth(); // 0-11
    const isWinter = month >= 10 || month <= 2;
    const isSummer = month >= 3 && month <= 6;
    const isMonsoon = month >= 7 && month <= 9;

    const scored = allDestinations.map((dest) => {
      let score = dest.trendingScore;
      let reason = 'Trending hotspot chosen by thousands of travelers';

      // Category affinity boost
      if (preferredCategories.includes(dest.category)) {
        score += 30;
        reason = `Matches your preference for ${dest.category.replace('_', ' ').toLowerCase()} escapes`;
      }

      // Seasonal boost
      if (isWinter && (dest.category === 'BEACH' || dest.category === 'CULTURAL' || dest.category === 'WILDLIFE')) {
        score += 15;
        if (!preferredCategories.includes(dest.category)) {
          reason = `Peak winter season with warm sunshine and pleasant climate`;
        }
      } else if (isSummer && (dest.category === 'HILL_STATION' || dest.slug === 'leh-ladakh')) {
        score += 20;
        if (!preferredCategories.includes(dest.category)) {
          reason = `Perfect high-altitude summer retreat away from the heat`;
        }
      }

      return {
        ...dest,
        images: JSON.parse(dest.images),
        hotelCount: dest._count.hotels,
        recommendationScore: score,
        recommendationReason: reason,
        reasonTag: reason,
        isSponsored: false,
        sourceLabel: 'Verified Organic Ranking',
      };
    });

    scored.sort((a, b) => b.recommendationScore - a.recommendationScore);
    return scored;
  }
}
