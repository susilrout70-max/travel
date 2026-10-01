import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Hotel,
  Car,
  Calendar,
  CreditCard,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  X,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { AdminBookingItem } from '../../types/admin';
import { api } from '../../utils/api';

export const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<AdminBookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'HOTEL' | 'VEHICLE'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<AdminBookingItem | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/bookings', {
        params: {
          type: typeFilter,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          search: searchQuery.trim() || undefined,
        },
      });
      setBookings(res.data.data.bookings);
    } catch (err: any) {
      console.error('Failed to load bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [typeFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleStatusChange = async (booking: AdminBookingItem, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      await api.patch(`/admin/bookings/${booking.bookingType.toLowerCase()}/${booking.id}/status`, {
        status: newStatus,
      });

      // Update in local state
      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, status: newStatus as any } : b))
      );

      if (selectedBooking && selectedBooking.id === booking.id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus as any });
      }

      setNotification({
        type: 'success',
        message: `Booking #${booking.id.slice(0, 8)} status updated to ${newStatus}.`,
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to update booking status.',
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteBooking = async (booking: AdminBookingItem) => {
    if (!window.confirm(`Are you sure you want to delete booking #${booking.id.slice(0, 8)}? This cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/admin/bookings/${booking.bookingType.toLowerCase()}/${booking.id}`);
      setBookings((prev) => prev.filter((b) => b.id !== booking.id));
      if (selectedBooking?.id === booking.id) setSelectedBooking(null);

      setNotification({
        type: 'success',
        message: 'Booking deleted successfully.',
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to delete booking.',
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const statusColors: Record<string, string> = {
    CONFIRMED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    ONGOING: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    COMPLETED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    CANCELLED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    REFUNDED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <div className="space-y-6">
      {/* Notifications Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Manage All Bookings</h2>
            <p className="text-xs text-slate-400">
              Oversee reservations for Stays and Vehicles, update lifecycle status, and verify payment settlements.
            </p>
          </div>

          {/* Type Filter Buttons */}
          <div className="inline-flex bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 self-start">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                typeFilter === 'ALL'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('HOTEL')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                typeFilter === 'HOTEL'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Hotel className="w-3.5 h-3.5" /> Stays
            </button>
            <button
              onClick={() => setTypeFilter('VEHICLE')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                typeFilter === 'VEHICLE'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5" /> Rides
            </button>
          </div>
        </div>

        {/* Search and Status Pills */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 border-t border-slate-800">
          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors border ${
                  statusFilter === st
                    ? 'bg-slate-100 text-slate-900 border-white shadow-sm'
                    : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search customer, ID, hotel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500 w-64 lg:w-72"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              Filter
            </button>
          </form>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
            Loading reservations...
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <Calendar className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-white">No bookings match the current filter</p>
            <p className="text-xs">Try selecting a different status or clear the search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-bold">Booking ID & Date</th>
                  <th className="px-6 py-4 font-bold">Customer</th>
                  <th className="px-6 py-4 font-bold">Reserved Item</th>
                  <th className="px-6 py-4 font-bold">Dates / Schedule</th>
                  <th className="px-6 py-4 font-bold">Amount & Paid</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* ID & Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            booking.bookingType === 'HOTEL'
                              ? 'bg-brand-500/10 text-brand-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {booking.bookingType === 'HOTEL' ? (
                            <Hotel className="w-3.5 h-3.5" />
                          ) : (
                            <Car className="w-3.5 h-3.5" />
                          )}
                        </span>
                        <div>
                          <p className="font-mono text-xs font-bold text-white">
                            #{booking.id.slice(0, 8)}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {formatDate(booking.createdAt)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            booking.user.avatarUrl ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                          }
                          alt={booking.user.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{booking.user.name}</p>
                          <p className="text-[11px] text-slate-400">{booking.user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Item */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-xs font-bold text-slate-100">{booking.item.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {booking.bookingType === 'HOTEL'
                            ? `${booking.item.roomType || ''} • ${booking.item.destination || ''}`
                            : `${booking.item.type} • ${booking.item.city || ''}`}
                        </p>
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="px-6 py-4 text-xs">
                      <p className="text-slate-200 font-semibold">
                        {formatDate(booking.dates.start)} → {formatDate(booking.dates.end)}
                      </p>
                      <p className="text-[11px] text-slate-400">{booking.dates.details}</p>
                    </td>

                    {/* Price & Payment */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-xs font-black text-white">
                          {formatINR(booking.totalPrice)}
                        </p>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            booking.payment?.status === 'SUCCESS'
                              ? 'text-emerald-400'
                              : booking.payment?.status === 'REFUNDED'
                              ? 'text-purple-400'
                              : 'text-amber-400'
                          }`}
                        >
                          Payment: {booking.payment?.status || 'PENDING'}
                        </span>
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-6 py-4">
                      <div className="relative inline-block text-left">
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking, e.target.value)}
                          disabled={isUpdatingStatus}
                          className={`appearance-none px-3 py-1 pr-6 rounded-full text-[11px] font-bold tracking-wide uppercase border cursor-pointer focus:outline-none ${
                            statusColors[booking.status] || 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          <option value="CONFIRMED" className="bg-slate-900 text-white">CONFIRMED</option>
                          <option value="PENDING" className="bg-slate-900 text-white">PENDING</option>
                          <option value="COMPLETED" className="bg-slate-900 text-white">COMPLETED</option>
                          <option value="CANCELLED" className="bg-slate-900 text-white">CANCELLED</option>
                          <option value="REFUNDED" className="bg-slate-900 text-white">REFUNDED</option>
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          title="View Details"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(booking)}
                          title="Delete Booking"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                  {selectedBooking.bookingType === 'HOTEL' ? 'Stay Reservation' : 'Vehicle Rental'}
                </span>
                <h3 className="text-lg font-bold text-white">
                  Booking #{selectedBooking.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Traveler Profile
              </h4>
              <div className="flex items-center gap-3">
                <img
                  src={
                    selectedBooking.user.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                  }
                  alt={selectedBooking.user.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-brand-500"
                />
                <div>
                  <p className="text-sm font-bold text-white">{selectedBooking.user.name}</p>
                  <p className="text-xs text-slate-400">{selectedBooking.user.email}</p>
                  {selectedBooking.user.phone && (
                    <p className="text-xs text-slate-400">Phone: {selectedBooking.user.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Reserved Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Destination / Item
                </h4>
                <p className="text-sm font-bold text-white">{selectedBooking.item.name}</p>
                <p className="text-xs text-slate-300 mt-1">
                  {selectedBooking.bookingType === 'HOTEL'
                    ? selectedBooking.item.roomType
                    : `${selectedBooking.item.type} in ${selectedBooking.item.city}`}
                </p>
                {selectedBooking.item.destination && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Region: {selectedBooking.item.destination}, {selectedBooking.item.state}
                  </p>
                )}
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Itinerary Schedule
                </h4>
                <p className="text-xs text-slate-300">
                  <span className="font-semibold text-white">Start:</span>{' '}
                  {formatDate(selectedBooking.dates.start)}
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  <span className="font-semibold text-white">End:</span>{' '}
                  {formatDate(selectedBooking.dates.end)}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  {selectedBooking.dates.details}
                </p>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Settlement & Razorpay Info
              </h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Total Charged</span>
                <span className="font-bold text-white text-base">
                  {formatINR(selectedBooking.totalPrice)}
                </span>
              </div>
              {selectedBooking.payment && (
                <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                  <p>
                    <span className="text-slate-500">Order ID:</span>{' '}
                    <span className="font-mono text-slate-300">{selectedBooking.payment.razorpayOrderId}</span>
                  </p>
                  {selectedBooking.payment.razorpayPaymentId && (
                    <p>
                      <span className="text-slate-500">Payment ID:</span>{' '}
                      <span className="font-mono text-slate-300">{selectedBooking.payment.razorpayPaymentId}</span>
                    </p>
                  )}
                  <p>
                    <span className="text-slate-500">Gateway Status:</span>{' '}
                    <span className="font-bold uppercase text-emerald-400">
                      {selectedBooking.payment.status}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Voucher Link if available */}
            {selectedBooking.voucherUrl && (
              <div className="flex items-center justify-between p-3.5 bg-brand-950/40 border border-brand-800/50 rounded-2xl text-xs">
                <span className="text-brand-300 font-medium">Digital Check-in Voucher generated</span>
                <span className="font-mono text-slate-200">{selectedBooking.voucherUrl}</span>
              </div>
            )}

            {/* Status Change Quick Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Change Status:</span>
                {['CONFIRMED', 'COMPLETED', 'CANCELLED', 'REFUNDED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedBooking, st)}
                    disabled={selectedBooking.status === st}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                      selectedBooking.status === st
                        ? 'bg-brand-600 text-white opacity-50 cursor-default'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
