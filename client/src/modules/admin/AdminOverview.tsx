import React from 'react';
import {
  TrendingUp,
  DollarSign,
  CalendarCheck,
  Users,
  KeyRound,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Hotel,
  Car,
  Shield,
  UserCheck,
} from 'lucide-react';
import { AdminStats } from '../../types/admin';

interface Props {
  stats: AdminStats | null;
  isLoading: boolean;
  onNavigateTab: (tab: 'bookings' | 'users' | 'sessions') => void;
}

export const AdminOverview: React.FC<Props> = ({ stats, isLoading, onNavigateTab }) => {
  if (isLoading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-800/50 rounded-2xl border border-slate-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-800/50 rounded-2xl border border-slate-800" />
          <div className="h-96 bg-slate-800/50 rounded-2xl border border-slate-800" />
        </div>
      </div>
    );
  }

  const { metrics, breakdowns, recentBookings, recentUsers } = stats;

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Revenue */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all shadow-xl">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-500/10 rounded-full blur-xl group-hover:bg-brand-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            {formatINR(metrics.totalRevenue)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Confirmed digital bookings</span>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all shadow-xl">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Bookings
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            {metrics.totalBookings}
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Hotel className="w-3 h-3 text-brand-400" /> {metrics.totalHotelBookings} Stays
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Car className="w-3 h-3 text-amber-400" /> {metrics.totalVehicleBookings} Rides
            </span>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all shadow-xl">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Registered Users
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            {metrics.totalUsers}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
            <span className="text-purple-300 font-semibold">
              {breakdowns.usersByRole.find((r) => r.role === 'ADMIN')?.count || 0} Admins
            </span>
            <span>•</span>
            <span>
              {breakdowns.usersByRole.find((r) => r.role === 'USER')?.count || 0} Travelers
            </span>
          </div>
        </div>

        {/* Active Logins / Sessions */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all shadow-xl">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Sessions
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{metrics.activeSessionsCount}</span>
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Live unrevoked user refresh tokens
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
          Operations Shortcuts:
        </span>
        <button
          onClick={() => onNavigateTab('bookings')}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 transition-colors"
        >
          <CalendarCheck className="w-3.5 h-3.5 text-brand-400" />
          Manage All Bookings
        </button>
        <button
          onClick={() => onNavigateTab('users')}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 transition-colors"
        >
          <Users className="w-3.5 h-3.5 text-purple-400" />
          View User Accounts & Roles
        </button>
        <button
          onClick={() => onNavigateTab('sessions')}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 transition-colors"
        >
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          Security & Session Inspector
        </button>
      </div>

      {/* Two-Column Grid: Recent Bookings & Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings Stream (2 Columns) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Recent Bookings Stream</h3>
              <p className="text-xs text-slate-400">Latest reservations across Stays & Vehicles</p>
            </div>
            <button
              onClick={() => onNavigateTab('bookings')}
              className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentBookings.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No booking records registered yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {recentBookings.map((b) => (
                <div key={b.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        b.bookingType === 'HOTEL'
                          ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {b.bookingType === 'HOTEL' ? (
                        <Hotel className="w-4 h-4" />
                      ) : (
                        <Car className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{b.itemTitle}</p>
                      <p className="text-xs text-slate-400 truncate">
                        By <span className="text-slate-300 font-medium">{b.customerName}</span> (
                        {b.customerEmail})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-sm font-bold text-slate-200">{formatINR(b.amount)}</span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : b.status === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : b.status === 'COMPLETED'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Registered Users (1 Column) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Recent Users</h3>
              <p className="text-xs text-slate-400">Newly registered profiles</p>
            </div>
            <button
              onClick={() => onNavigateTab('users')}
              className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {recentUsers.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={
                      u.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                    }
                    alt={u.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-700"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{u.name}</p>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${
                    u.role === 'ADMIN'
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
