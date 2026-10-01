import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  CheckSquare,
  Square,
  Plus,
  Hotel,
  Car,
  Shield,
  Phone,
  AlertTriangle,
  ExternalLink,
  Users,
  Compass,
  Sparkles,
  ChevronRight,
  Activity,
  FileText,
  Share2,
} from 'lucide-react';
import { api } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import { SOSModal } from '../safety/SOSModal';
import { PhrasebookModal } from '../safety/PhrasebookModal';
import { IncidentReportModal } from '../safety/IncidentReportModal';

export const TripDashboardPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { user, isAuthenticated, openAuthModal } = useAuthStore();

  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(id || null);
  const [dashboard, setDashboard] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isPhrasebookOpen, setIsPhrasebookOpen] = useState(false);
  const [incidentModalConfig, setIncidentModalConfig] = useState<{
    isOpen: boolean;
    bookingId?: string;
    bookingType?: 'HOTEL' | 'VEHICLE';
    defaultType?: string;
  }>({ isOpen: false });

  // Checklist state
  const [checklistFilter, setChecklistFilter] = useState<'ALL' | 'SAFETY' | 'DOCUMENTS' | 'PACKING'>('ALL');
  const [newChecklistLabel, setNewChecklistLabel] = useState('');
  const [newChecklistCat, setNewChecklistCat] = useState('PACKING');
  const [addingItem, setAddingItem] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTrips();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedTripId) {
      fetchTripDashboard(selectedTripId);
    }
  }, [selectedTripId]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await api.get('/trips');
      setTrips(res.data.data);
      if (res.data.data.length > 0 && !selectedTripId) {
        setSelectedTripId(res.data.data[0].id);
      }
    } catch (err: any) {
      setError('Failed to fetch user trips.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTripDashboard = async (tripId: string) => {
    try {
      const res = await api.get(`/trips/${tripId}/dashboard`);
      setDashboard(res.data.data);
    } catch (err: any) {
      setError('Failed to load trip workspace.');
    }
  };

  const handleToggleChecklist = async (itemId: string) => {
    if (!selectedTripId || !dashboard) return;
    try {
      const res = await api.patch(`/trips/${selectedTripId}/checklist/${itemId}`);
      const updated = dashboard.checklist.map((c: any) =>
        c.id === itemId ? { ...c, isDone: res.data.data.isDone } : c
      );
      setDashboard({ ...dashboard, checklist: updated });
    } catch (err) {
      // ignore
    }
  };

  const handleAddChecklistItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistLabel.trim() || !selectedTripId) return;

    try {
      const res = await api.post(`/trips/${selectedTripId}/checklist`, {
        label: newChecklistLabel,
        category: newChecklistCat,
      });
      setDashboard({
        ...dashboard,
        checklist: [...dashboard.checklist, res.data.data],
      });
      setNewChecklistLabel('');
      setAddingItem(false);
    } catch (err) {
      // ignore
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Sign in to Access Your Trip Workspace</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Consolidate your stays, rental rides, live crowd warnings, and smart packing checklists all in one single place.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md text-sm transition-all"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  if (loading && !dashboard) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm text-slate-500 font-medium">Aggregating your trip dashboard...</p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-900">No Active Trips Found</h2>
        <p className="text-sm text-slate-500">
          Book a hotel or self-drive vehicle, and your unified trip workspace will automatically assemble here.
        </p>
        <Link
          to="/destinations"
          className="inline-block px-6 py-3 bg-brand-600 text-white font-bold rounded-xl text-sm"
        >
          Explore Destinations
        </Link>
      </div>
    );
  }

  const { trip, destination, bookings, checklist, liveInfo } = dashboard;

  const daysUntilTrip = Math.ceil(
    (new Date(trip.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const filteredChecklist =
    checklistFilter === 'ALL'
      ? checklist
      : checklist.filter((item: any) => item.category === checklistFilter);

  const completedChecklistCount = checklist.filter((item: any) => item.isDone).length;
  const checklistPercent = Math.round((completedChecklistCount / (checklist.length || 1)) * 100);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Banner */}
      <div className="relative bg-slate-900 text-white overflow-hidden">
        {destination.images && destination.images[0] && (
          <img
            src={destination.images[0]}
            alt={destination.name}
            className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-xs"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Trip Selector if multiple */}
          {trips.length > 1 && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              {trips.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTripId(t.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                    t.id === selectedTripId
                      ? 'bg-brand-500 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-slate-300'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-brand-500/30 text-brand-300 border border-brand-400/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Upcoming Expedition
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
                  {daysUntilTrip > 0 ? `${daysUntilTrip} days to departure` : 'Trip is Active Now'}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                {trip.name}
              </h1>
              <p className="text-slate-300 text-sm flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-400" />
                  {destination.name}, {destination.state}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-400" />
                  {new Date(trip.startDate).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  –{' '}
                  {new Date(trip.endDate).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </p>
            </div>

            {/* Safety & Action Controls */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setIsPhrasebookOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4 text-teal-300" />
                Emergency Phrasebook
              </button>
              <button
                onClick={() => setIsSOSOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
              >
                <Shield className="w-4 h-4 text-white" />
                SOS Emergency
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Bookings & Guide & Checklist */}
          <div className="lg:col-span-2 space-y-8">
            {/* Live Destination Pulse & Crowd Indicator */}
            {liveInfo && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-brand-600" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Live Destination Pulse
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Real-time weather & crowd index derived from verified check-ins
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Weather */}
                  <div className="px-4 py-2.5 rounded-2xl bg-sky-50 border border-sky-100 text-center">
                    <p className="text-[10px] uppercase font-bold text-sky-600 tracking-wider">
                      {liveInfo.pulse.weather.condition}
                    </p>
                    <p className="text-lg font-black text-slate-900">
                      {liveInfo.pulse.weather.temperature}°C
                    </p>
                  </div>

                  {/* Crowd Indicator */}
                  {liveInfo.pulse.crowd && (
                    <div
                      className={`px-4 py-2.5 rounded-2xl border text-center ${
                        liveInfo.pulse.crowd.level === 'HIGH'
                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                          : liveInfo.pulse.crowd.level === 'LOW'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}
                    >
                      <p className="text-[10px] uppercase font-bold tracking-wider">
                        Crowd: {liveInfo.pulse.crowd.level}
                      </p>
                      <p className="text-xs font-black mt-0.5">
                        {liveInfo.pulse.crowd.percent}% Footfall
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Consolidated Bookings Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Hotel className="w-5 h-5 text-brand-600" />
                  Your Booked Accommodations & Rides
                </h3>
                <span className="text-xs font-bold text-slate-400">
                  {bookings.hotels.length + bookings.vehicles.length} Confirmed
                </span>
              </div>

              {bookings.hotels.map((booking: any) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {booking.hotel.images && booking.hotel.images[0] && (
                        <img
                          src={booking.hotel.images[0]}
                          alt={booking.hotel.name}
                          className="w-16 h-16 rounded-2xl object-cover"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            CONFIRMED STAY
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            #{booking.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-1">
                          {booking.hotel.name}
                        </h4>
                        <p className="text-xs text-slate-500">{booking.room?.roomType}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-400">All-in Price</p>
                      <p className="text-lg font-black text-slate-900">
                        ₹{booking.totalPrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Price Breakdown Accordion */}
                  {booking.priceBreakdown && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-500 font-medium">
                        <span>Base Room Rate:</span>
                        <span>₹{booking.priceBreakdown.basePrice.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 font-medium">
                        <span>Taxes & GST (12%):</span>
                        <span>₹{booking.priceBreakdown.taxesAndFees.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 font-medium">
                        <span>Concierge & Service Fee:</span>
                        <span>₹{booking.priceBreakdown.serviceFee.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="pt-1 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                        <span>Total Paid (Zero Hidden Costs):</span>
                        <span>₹{booking.priceBreakdown.totalPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <span className="text-slate-500">
                      Check-in:{' '}
                      <strong className="text-slate-800">
                        {new Date(booking.checkInDate).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </strong>
                    </span>

                    <button
                      onClick={() =>
                        setIncidentModalConfig({
                          isOpen: true,
                          bookingId: booking.id,
                          bookingType: 'HOTEL',
                          defaultType: 'booking_issue',
                        })
                      }
                      className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Report Room/Check-in Issue
                    </button>
                  </div>
                </div>
              ))}

              {bookings.vehicles.map((booking: any) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {booking.vehicle.images && booking.vehicle.images[0] && (
                        <img
                          src={booking.vehicle.images[0]}
                          alt={booking.vehicle.name}
                          className="w-16 h-16 rounded-2xl object-cover"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                            VEHICLE RENTAL
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            #{booking.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-1">
                          {booking.vehicle.brand} {booking.vehicle.name}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Pickup: {booking.pickupLocation} • Drop: {booking.dropLocation}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-400">Total Charged</p>
                      <p className="text-lg font-black text-slate-900">
                        ₹{booking.totalPrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Price breakdown */}
                  {booking.priceBreakdown && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-500">
                        <span>Vehicle Rental Charge:</span>
                        <span>₹{booking.priceBreakdown.basePrice.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Commercial GST (18%):</span>
                        <span>₹{booking.priceBreakdown.taxesAndFees.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Refundable Security Hold:</span>
                        <span>₹{booking.priceBreakdown.resortFee.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="pt-1 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                        <span>Total (Includes Refundable Hold):</span>
                        <span>₹{booking.priceBreakdown.totalPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Dates:{' '}
                      <strong className="text-slate-800">
                        {new Date(booking.startTime).toLocaleDateString('en-IN')}
                      </strong>
                    </span>
                    <button
                      onClick={() =>
                        setIncidentModalConfig({
                          isOpen: true,
                          bookingId: booking.id,
                          bookingType: 'VEHICLE',
                          defaultType: 'vehicle_breakdown',
                        })
                      }
                      className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Request Roadside Assistance
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Smart Interactive Checklist */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-brand-600" />
                    Trip Preparation Checklist
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Auto-generated packing & safety milestones tailored for {destination.category.replace('_', ' ')} trips
                  </p>
                </div>

                {/* Progress bar */}
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700">
                    {completedChecklistCount} / {checklist.length} Completed ({checklistPercent}%)
                  </span>
                  <div className="w-36 h-2 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-600 to-teal-500 rounded-full transition-all duration-300"
                      style={{ width: `${checklistPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
                {(['ALL', 'SAFETY', 'DOCUMENTS', 'PACKING'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setChecklistFilter(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      checklistFilter === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Items' : cat}
                  </button>
                ))}
              </div>

              {/* Checklist Items */}
              <div className="space-y-2.5">
                {filteredChecklist.map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklist(item.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      item.isDone
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800 line-through'
                        : 'bg-white border-slate-200 hover:border-brand-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.isDone ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      )}
                      <span className="text-xs font-semibold">{item.label}</span>
                    </div>

                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add Custom Item */}
              {addingItem ? (
                <form onSubmit={handleAddChecklistItem} className="pt-2 flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bring extra camera batteries"
                    value={newChecklistLabel}
                    onChange={(e) => setNewChecklistLabel(e.target.value)}
                    className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <select
                    value={newChecklistCat}
                    onChange={(e) => setNewChecklistCat(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700"
                  >
                    <option value="PACKING">PACKING</option>
                    <option value="DOCUMENTS">DOCUMENTS</option>
                    <option value="SAFETY">SAFETY</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingItem(false)}
                    className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setAddingItem(true)}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand-400 text-slate-600 hover:text-brand-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Custom Packing or Prep Item
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Destination Quick Directory & Travel Notes */}
          <div className="space-y-6">
            {/* In Case of Emergency Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-rose-600">
                <Shield className="w-5 h-5" />
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  In Case of Emergency
                </h4>
              </div>
              <p className="text-xs text-slate-500">
                Direct verified responders in {destination.name}
              </p>

              <div className="space-y-2.5">
                {destination.emergencyDirectory && destination.emergencyDirectory.length > 0 ? (
                  destination.emergencyDirectory.map((entry: any) => (
                    <div
                      key={entry.id}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{entry.name}</p>
                        <p className="text-[10px] text-slate-400">{entry.address || entry.type}</p>
                      </div>
                      <a
                        href={`tel:${entry.phone}`}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold flex items-center gap-1 hover:bg-slate-800"
                      >
                        <Phone className="w-3 h-3" />
                        Call
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">National Emergency (All India)</span>
                      <a href="tel:112" className="text-rose-600 font-bold">
                        112
                      </a>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">TravelHub 24/7 Desk</span>
                      <a href="tel:+918004258747" className="text-brand-600 font-bold">
                        +91 800-425-TRIP
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Travel Guide Highlights & Itinerary */}
            {destination.travelGuide && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-brand-600" />
                  Curated Guide Highlights
                </h4>

                <div className="space-y-2">
                  {destination.travelGuide.highlights?.slice(0, 4).map((hl: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <Link
                    to={`/destinations/${destination.slug}`}
                    className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
                  >
                    View Complete Destination Guide & Map →
                  </Link>
                </div>
              </div>
            )}

            {/* Trip Notes */}
            {trip.notes && (
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-3xl p-6 text-xs text-amber-900 space-y-1.5">
                <h4 className="font-bold uppercase tracking-wider text-amber-950">
                  Traveler Notes & Reminders
                </h4>
                <p className="leading-relaxed">{trip.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Modals */}
      <SOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />
      <PhrasebookModal
        isOpen={isPhrasebookOpen}
        onClose={() => setIsPhrasebookOpen(false)}
        countryCode="IN"
      />
      <IncidentReportModal
        isOpen={incidentModalConfig.isOpen}
        onClose={() => setIncidentModalConfig({ isOpen: false })}
        bookingId={incidentModalConfig.bookingId}
        bookingType={incidentModalConfig.bookingType}
        defaultType={incidentModalConfig.defaultType}
      />
    </div>
  );
};
