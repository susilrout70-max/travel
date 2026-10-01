import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  KeyRound,
  ShieldCheck,
  ArrowLeft,
  LogOut,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { AdminOverview } from './AdminOverview';
import { AdminBookings } from './AdminBookings';
import { AdminUsers } from './AdminUsers';
import { AdminSessions } from './AdminSessions';
import { AdminStats } from '../../types/admin';
import { api } from '../../utils/api';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentTab = (searchParams.get('tab') as 'overview' | 'bookings' | 'users' | 'sessions') || 'overview';

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const fetchStats = async () => {
    setIsStatsLoading(true);
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.data);
    } catch (err: any) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchStats();
    }
  }, [isAuthenticated, user?.role]);

  // If still checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-brand-500" />
          <span>Verifying administrator credentials...</span>
        </div>
      </div>
    );
  }

  // If not authenticated or not ADMIN role, redirect to /admin/login
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }

  const setTab = (tab: 'overview' | 'bookings' | 'users' | 'sessions') => {
    setSearchParams({ tab });
  };

  const navItems = [
    { id: 'overview', label: 'Platform Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'All Bookings', icon: CalendarCheck },
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'sessions', label: 'Logins & Sessions', icon: KeyRound },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Brand Logo & Back to Main */}
          <div className="p-6 border-b border-slate-800">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-glow">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black text-white tracking-tight">
                    Travel<span className="text-brand-500">Hub</span>
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
                  Operations Suite
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile & Storefront Return */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5 text-brand-400" />
              <span>Back to Storefront</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </Link>

          <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={
                  user.avatarUrl ||
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
                }
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-brand-500"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <span className="text-[10px] font-semibold text-brand-400 uppercase tracking-wider">
                  Admin
                </span>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                System Live • SQLite Gateway
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchStats}
              disabled={isStatsLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isStatsLoading ? 'animate-spin' : ''}`} />
              <span>Sync Metrics</span>
            </button>

            <div className="text-xs text-slate-400">
              Logged in as <span className="text-slate-200 font-semibold">{user.email}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="p-8">
          {currentTab === 'overview' && (
            <AdminOverview
              stats={stats}
              isLoading={isStatsLoading}
              onNavigateTab={(tab) => setTab(tab)}
            />
          )}
          {currentTab === 'bookings' && <AdminBookings />}
          {currentTab === 'users' && <AdminUsers />}
          {currentTab === 'sessions' && <AdminSessions />}
        </main>
      </div>
    </div>
  );
};
