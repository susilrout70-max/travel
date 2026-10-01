import React, { useState, useEffect } from 'react';
import {
  Search,
  UserPlus,
  Users,
  Shield,
  KeyRound,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
  AlertCircle,
  CalendarCheck,
  Share2,
} from 'lucide-react';
import { AdminUserItem } from '../../types/admin';
import { api } from '../../utils/api';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // New user form state
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'USER',
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: {
          role: roleFilter !== 'ALL' ? roleFilter : undefined,
          search: searchQuery.trim() || undefined,
        },
      });
      setUsers(res.data.data.users);
    } catch (err: any) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUserForm);
      setIsAddUserOpen(false);
      setNewUserForm({ name: '', email: '', password: '', phone: '', role: 'USER' });
      setNotification({
        type: 'success',
        message: `Account created successfully for ${newUserForm.email}.`,
      });
      setTimeout(() => setNotification(null), 4000);
      fetchUsers();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to create user.',
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/admin/users/${userId}`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
      );
      setNotification({
        type: 'success',
        message: `User role updated to ${newRole}.`,
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to update user role.',
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleRevokeSessions = async (user: AdminUserItem) => {
    if (!window.confirm(`Force sign-out all active login sessions for ${user.name}?`)) {
      return;
    }

    try {
      const res = await api.post(`/admin/users/${user.id}/revoke-sessions`);
      setNotification({
        type: 'success',
        message: `Terminated ${res.data.data.revokedCount} active session(s) for ${user.email}.`,
      });
      setTimeout(() => setNotification(null), 4000);
      fetchUsers();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to revoke sessions.',
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDeleteUser = async (user: AdminUserItem) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete user account ${user.email}? This removes their active sessions, wishlists, and account data.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/admin/users/${user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setNotification({
        type: 'success',
        message: `User ${user.email} deleted successfully.`,
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to delete user.',
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleViewDetails = async (userId: string) => {
    setIsLoadingDetails(true);
    try {
      const res = await api.get(`/admin/users/${userId}`);
      setSelectedUserDetails(res.data.data);
    } catch (err: any) {
      console.error('Failed to get user details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
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
            <h2 className="text-xl font-bold text-white tracking-tight">User Account Directory</h2>
            <p className="text-xs text-slate-400">
              Manage travelers, administrators, partner credentials, and force-terminate active login sessions.
            </p>
          </div>

          <button
            onClick={() => setIsAddUserOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition-all self-start"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        </div>

        {/* Search & Role Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'USER', 'ADMIN', 'PARTNER'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                  roleFilter === r
                    ? 'bg-slate-100 text-slate-900 border-white shadow-sm'
                    : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {r === 'ALL' ? 'All Roles' : `${r}s`}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
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

      {/* Users Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
            Loading user profiles...
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-white">No users match criteria</p>
            <p className="text-xs">Adjust your search query or role filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-bold">User Identity</th>
                  <th className="px-6 py-4 font-bold">Contact</th>
                  <th className="px-6 py-4 font-bold">Privilege Role</th>
                  <th className="px-6 py-4 font-bold">Total Bookings</th>
                  <th className="px-6 py-4 font-bold">Active Logins</th>
                  <th className="px-6 py-4 font-bold">Joined</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* User Identity */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            u.avatarUrl ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                          }
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{u.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">#{u.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-xs font-medium text-slate-200">{u.email}</p>
                        <p className="text-[11px] text-slate-400">{u.phone || 'No phone added'}</p>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border cursor-pointer focus:outline-none ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : u.role === 'PARTNER'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <option value="USER" className="bg-slate-900 text-white">USER</option>
                        <option value="ADMIN" className="bg-slate-900 text-white">ADMIN</option>
                        <option value="PARTNER" className="bg-slate-900 text-white">PARTNER</option>
                      </select>
                    </td>

                    {/* Bookings */}
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-200">
                        {u.totalBookings} reservation(s)
                      </span>
                    </td>

                    {/* Active Logins */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {u.activeSessions > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {u.activeSessions} active
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">None</span>
                        )}
                      </div>
                    </td>

                    {/* Joined */}
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {formatDate(u.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(u.id)}
                          title="View Profile & Bookings"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRevokeSessions(u)}
                          title="Terminate Active Logins"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-900/40 text-amber-400 transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          title="Delete User"
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

      {/* Modal: Create User */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Create New Account</h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="e.g. Maya Iyer"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="maya@travelhub.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone (Optional)</label>
                <input
                  type="text"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Account Role</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="USER">USER (Traveler)</option>
                  <option value="ADMIN">ADMIN (Full Privileges)</option>
                  <option value="PARTNER">PARTNER (Hotel/Fleet Operator)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View User Details & History */}
      {selectedUserDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={
                    selectedUserDetails.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                  }
                  alt={selectedUserDetails.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-brand-500"
                />
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedUserDetails.name}</h3>
                  <p className="text-xs text-slate-400">
                    {selectedUserDetails.email} • {selectedUserDetails.phone || 'No phone'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserDetails(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-center">
                <p className="text-xs text-slate-400">Stays</p>
                <p className="text-lg font-black text-white">
                  {selectedUserDetails.hotelBookings?.length || 0}
                </p>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-center">
                <p className="text-xs text-slate-400">Vehicles</p>
                <p className="text-lg font-black text-white">
                  {selectedUserDetails.vehicleBookings?.length || 0}
                </p>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-center">
                <p className="text-xs text-slate-400">Live Tokens</p>
                <p className="text-lg font-black text-white">
                  {selectedUserDetails.refreshTokens?.filter((t: any) => !t.isRevoked).length || 0}
                </p>
              </div>
            </div>

            {/* Bookings History */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Booking Activity
              </h4>
              {selectedUserDetails.hotelBookings?.length === 0 &&
              selectedUserDetails.vehicleBookings?.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No bookings placed yet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedUserDetails.hotelBookings?.map((hb: any) => (
                    <div
                      key={hb.id}
                      className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{hb.hotel?.name}</p>
                        <p className="text-slate-400 text-[11px]">{hb.room?.roomType}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white">₹{hb.totalPrice}</span>
                        <p className="text-[10px] text-emerald-400 font-semibold">{hb.status}</p>
                      </div>
                    </div>
                  ))}
                  {selectedUserDetails.vehicleBookings?.map((vb: any) => (
                    <div
                      key={vb.id}
                      className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{vb.vehicle?.name}</p>
                        <p className="text-slate-400 text-[11px]">{vb.vehicle?.type}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white">₹{vb.totalPrice}</span>
                        <p className="text-[10px] text-emerald-400 font-semibold">{vb.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedUserDetails(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"
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
