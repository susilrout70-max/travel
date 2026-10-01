import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  User,
  CalendarCheck,
  Heart,
  Settings,
  Hotel,
  Car,
  FileText,
  XCircle,
  CheckCircle2,
  Download,
  Printer,
  ShieldCheck,
  Sparkles,
  LayoutDashboard,
  Users,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../utils/api';
import { HotelBooking, VehicleBooking, Destination } from '../../types';
import { AdminStats } from '../../types/admin';
import { useAuthStore } from '../../store/authStore';
import { AdminOverview } from '../admin/AdminOverview';
import { AdminBookings } from '../admin/AdminBookings';
import { AdminUsers } from '../admin/AdminUsers';
import { AdminSessions } from '../admin/AdminSessions';

export const ProfilePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, openAuthModal, fetchMe } = useAuthStore();

  const isAdmin = user?.role === 'ADMIN';

  type TabType =
    | 'ADMIN_OVERVIEW'
    | 'ADMIN_BOOKINGS'
    | 'ADMIN_USERS'
    | 'ADMIN_SESSIONS'
    | 'BOOKINGS'
    | 'WISHLIST'
    | 'PREFERENCES';

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const tabParam = searchParams.get('tab')?.toUpperCase();
    if (tabParam) return tabParam as any;
    return 'BOOKINGS';
  });

  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [adminStatsLoading, setAdminStatsLoading] = useState(false);

  const [hotelBookings, setHotelBookings] = useState<HotelBooking[]>([]);
  const [vehicleBookings, setVehicleBookings] = useState<VehicleBooking[]>([]);
  const [wishlist, setWishlist] = useState<Array<{ id: string; destination: Destination }>>([]);
  const [loading, setLoading] = useState(true);

  // Voucher modal state
  const [activeVoucherBooking, setActiveVoucherBooking] = useState<HotelBooking | null>(null);

  // Preferences form
  const [preferredCats, setPreferredCats] = useState<string[]>(
    user?.preferences?.preferredCategories || ['HILL_STATION', 'NATURE']
  );
  const [savingPref, setSavingPref] = useState(false);

  const fetchData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const promises: Promise<any>[] = [
        api.get('/bookings/my-bookings'),
        api.get('/destinations/wishlist'),
      ];

      if (user?.role === 'ADMIN') {
        promises.push(api.get('/admin/stats'));
      }

      const [bookingsRes, wishRes, statsRes] = await Promise.all(promises);

      setHotelBookings(bookingsRes.data.data.hotelBookings);
      setVehicleBookings(bookingsRes.data.data.vehicleBookings);
      setWishlist(wishRes.data.data);

      if (statsRes) {
        setAdminStats(statsRes.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (user?.role === 'ADMIN' && !searchParams.get('tab')) {
      setActiveTab('ADMIN_OVERVIEW');
    }
  }, [isAuthenticated, user?.role]);

  const handleCancelBooking = async (bookingType: 'HOTEL' | 'VEHICLE', bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? A 100% refund will be processed.')) {
      return;
    }

    try {
      await api.post('/bookings/cancel', { bookingType, bookingId });
      alert('Booking cancelled successfully. Refund initiated to original payment source.');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPref(true);
    try {
      await api.put('/auth/profile', {
        preferences: {
          preferredCategories: preferredCats,
          travelStyle: 'LEISURE',
        },
      });
      await fetchMe();
      alert('Travel preferences updated! Recommendations on homepage refreshed.');
    } catch (e) {
      alert('Failed to save preferences');
    } finally {
      setSavingPref(false);
    }
  };

  const toggleCategory = (cat: string) => {
    setPreferredCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
        <User className="w-12 h-12 text-brand-600 mx-auto" />
        <h2 className="text-2xl font-black text-slate-900">Sign in to View Dashboard</h2>
        <p className="text-xs text-slate-500">
          Access your confirmed hotel reservations, car/bike bookings, digital vouchers, and saved
          wishlists.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="w-full py-3 rounded-2xl bg-brand-600 text-white font-bold text-sm shadow-md hover:bg-brand-700"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={
              user?.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
            }
            alt={user?.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-brand-500 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{user?.name}</h1>
              <span className="text-[10px] uppercase font-bold bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-full border border-brand-200">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email} • {user?.phone || 'No phone'}</p>
          </div>
        </div>

        {/* Quick Stats */}
        {isAdmin && adminStats ? (
          <div className="flex flex-wrap items-center gap-2.5 text-center">
            <div className="bg-slate-900 text-white px-3.5 py-2 rounded-2xl border border-slate-800 shadow-sm">
              <span className="text-sm font-black block text-emerald-400">
                ₹{adminStats.metrics.totalRevenue.toLocaleString('en-IN')}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Platform Revenue</span>
            </div>
            <div className="bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200">
              <span className="text-sm font-black text-slate-900 block">
                {adminStats.metrics.totalBookings}
              </span>
              <span className="text-[9px] font-bold text-slate-500 uppercase">All Bookings</span>
            </div>
            <div className="bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200">
              <span className="text-sm font-black text-slate-900 block">
                {adminStats.metrics.totalUsers}
              </span>
              <span className="text-[9px] font-bold text-slate-500 uppercase">Users</span>
            </div>
            <div className="bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200">
              <span className="text-sm font-black text-slate-900 block">
                {adminStats.metrics.activeSessionsCount}
              </span>
              <span className="text-[9px] font-bold text-slate-500 uppercase">Live Sessions</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-center">
            <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
              <span className="text-lg font-black text-slate-900 block">
                {hotelBookings.length + vehicleBookings.length}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Bookings</span>
            </div>
            <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
              <span className="text-lg font-black text-slate-900 block">{wishlist.length}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Wishlist</span>
            </div>
          </div>
        )}
      </div>

      {/* Admin Operations Banner */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950 p-6 rounded-3xl border border-purple-800/40 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center flex-shrink-0 shadow-glow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Administrator Operations Console</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Full Privileges Active
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                You are logged in as a platform administrator. Manage all customer reservations, user accounts, and active security sessions directly below.
              </p>
            </div>
          </div>

          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all self-start md:self-auto flex-shrink-0"
          >
            <span>Open Fullscreen Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab('ADMIN_OVERVIEW')}
              className={`pb-4 px-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'ADMIN_OVERVIEW'
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-purple-600" />
              Platform Overview
            </button>

            <button
              onClick={() => setActiveTab('ADMIN_BOOKINGS')}
              className={`pb-4 px-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'ADMIN_BOOKINGS'
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CalendarCheck className="w-4 h-4 text-purple-600" />
              Manage All Bookings
            </button>

            <button
              onClick={() => setActiveTab('ADMIN_USERS')}
              className={`pb-4 px-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'ADMIN_USERS'
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4 text-purple-600" />
              Users & Roles
            </button>

            <button
              onClick={() => setActiveTab('ADMIN_SESSIONS')}
              className={`pb-4 px-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'ADMIN_SESSIONS'
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <KeyRound className="w-4 h-4 text-purple-600" />
              Logins & Security
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('BOOKINGS')}
          className={`pb-4 px-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'BOOKINGS'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Hotel className="w-4 h-4" />
          {isAdmin ? 'My Personal Stays' : 'My Bookings & Vouchers'}
        </button>

        <button
          onClick={() => setActiveTab('WISHLIST')}
          className={`pb-4 px-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'WISHLIST'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500" />
          Saved Wishlist ({wishlist.length})
        </button>

        <button
          onClick={() => setActiveTab('PREFERENCES')}
          className={`pb-4 px-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'PREFERENCES'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          Traveler Preferences
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {isAdmin && activeTab === 'ADMIN_OVERVIEW' && (
          <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
            <AdminOverview
              stats={adminStats}
              isLoading={adminStatsLoading}
              onNavigateTab={(tab) => {
                if (tab === 'bookings') setActiveTab('ADMIN_BOOKINGS');
                else if (tab === 'users') setActiveTab('ADMIN_USERS');
                else setActiveTab('ADMIN_SESSIONS');
              }}
            />
          </div>
        )}

        {isAdmin && activeTab === 'ADMIN_BOOKINGS' && (
          <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
            <AdminBookings />
          </div>
        )}

        {isAdmin && activeTab === 'ADMIN_USERS' && (
          <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
            <AdminUsers />
          </div>
        )}

        {isAdmin && activeTab === 'ADMIN_SESSIONS' && (
          <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
            <AdminSessions />
          </div>
        )}

        {activeTab === 'BOOKINGS' && (
          <div className="space-y-8">
            {/* Hotel Bookings */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Hotel className="w-5 h-5 text-brand-600" />
                Hotel Stays ({hotelBookings.length})
              </h3>

              {hotelBookings.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-2">
                  <p className="text-xs text-slate-500">No hotel bookings yet.</p>
                  <Link
                    to="/hotels"
                    className="inline-block text-xs font-bold text-brand-600 hover:text-brand-700"
                  >
                    Find Stays
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {hotelBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={booking.hotel?.images[0]}
                          alt={booking.hotel?.name}
                          className="w-20 h-20 rounded-2xl object-cover"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                booking.status === 'CONFIRMED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : booking.status === 'CANCELLED'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {booking.status}
                            </span>
                            <span className="text-xs text-slate-400">
                              Booked on {new Date(booking.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <h4 className="font-bold text-base text-slate-900">
                            {booking.hotel?.name}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">
                            {booking.room?.roomType} • {booking.guestCount} Guests
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(booking.checkInDate).toLocaleDateString()} —{' '}
                            {new Date(booking.checkOutDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end justify-between space-y-3">
                        <div className="text-left md:text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">
                            Amount Paid
                          </span>
                          <span className="text-xl font-black text-slate-900">
                            ₹{booking.totalPrice.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {booking.status === 'CONFIRMED' && (
                            <>
                              <button
                                type="button"
                                onClick={() => setActiveVoucherBooking(booking)}
                                className="px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                E-Voucher
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCancelBooking('HOTEL', booking.id)}
                                className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Bookings */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Car className="w-5 h-5 text-slate-900" />
                Car & Bike Rentals ({vehicleBookings.length})
              </h3>

              {vehicleBookings.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-2">
                  <p className="text-xs text-slate-500">No rental bookings yet.</p>
                  <Link
                    to="/vehicles"
                    className="inline-block text-xs font-bold text-brand-600 hover:text-brand-700"
                  >
                    Browse Fleet
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {vehicleBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={booking.vehicle?.images[0]}
                          alt={booking.vehicle?.name}
                          className="w-20 h-20 rounded-2xl object-cover"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                booking.status === 'CONFIRMED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : booking.status === 'CANCELLED'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {booking.status}
                            </span>
                            <span className="text-xs text-slate-400">
                              {booking.withDriver ? '• With Chauffeur' : '• Self Drive'}
                            </span>
                          </div>

                          <h4 className="font-bold text-base text-slate-900">
                            {booking.vehicle?.name}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Pickup: {booking.pickupLocation} • Drop: {booking.dropLocation}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(booking.startTime).toLocaleString()} —{' '}
                            {new Date(booking.endTime).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end justify-between space-y-3">
                        <div className="text-left md:text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">
                            Total Paid (incl. ₹{booking.securityDeposit} deposit)
                          </span>
                          <span className="text-xl font-black text-slate-900">
                            ₹{booking.totalPrice.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {booking.status === 'CONFIRMED' && (
                          <button
                            type="button"
                            onClick={() => handleCancelBooking('VEHICLE', booking.id)}
                            className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                          >
                            Cancel Rental
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Wishlist Panel */}
        {activeTab === 'WISHLIST' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.length === 0 ? (
              <div className="col-span-4 bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-800">Your wishlist is empty</h4>
                <p className="text-xs text-slate-500">
                  Click the heart icon on any destination guide to save it for your next trip.
                </p>
              </div>
            ) : (
              wishlist.map((item) => (
                <Link
                  key={item.id}
                  to={`/destinations/${item.destination.slug}`}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col"
                >
                  <img
                    src={item.destination.images[0]}
                    alt={item.destination.name}
                    className="h-44 w-full object-cover"
                  />
                  <div className="p-5 space-y-2">
                    <span className="text-[10px] font-bold text-brand-600 uppercase">
                      {item.destination.state}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base">{item.destination.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {item.destination.description}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Preferences Panel */}
        {activeTab === 'PREFERENCES' && (
          <div className="max-w-xl bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-lg text-slate-900">Travel Preferences</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Our recommendation engine uses these categories to customize your explore feed.
              </p>
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Preferred Destination Styles
              </label>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'HILL_STATION', label: 'Hill Stations & Snow' },
                  { id: 'BEACH', label: 'Tropical Beaches' },
                  { id: 'NATURE', label: 'Lush Nature & Valleys' },
                  { id: 'ADVENTURE', label: 'High Altitude Expeditions' },
                  { id: 'WILDLIFE', label: 'National Parks & Safaris' },
                  { id: 'CULTURAL', label: 'Spiritual & Heritage' },
                ].map((cat) => {
                  const isChecked = preferredCats.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                        isChecked
                          ? 'border-brand-500 bg-brand-50 text-brand-800 ring-1 ring-brand-400'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="submit"
                disabled={savingPref}
                className="w-full mt-4 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                {savingPref ? 'Updating Preferences...' : 'Save Preferences'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* E-Voucher Modal */}
      {activeVoucherBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-600">
                  Confirmed E-Ticket Voucher
                </span>
                <h3 className="text-xl font-black text-slate-900">TravelHub Guest Voucher</h3>
              </div>
              <button
                onClick={() => setActiveVoucherBooking(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Booking ID</span>
                <span className="font-mono font-bold text-slate-900">
                  {activeVoucherBooking.id}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Property</span>
                <span className="font-bold text-slate-900">{activeVoucherBooking.hotel?.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Room Category</span>
                <span className="font-bold text-slate-900">
                  {activeVoucherBooking.room?.roomType}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Check-in</span>
                <span className="font-bold text-slate-900">
                  {new Date(activeVoucherBooking.checkInDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Check-out</span>
                <span className="font-bold text-slate-900">
                  {new Date(activeVoucherBooking.checkOutDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Total Paid (Razorpay)</span>
                <span className="font-black text-brand-700 text-sm">
                  ₹{activeVoucherBooking.totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              Please present this voucher and government-issued photo ID at check-in desk.
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print / Save Voucher PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
