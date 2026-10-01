import { create } from 'zustand';
import { Hotel, HotelRoom, Vehicle } from '../types';

interface BookingState {
  // Search state
  searchCategory: 'HOTELS' | 'VEHICLES';
  searchDestination: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  vehicleType: 'ALL' | 'CAR' | 'BIKE';
  vehicleCity: string;

  // Active Draft
  selectedHotel: Hotel | null;
  selectedRoom: HotelRoom | null;
  selectedVehicle: Vehicle | null;

  // Checkout modal
  isCheckoutOpen: boolean;
  checkoutType: 'HOTEL' | 'VEHICLE' | null;
  checkoutBookingData: any | null;
  paymentOrder: any | null;

  setSearchCategory: (category: 'HOTELS' | 'VEHICLES') => void;
  setSearchDestination: (destination: string) => void;
  setDates: (checkIn: string, checkOut: string) => void;
  setGuestCount: (count: number) => void;
  setVehicleType: (type: 'ALL' | 'CAR' | 'BIKE') => void;
  setVehicleCity: (city: string) => void;

  openHotelCheckout: (hotel: Hotel, room: HotelRoom, bookingData: any, paymentOrder: any) => void;
  openVehicleCheckout: (vehicle: Vehicle, bookingData: any, paymentOrder: any) => void;
  closeCheckout: () => void;
}

const getDefaultDates = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);

  return {
    checkIn: tomorrow.toISOString().split('T')[0],
    checkOut: dayAfter.toISOString().split('T')[0],
  };
};

const defaultDates = getDefaultDates();

export const useBookingStore = create<BookingState>((set) => ({
  searchCategory: 'HOTELS',
  searchDestination: '',
  checkInDate: defaultDates.checkIn,
  checkOutDate: defaultDates.checkOut,
  guestCount: 2,
  vehicleType: 'ALL',
  vehicleCity: '',

  selectedHotel: null,
  selectedRoom: null,
  selectedVehicle: null,

  isCheckoutOpen: false,
  checkoutType: null,
  checkoutBookingData: null,
  paymentOrder: null,

  setSearchCategory: (category) => set({ searchCategory: category }),
  setSearchDestination: (dest) => set({ searchDestination: dest }),
  setDates: (checkIn, checkOut) => set({ checkInDate: checkIn, checkOutDate: checkOut }),
  setGuestCount: (count) => set({ guestCount: count }),
  setVehicleType: (type) => set({ vehicleType: type }),
  setVehicleCity: (city) => set({ vehicleCity: city }),

  openHotelCheckout: (hotel, room, bookingData, paymentOrder) =>
    set({
      isCheckoutOpen: true,
      checkoutType: 'HOTEL',
      selectedHotel: hotel,
      selectedRoom: room,
      checkoutBookingData: bookingData,
      paymentOrder,
    }),

  openVehicleCheckout: (vehicle, bookingData, paymentOrder) =>
    set({
      isCheckoutOpen: true,
      checkoutType: 'VEHICLE',
      selectedVehicle: vehicle,
      checkoutBookingData: bookingData,
      paymentOrder,
    }),

  closeCheckout: () =>
    set({
      isCheckoutOpen: false,
      checkoutType: null,
      checkoutBookingData: null,
      paymentOrder: null,
    }),
}));
