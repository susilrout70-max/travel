import { User, Payment } from './index';

export interface AdminStats {
  metrics: {
    totalUsers: number;
    totalBookings: number;
    totalHotelBookings: number;
    totalVehicleBookings: number;
    activeSessionsCount: number;
    totalRevenue: number;
  };
  breakdowns: {
    usersByRole: Array<{ role: string; count: number }>;
    hotelStatuses: Array<{ status: string; count: number; totalAmount: number }>;
    vehicleStatuses: Array<{ status: string; count: number; totalAmount: number }>;
  };
  recentBookings: Array<{
    id: string;
    bookingType: 'HOTEL' | 'VEHICLE';
    customerName: string;
    customerEmail: string;
    customerAvatar?: string;
    itemTitle: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    avatarUrl?: string;
    _count: {
      hotelBookings: number;
      vehicleBookings: number;
    };
  }>;
}

export interface AdminBookingItem {
  id: string;
  bookingType: 'HOTEL' | 'VEHICLE';
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    role: string;
  };
  item: {
    id: string;
    name: string;
    roomType?: string;
    destination?: string;
    state?: string;
    type?: string;
    city?: string;
    image?: string;
  };
  dates: {
    start: string;
    end: string;
    details: string;
  };
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  voucherUrl?: string | null;
  payment?: Payment | null;
  createdAt: string;
}

export interface AdminUserItem {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'GUEST' | 'USER' | 'ADMIN' | 'PARTNER';
  isEmailVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  totalBookings: number;
  activeSessions: number;
}

export interface AdminSessionItem {
  id: string;
  familyId: string;
  isRevoked: boolean;
  isExpired: boolean;
  isActive: boolean;
  createdAt: string;
  expiresAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
  };
}
