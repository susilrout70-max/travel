export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'GUEST' | 'USER' | 'ADMIN' | 'PARTNER';
  avatarUrl?: string;
  preferences?: {
    preferredCategories?: string[];
    budgetLevel?: string;
    travelStyle?: string;
  } | null;
  createdAt: string;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  category: 'NATURE' | 'ADVENTURE' | 'CULTURAL' | 'BEACH' | 'HILL_STATION' | 'WILDLIFE' | 'URBAN';
  description: string;
  country: string;
  state: string;
  latitude: number;
  longitude: number;
  images: string[];
  bestSeason: string;
  trendingScore: number;
  hotelCount?: number;
  isWishlisted?: boolean;
  recommendationReason?: string;
  travelGuide?: TravelGuide | null;
  hotels?: Hotel[];
  liveCaches?: any[];
}

export interface TravelGuide {
  id: string;
  destinationId: string;
  highlights: string[];
  bestTimeToVisit: string;
  localTips: string[];
  sampleItinerary: Array<{
    day: number;
    title: string;
    plan: string;
  }>;
}

export interface HotelRoom {
  id: string;
  hotelId: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  totalRooms: number;
  amenities: string[];
  images: string[];
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  isVerifiedStay?: boolean;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface Hotel {
  id: string;
  destinationId: string;
  destination?: {
    id: string;
    name: string;
    slug: string;
    state: string;
    category: string;
  };
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  images: string[];
  amenities: string[];
  startingPrice?: number;
  reviewCount?: number;
  rooms?: HotelRoom[];
  reviews?: Review[];
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'CAR' | 'BIKE';
  brand: string;
  modelYear: number;
  pricePerHour: number;
  pricePerDay: number;
  securityHold: number;
  fuelType: string;
  transmission: string;
  seatingCapacity: number;
  city: string;
  currentLat: number;
  currentLng: number;
  images: string[];
  isAvailable: boolean;
}

export interface HotelBooking {
  id: string;
  userId: string;
  hotelId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  voucherUrl?: string;
  createdAt: string;
  hotel: Hotel;
  room: HotelRoom;
  payment?: Payment;
}

export interface VehicleBooking {
  id: string;
  userId: string;
  vehicleId: string;
  startTime: string;
  endTime: string;
  pickupLocation: string;
  dropLocation: string;
  withDriver: boolean;
  totalPrice: number;
  securityDeposit: number;
  status: 'PENDING' | 'CONFIRMED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  createdAt: string;
  vehicle: Vehicle;
  payment?: Payment;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  provider: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
}

export interface TripSharePin {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
  description?: string;
  timestamp: string;
}

export interface TripShare {
  id: string;
  title: string;
  shareToken: string;
  isActive: boolean;
  expiresAt: string;
  isExpired?: boolean;
  pinCount?: number;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  pins?: TripSharePin[];
}

export interface LivePulseData {
  destination: {
    id: string;
    name: string;
    slug: string;
    category: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  pulse: {
    weather: {
      temperature: number;
      feelsLike: number;
      condition: string;
      humidity: number;
      windSpeedKmH: number;
      uvIndex: number;
      airQualityIndex: string;
      forecast: Array<{
        day: string;
        high: number;
        low: number;
        condition: string;
      }>;
      lastUpdated: string;
      source: string;
    };
    traffic: {
      congestionLevel: 'LOW' | 'MODERATE' | 'HEAVY';
      congestionIndexPercent: number;
      averageSpeedKmh: number;
      peakHours: string;
      bestTravelWindow: string;
      liveAlerts: string[];
      lastUpdated: string;
      source: string;
    };
    wildlife: {
      regionName: string;
      speciesCount: number;
      spottingProbability: string;
      featuredFauna: Array<{
        name: string;
        status: string;
        sightingRate: string;
        bestTime: string;
      }>;
      lastUpdated: string;
      source: string;
    };
    landscape: {
      images: string[];
      curatedBy: string;
      totalPhotos: number;
    };
    crowd?: {
      level: 'LOW' | 'MODERATE' | 'HIGH';
      percent: number;
      advice: string;
      source: string;
      lastUpdated: string;
    };
  };
}
