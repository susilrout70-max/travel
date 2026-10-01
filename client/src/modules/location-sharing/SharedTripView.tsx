import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Share2, MapPin, Clock, ShieldAlert, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api } from '../../utils/api';
import { TripShare } from '../../types';
import { InteractiveMap } from '../map/InteractiveMap';

export const SharedTripView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [trip, setTrip] = useState<TripShare | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await api.get(`/location-sharing/view/${token}`);
        setTrip(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load shared trip.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [token]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-500">Connecting to live travel stream...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-black text-slate-900">Trip Share Unavailable</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          {error || 'This trip share link has expired or has been terminated by the traveler.'}
        </p>
        <Link
          to="/"
          className="inline-block py-2.5 px-6 rounded-2xl bg-brand-600 text-white font-bold text-xs"
        >
          Explore TravelHub
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header Bar */}
      <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={
              trip.user?.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
            }
            alt={trip.user?.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-brand-500 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Live Companion View
              </span>
              <span className="text-xs text-slate-400">
                Expires in {Math.max(0, Math.ceil((new Date(trip.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)))}h
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-0.5">{trip.title}</h1>
            <p className="text-xs text-slate-500">
              Shared by <span className="font-bold text-slate-800">{trip.user?.name}</span>
            </p>
          </div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-700 self-start md:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Visit TravelHub
        </Link>
      </div>

      {/* Map */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <InteractiveMap
          center={
            trip.pins && trip.pins.length > 0
              ? [trip.pins[trip.pins.length - 1].latitude, trip.pins[trip.pins.length - 1].longitude]
              : [32.2432, 77.1892]
          }
          zoom={12}
          className="h-[420px]"
          markers={
            trip.pins?.map((pin) => ({
              id: pin.id,
              lat: pin.latitude,
              lng: pin.longitude,
              title: pin.label,
              subtitle: `${pin.description || ''} (${new Date(pin.timestamp).toLocaleTimeString()})`,
              color: '#059669',
            })) || []
          }
        />
      </div>

      {/* Live Timeline of Pins */}
      <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
        <h3 className="font-bold text-lg text-slate-900">
          Live Checkpoint Trail ({trip.pins?.length || 0} checkpoints)
        </h3>

        <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {trip.pins?.map((pin, idx) => (
            <div key={pin.id} className="relative flex items-start gap-4 pl-8">
              <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex-1 space-y-1">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-bold text-sm text-slate-900">{pin.label}</h4>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {new Date(pin.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {pin.description && <p className="text-xs text-slate-600">{pin.description}</p>}
                <p className="text-[10px] text-slate-400 font-mono">
                  GPS: {pin.latitude}, {pin.longitude}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
