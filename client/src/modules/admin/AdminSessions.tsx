import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Shield,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Trash2,
  Clock,
  Lock,
  RefreshCw,
  X,
} from 'lucide-react';
import { AdminSessionItem } from '../../types/admin';
import { api } from '../../utils/api';

export const AdminSessions: React.FC = () => {
  const [sessions, setSessions] = useState<AdminSessionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/sessions', {
        params: {
          status: statusFilter,
          search: searchQuery.trim() || undefined,
        },
      });
      setSessions(res.data.data);
    } catch (err: any) {
      console.error('Failed to load sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSessions();
  };

  const handleRevokeSession = async (sessionId: string, userName: string) => {
    if (!window.confirm(`Revoke this login session for ${userName}? The user will be logged out on token expiration.`)) {
      return;
    }

    try {
      await api.delete(`/admin/sessions/${sessionId}`);
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, isRevoked: true, isActive: false } : s))
      );
      setNotification({
        type: 'success',
        message: 'Session revoked successfully.',
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to revoke session.',
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const activeCount = sessions.filter((s) => s.isActive).length;
  const revokedCount = sessions.filter((s) => s.isRevoked || s.isExpired).length;

  return (
    <div className="space-y-6">
      {/* Toast */}
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

      {/* Security Info Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Active Live Sessions
              </span>
              <p className="text-2xl font-black text-white">{activeCount}</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">Authorized devices currently holding refresh tokens</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Revoked / Expired
              </span>
              <p className="text-2xl font-black text-white">{revokedCount}</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">Tokens terminated manually or expired after 7 days</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Security Policy
              </span>
              <p className="text-xs font-bold text-emerald-400 mt-1">Automatic Family Rotation</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">SHA-256 token hashing with instant replay breach detection</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Active User Sessions Inspector</h3>
            <p className="text-xs text-slate-400">
              Audit logged-in users, device family tokens, issuance timestamps, and invalidate compromised sessions.
            </p>
          </div>

          <button
            onClick={() => fetchSessions()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors self-start"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                statusFilter === 'active'
                  ? 'bg-slate-100 text-slate-900 border-white shadow-sm'
                  : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              Active Sessions Only
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                statusFilter === 'all'
                  ? 'bg-slate-100 text-slate-900 border-white shadow-sm'
                  : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              All Sessions
            </button>
            <button
              onClick={() => setStatusFilter('revoked')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                statusFilter === 'revoked'
                  ? 'bg-slate-100 text-slate-900 border-white shadow-sm'
                  : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              Revoked / Expired
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500 w-64 lg:w-72"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
            Inspecting security sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <Shield className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-white">No session records found</p>
            <p className="text-xs">All user sessions are either expired or not matching search filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-bold">User Identity</th>
                  <th className="px-6 py-4 font-bold">Role</th>
                  <th className="px-6 py-4 font-bold">Session Family ID</th>
                  <th className="px-6 py-4 font-bold">Issued At</th>
                  <th className="px-6 py-4 font-bold">Expires At</th>
                  <th className="px-6 py-4 font-bold">Token State</th>
                  <th className="px-6 py-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            s.user.avatarUrl ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                          }
                          alt={s.user.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{s.user.name}</p>
                          <p className="text-[11px] text-slate-400">{s.user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          s.user.role === 'ADMIN'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {s.user.role}
                      </span>
                    </td>

                    {/* Session Family */}
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {s.familyId.slice(0, 12)}...
                    </td>

                    {/* Issued */}
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {formatDate(s.createdAt)}
                    </td>

                    {/* Expires */}
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {formatDate(s.expiresAt)}
                    </td>

                    {/* Token State */}
                    <td className="px-6 py-4">
                      {s.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ACTIVE LIVE
                        </span>
                      ) : s.isRevoked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          REVOKED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          EXPIRED
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      {s.isActive ? (
                        <button
                          onClick={() => handleRevokeSession(s.id, s.user.name)}
                          className="px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-rose-600 border border-amber-500/30 hover:border-rose-600 text-amber-400 hover:text-white text-xs font-bold transition-all"
                        >
                          Revoke Session
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">Terminated</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
