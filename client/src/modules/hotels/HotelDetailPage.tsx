import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  MapPin,
  CheckCircle2,
  Calendar,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Share2,
  Heart,
  MessageSquare,
  Send,
} from 'lucide-react';
import { api } from '../../utils/api';
import { Hotel, HotelRoom } from '../../types';
import { InteractiveMap } from '../map/InteractiveMap';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import { fallbackHotels } from '../../utils/fallbackData';

export const HotelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, openAuthModal } = useAuthStore();
  const { openHotelCheckout, checkInDate, checkOutDate, setDates, guestCount, setGuestCount } =
    useBookingStore();

  const initialHotel = fallbackHotels.find((h) => h.id === id) || fallbackHotels[0];
  const [hotel, setHotel] = useState<Hotel | null>(initialHotel);
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(
    initialHotel.rooms && initialHotel.rooms.length > 0 ? initialHotel.rooms[0] : null
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Review state
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await api.get(`/hotels/${id}`);
        if (res.data?.data) {
          setHotel(res.data.data);
          if (res.data.data.rooms?.length > 0) {
            setSelectedRoom(res.data.data.rooms[0]);
          }
        }
      } catch (err) {
        const fallback = fallbackHotels.find((h) => h.id === id) || fallbackHotels[0];
        setHotel(fallback);
        if (fallback.rooms?.length) setSelectedRoom(fallback.rooms[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [id]);

  if (loading || !hotel) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-500">Loading hotel details & rooms...</p>
      </div>
    );
  }

  // Calculate nights
  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const roomPrice = selectedRoom ? selectedRoom.pricePerNight * nights : 0;
  const taxes = Math.round(roomPrice * 0.12);
  const serviceFee = Math.round(roomPrice * 0.03);
  const totalPayable = roomPrice + taxes + serviceFee;

  const handleBookNow = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (!selectedRoom) return;
    setBookingLoading(true);

    try {
      const payload = {
        hotelId: hotel.id,
        roomId: selectedRoom.id,
        checkInDate,
        checkOutDate,
        guestCount,
      };

      const res = await api.post('/bookings/hotels', payload);
      const { booking, paymentOrder } = res.data.data;
      openHotelCheckout(hotel, selectedRoom, booking, paymentOrder);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to initiate hotel booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (!userComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await api.post('/bookings/reviews', {
        targetType: 'hotel',
        targetId: hotel.id,
        rating: userRating,
        comment: userComment,
      });

      setHotel({
        ...hotel,
        reviews: [res.data.data, ...(hotel.reviews || [])],
      });
      setUserComment('');
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
        'Verified reviews only: You must have a confirmed stay to leave a review.'
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Navigation breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/hotels"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all Stays
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                alert('Hotel link copied to clipboard!');
              }
            }}
            className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title & Location Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase font-extrabold tracking-wider bg-brand-50 text-brand-700 px-3 py-1 rounded-full border border-brand-200">
            {hotel.destination?.name || 'India'}
          </span>
          <div className="flex items-center gap-1 bg-amber-50 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            {hotel.rating} ({hotel.reviewCount || 0} reviews)
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {hotel.name}
        </h1>

        <p className="text-sm text-slate-500 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" />
          {hotel.address}
        </p>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 h-[420px] rounded-3xl overflow-hidden shadow-sm">
          <img
            src={hotel.images[activeImageIndex] || hotel.images[0]}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="grid grid-cols-3 md:grid-cols-1 gap-4">
          {hotel.images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImageIndex(idx)}
              className={`h-[125px] rounded-2xl overflow-hidden border-2 transition-all ${
                activeImageIndex === idx
                  ? 'border-brand-600 ring-2 ring-brand-400'
                  : 'border-transparent opacity-80 hover:opacity-100'
              }`}
            >
              <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid: Details vs Sticky Booking Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Description, Amenities, Rooms, Location */}
        <div className="lg:col-span-2 space-y-10">
          {/* About */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-xl font-black text-slate-900">About this Property</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{hotel.description}</p>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Key Amenities & Comforts
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {hotel.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Room Selector */}
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Select Your Room Type
            </h2>

            <div className="space-y-4">
              {hotel.rooms?.map((room) => {
                const isSelected = selectedRoom?.id === room.id;
                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col md:flex-row gap-6 ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/20 shadow-md ring-1 ring-brand-500'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={room.images[0] || hotel.images[0]}
                      alt={room.roomType}
                      className="w-full md:w-44 h-36 rounded-2xl object-cover"
                    />

                    <div className="flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-bold text-slate-900">{room.roomType}</h3>
                          <span className="text-lg font-black text-brand-700">
                            ₹{room.pricePerNight.toLocaleString('en-IN')}{' '}
                            <span className="text-xs font-normal text-slate-400">/ night</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>Max {room.capacity} Guests</span>
                          <span>•</span>
                          <span>{room.totalRooms} rooms total</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {room.amenities.map((a, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md shadow-xs"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Map */}
          <div className="space-y-3">
            <h2 className="text-xl font-black text-slate-900">Property Location</h2>
            <InteractiveMap
              center={[hotel.latitude, hotel.longitude]}
              zoom={14}
              className="h-[300px]"
              markers={[
                {
                  id: hotel.id,
                  lat: hotel.latitude,
                  lng: hotel.longitude,
                  title: hotel.name,
                  subtitle: hotel.address,
                  price: hotel.startingPrice,
                },
              ]}
            />
          </div>

          {/* Customer Reviews */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">
                Verified Guest Reviews ({hotel.reviews?.length || 0})
              </h2>
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {hotel.rating} out of 5.0
              </div>
            </div>

            {/* Post Review Box */}
            <form
              onSubmit={handleReviewSubmit}
              className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Leave a Review
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="p-0.5 text-amber-500 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= userRating ? 'fill-amber-500' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={2}
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Share your stay experience, room comfort, hospitality..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Post Review
                </button>
              </div>
            </form>

            {/* Reviews List */}
            <div className="space-y-4 divide-y divide-slate-100">
              {hotel.reviews?.map((rev) => (
                <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          rev.user?.avatarUrl ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                        }
                        alt={rev.user?.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900">{rev.user?.name}</p>
                          {rev.isVerifiedStay && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Verified Stay
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Sticky Booking Summary Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-lg space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs uppercase font-bold text-slate-400">Total Calculation</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900">
                  ₹{totalPayable.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  ({nights} {nights === 1 ? 'night' : 'nights'} all-in)
                </span>
              </div>
            </div>

            {/* Dates & Guests selector */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setDates(e.target.value, checkOutDate)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Check-out Date
                </label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setDates(checkInDate, e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Guests
                </label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                  <option value={3}>3 Guests</option>
                  <option value={4}>4+ Guests</option>
                </select>
              </div>
            </div>

            {/* Transparent Cost Breakdown */}
            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs border border-slate-100">
              <div className="flex items-center justify-between font-bold text-slate-700 pb-1 border-b border-slate-200">
                <span>Transparent Itemized Quote</span>
                <span className="text-[10px] text-emerald-600 font-black uppercase">No Surprise Fees</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>
                  {selectedRoom?.roomType} x {nights} {nights === 1 ? 'night' : 'nights'}
                </span>
                <span className="font-semibold text-slate-800">
                  ₹{roomPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST & Tourism Cess (12%)</span>
                <span className="font-semibold text-slate-800">
                  ₹{taxes.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Concierge & Support Fee (3%)</span>
                <span className="font-semibold text-slate-800">
                  ₹{serviceFee.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-slate-900">
                <span>All-Inclusive Total Due</span>
                <span className="text-brand-700 text-base">₹{totalPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Book CTA */}
            <button
              type="button"
              onClick={handleBookNow}
              disabled={bookingLoading}
              className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              {bookingLoading ? 'Securing Room...' : 'Reserve with Razorpay'}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Instant Confirmation • Free Cancellation within 24h
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
