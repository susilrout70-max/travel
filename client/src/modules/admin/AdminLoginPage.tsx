import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  LogIn,
  KeyRound,
  Compass,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../utils/api';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, setAuth, logout } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated as ADMIN, redirect straight to /admin
  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, user?.role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both your administrator email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      const { user: loggedInUser, accessToken } = res.data.data;

      if (loggedInUser.role !== 'ADMIN') {
        setError('Access Denied: This account does not have administrator privileges.');
        setIsLoading(false);
        return;
      }

      setAuth(loggedInUser, accessToken);
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Invalid administrator credentials. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white relative overflow-hidden selection:bg-brand-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform duration-300">
            <Compass className="w-6 h-6 animate-pulse-subtle" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            Travel<span className="text-brand-500">Hub</span>
          </span>
        </Link>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-bold uppercase tracking-wider text-brand-400 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Restricted Admin Portal</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Administrator Sign In
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Enter your authorized administrator credentials to manage reservations, accounts, and system sessions.
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          {/* User Role Conflict Warning if logged in as non-admin */}
          {isAuthenticated && user && user.role !== 'ADMIN' && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                <div>
                  Currently signed in as <strong className="text-white">{user.email}</strong> with role{' '}
                  <span className="font-bold uppercase text-amber-300">({user.role})</span>.
                </div>
              </div>
              <p className="text-[11px] text-amber-200/80 pl-6">
                You need an administrator account to continue. Sign out below to authenticate as admin.
              </p>
              <div className="pt-1 pl-6">
                <button
                  onClick={() => logout()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of Current Account</span>
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@travelhub.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-600/20 hover:shadow-brand-600/30 transition-all disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Admin Console</span>
                </>
              )}
            </button>
          </form>

          {/* Security note & Back link */}
          <div className="pt-4 border-t border-slate-800 text-center space-y-3">
            <p className="text-[11px] text-slate-500">
              Authorized access only. Session tokens are encrypted and audited.
            </p>
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to TravelHub Storefront</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
