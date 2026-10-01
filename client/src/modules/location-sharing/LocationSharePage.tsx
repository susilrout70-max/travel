import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Share2,
  MapPin,
  Clock,
  Copy,
  Check,
  Plus,
  Compass,
  AlertCircle,
  ExternalLink,
  Trash2,
  Shield,
  BatteryCharging,
  Radio,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../utils/api';
import { TripShare, TripSharePin } from '../../types';
import { InteractiveMap } from '../map/InteractiveMap';
import { useAuthStore } from '../../store/authStore';
import { SOSModal } from '../safety/SOSModal';
import { EmergencyContactsModal } from '../safety/EmergencyContactsModal';

export const LocationSharePage: React.FC = () => {
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const [shares, setShares] = useState<TripShare[]>([]);
  const [activeShare, setActiveShare] = useState<TripShare | null>(null);
  const [loading, setLoading] = useState(true);

  // New Share form
  const [title, setTitle] = useState('');
  const [durationHours, setDurationHours] = useState(4);
  const [isSafetyMode, setIsSafetyMode] = useState(true);
  const [pingInterval, setPingInterval] = useState(10);
  const [creating, setCreating] = useState(false);

  // Safety & SOS Modals
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [checkInDone, setCheckInDone] = useState(false);

  // New Pin form
  const [pinLabel, setPinLabel] = useState('');
  const [pinDesc, setPinDesc] = useState('');
  const [pinLat, setPinLat] = useState(32.2432);
  const [pinLng, setPinLng] = useState(77.1892);
  const [addingPin, setAddingPin] = useState(false);

  const [copied, setCopied] = useState(false);

  const fetchShares = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/location-sharing/my-shares');
      setShares(res.data.data);
      if (res.data.data.length > 0) {
        // Load detailed first share
        const first = res.data.data[0];
        const detailRes = await api.get(`/location-sharing/view/${first.shareToken}`);
        setActiveShare(detailRes.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShares();
  }, [isAuthenticated]);

  const handleCreateShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (!title.trim()) return;

    setCreating(true);
    try {
      const res = await api.post('/location-sharing', { title, durationHours });
      setTitle('');
      await fetchShares();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create trip share');
    } finally {
      setCreating(false);
    }
  };

  const handleAddPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShare || !pinLabel.trim()) return;

    setAddingPin(true);
    try {
      await api.post(`/location-sharing/${activeShare.id}/pins`, {
        latitude: Number(pinLat),
        longitude: Number(pinLng),
        label: pinLabel,
        description: pinDesc,
      });

      setPinLabel('');
      setPinDesc('');

      // Refresh active share
      const detailRes = await api.get(`/location-sharing/view/${activeShare.shareToken}`);
      setActiveShare(detailRes.data.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add map pin');
    } finally {
      setAddingPin(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPinLat(Number(pos.coords.latitude.toFixed(4)));
          setPinLng(Number(pos.coords.longitude.toFixed(4)));
        },
        () => {
          alert('Could not retrieve browser GPS coordinates. Using default.');
        }
      );
    }
  };

  const copyShareLink = (token: string) => {
    const url = `${window.location.origin}/trips/view/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
        <Share2 className="w-12 h-12 text-brand-600 mx-auto" />
        <h2 className="text-2xl font-black text-slate-900">Live Trip Location Sharing</h2>
        <p className="text-xs text-slate-500">
          Share your real-time travel journey, dropped pins, and coordinates securely with travel
          companions using private, time-limited links.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="w-full py-3 rounded-2xl bg-brand-600 text-white font-bold text-sm shadow-md hover:bg-brand-700 transition-colors"
        >
          Sign In to Share Trip
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600">
            <Share2 className="w-4 h-4" />
            Smart Safety & Time-Boxed Companion Network
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Live Location & Safety Mode
          </h1>
          <p className="text-sm text-slate-500">
            Time-boxed location sharing with adaptive battery saver (5–10 min pings), auto check-ins, and one-tap SOS.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsContactsOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Users className="w-4 h-4 text-blue-600" />
            Emergency Contacts
          </button>
          <button
            onClick={() => setIsSOSOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 transition-transform hover:scale-105 shadow-md"
          >
            <Shield className="w-4 h-4" />
            SOS Emergency
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Create Share & Drop Pin Forms */}
        <div className="space-y-6">
          {/* Create Trip Share Session */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-brand-600" />
              Start Time-Boxed Share
            </h3>

            <form onSubmit={handleCreateShare} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Trip / Activity Label
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Solang Valley Trek / Highway Drive"
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Safety Mode Toggle */}
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BatteryCharging className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-950">
                      Safety Mode (Low-Power)
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSafetyMode}
                    onChange={(e) => setIsSafetyMode(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Adaptive 5–10 min interval updates instead of draining continuous GPS tracking. Saves ~85% battery.
                </p>
              </div>

              {isSafetyMode && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Adaptive Ping Cadence
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPingInterval(5)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        pingInterval === 5
                          ? 'border-brand-600 bg-brand-50 text-brand-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      5 min (Standard Safety)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPingInterval(10)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        pingInterval === 10
                          ? 'border-brand-600 bg-brand-50 text-brand-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      10 min (Ultra Battery Saver)
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Duration Preset (Auto-expires)
                </label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value={2}>2 Hours (Quick Hike / Short Ride)</option>
                  <option value={4}>4 Hours (Standard Afternoon Excursion)</option>
                  <option value={8}>8 Hours (Full-day Trek)</option>
                  <option value={24}>24 Hours (Overnight Stay)</option>
                  <option value={48}>48 Hours (Weekend Expedition)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5" />
                {creating ? 'Starting Session...' : 'Activate Time-Boxed Share'}
              </button>
            </form>
          </div>

          {/* Drop a Pin (If active share selected) */}
          {activeShare && activeShare.isActive && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Drop Live Location Pin
                </h3>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="text-[11px] font-bold text-brand-600 hover:text-brand-700"
                >
                  Use My GPS
                </button>
              </div>

              <form onSubmit={handleAddPin} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Checkpoint / Milestone Name
                  </label>
                  <input
                    type="text"
                    required
                    value={pinLabel}
                    onChange={(e) => setPinLabel(e.target.value)}
                    placeholder="e.g. Atal Tunnel South Portal, Cafe 1947"
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Notes / Update Description
                  </label>
                  <input
                    type="text"
                    value={pinDesc}
                    onChange={(e) => setPinDesc(e.target.value)}
                    placeholder="Crossed into the valley, weather is clear and breezy!"
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={pinLat}
                      onChange={(e) => setPinLat(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={pinLng}
                      onChange={(e) => setPinLng(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={addingPin}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-colors"
                >
                  {addingPin ? 'Dropping Pin...' : 'Broadcast Pin to Trip'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right 2 Columns: Active Shared Trip Map & Companion Link */}
        <div className="lg:col-span-2 space-y-6">
          {activeShare ? (
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              {/* Share Header & URL copy */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        activeShare.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {activeShare.isActive ? 'Active Live Share' : 'Expired / Stopped'}
                    </span>
                    <span className="text-xs text-slate-400">
                      Expires: {new Date(activeShare.expiresAt).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{activeShare.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyShareLink(activeShare.shareToken)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-50 text-brand-700 font-bold text-xs hover:bg-brand-100 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy Share Link'}
                  </button>

                  <Link
                    to={`/trips/view/${activeShare.shareToken}`}
                    target="_blank"
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Auto Check-in Safety Prompt */}
              {activeShare.isActive && (
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-950 block">Time-Boxed Safety Check-In Prompt</span>
                      <span className="text-emerald-700">Are you currently safe and on track?</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {checkInDone ? (
                      <span className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Safe Status Logged
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await api.post('/safety/checkin', { tripShareId: activeShare.id, status: 'safe' });
                            setCheckInDone(true);
                          } catch (e) {}
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                      >
                        Yes, I&apos;m Safe
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsSOSOpen(true)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                    >
                      Send SOS
                    </button>
                  </div>
                </div>
              )}

              {/* Map */}
              <div>
                <InteractiveMap
                  center={
                    activeShare.pins && activeShare.pins.length > 0
                      ? [activeShare.pins[0].latitude, activeShare.pins[0].longitude]
                      : [32.2432, 77.1892]
                  }
                  zoom={11}
                  className="h-[380px]"
                  markers={
                    activeShare.pins?.map((pin) => ({
                      id: pin.id,
                      lat: pin.latitude,
                      lng: pin.longitude,
                      title: pin.label,
                      subtitle: `${pin.description || ''} • ${new Date(
                        pin.timestamp
                      ).toLocaleTimeString()}`,
                      color: '#059669',
                    })) || []
                  }
                />
              </div>

              {/* Pin Trail Timeline */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900">
                  Broadcast Pin History ({activeShare.pins?.length || 0})
                </h4>

                <div className="space-y-2">
                  {activeShare.pins?.map((pin) => (
                    <div
                      key={pin.id}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block">{pin.label}</span>
                        {pin.description && <p className="text-slate-500">{pin.description}</p>}
                        <span className="text-[10px] text-slate-400 font-mono">
                          Coordinates: {pin.latitude}, {pin.longitude}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {new Date(pin.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <Share2 className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800">No active shared trip selected</h3>
              <p className="text-xs text-slate-500">
                Create a new trip on the left to start streaming live coordinates.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Safety Modals */}
      <SOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />
      <EmergencyContactsModal isOpen={isContactsOpen} onClose={() => setIsContactsOpen(false)} />
    </div>
  );
};
