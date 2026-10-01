import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Compass,
  Hotel,
  Car,
  Activity,
  Share2,
  Heart,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Sparkles,
  CalendarCheck,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { SOSModal } from '../modules/safety/SOSModal';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout, openAuthModal } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);

  const navLinks = [
    { name: 'Stays', path: '/hotels', icon: Hotel },
    { name: 'Car & Bike', path: '/vehicles', icon: Car },
    { name: 'Guides', path: '/destinations', icon: Compass },
    { name: 'My Trip', path: '/trips/plan', icon: CalendarCheck },
    { name: 'Live Pulse', path: '/pulse', icon: Activity },
    { name: 'Share Trip', path: '/trips/share', icon: Share2 },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform duration-300">
              <Compass className="w-6 h-6 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  Travel<span className="text-brand-600">Hub</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded-full border border-brand-200">
                  India
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 tracking-wider">
                Discover • Book • Live Pulse
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-full border border-slate-200/80">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions / Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user && user.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </Link>
            )}

            {/* SOS Emergency Quick Beacon Button */}
            <button
              onClick={() => setIsSOSOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-black shadow-xs transition-all hover:scale-105"
              title="Activate Emergency SOS & Helplines"
            >
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              <span>SOS</span>
            </button>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  <img
                    src={
                      user.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                    }
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-brand-500"
                  />
                  <div className="text-left leading-tight">
                    <span className="block text-xs font-bold text-slate-800">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] font-semibold text-brand-600 uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-glass border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-500">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                    </div>
                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      to="/trips/plan"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-600"
                    >
                      <CalendarCheck className="w-4 h-4 text-brand-500" />
                      My Trip Workspace
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-600"
                    >
                      <Hotel className="w-4 h-4 text-teal-500" />
                      My Bookings & Vouchers
                    </Link>
                    <Link
                      to="/profile?tab=wishlist"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-600"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      Saved Wishlist
                    </Link>
                    <Link
                      to="/trips/share"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-600"
                    >
                      <Share2 className="w-4 h-4 text-teal-500" />
                      My Shared Trips
                    </Link>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-bold shadow-md hover:bg-brand-600 hover:shadow-glow transition-all duration-200"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Join Free
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold ${
                    active ? 'bg-brand-50 text-brand-600' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5 text-brand-500" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-100 pt-3">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl">
                  <img
                    src={
                      user.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                    }
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-bold text-purple-700 bg-purple-50 hover:bg-purple-100"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    Admin Operations Panel
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  My Bookings & Wishlist
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('register');
                  }}
                  className="w-full py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold shadow-md hover:bg-brand-700"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Quick Emergency SOS Modal */}
      <SOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />
    </header>
  );
};
