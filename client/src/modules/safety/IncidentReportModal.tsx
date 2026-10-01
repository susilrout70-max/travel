import React, { useState } from 'react';
import { X, AlertCircle, Wrench, FileQuestion, HeartPulse, HelpCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../utils/api';

interface IncidentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
  bookingType?: 'HOTEL' | 'VEHICLE';
  defaultType?: string;
}

export const IncidentReportModal: React.FC<IncidentReportModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  bookingType,
  defaultType = 'booking_issue',
}) => {
  const [type, setType] = useState(defaultType);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const incidentTypes = [
    { id: 'vehicle_breakdown', label: 'Vehicle Breakdown / Roadside', icon: Wrench },
    { id: 'medical', label: 'Medical Issue / Health', icon: HeartPulse },
    { id: 'lost_documents', label: 'Lost Documents / Baggage', icon: FileQuestion },
    { id: 'booking_issue', label: 'Check-in or Room Problem', icon: AlertCircle },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await api.post('/safety/incidents', {
        bookingId,
        type,
        location,
        description,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit incident report. Please call concierge directly.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white relative">
          <button
            onClick={() => {
              setSubmitted(false);
              onClose();
            }}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100">
            Rapid Concierge Dispatch
          </span>
          <h3 className="text-2xl font-black tracking-tight">Report In-Trip Incident</h3>
          <p className="text-amber-100 text-xs mt-0.5">
            {bookingId ? `Tied to Booking #${bookingId.slice(0, 8).toUpperCase()}` : 'Quick support ticket dispatch'}
          </p>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Incident Dispatched to Ops Queue</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Our emergency operations coordinator is reviewing this incident and will contact you directly on your registered phone.
                </p>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                For urgent roadside or medical emergencies, please call <span className="font-bold">+91 800-425-TRIP</span> or dial <span className="font-bold">112</span>.
              </div>
              <button
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {error}
                </div>
              )}

              {/* Incident Type Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Incident Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {incidentTypes.map((t) => {
                    const Icon = t.icon;
                    const selected = type === t.id;
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setType(t.id)}
                        className={`p-3 rounded-xl border text-left flex items-start gap-2 text-xs font-bold transition-all ${
                          selected
                            ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${selected ? 'text-amber-600' : 'text-slate-400'}`} />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Current Location / Landmark
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Solang valley turnoff / Hotel lobby"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  What happened? Describe briefly
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your situation so our team can assist effectively..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md disabled:opacity-50"
              >
                {loading ? 'Submitting Report...' : 'Submit Incident to Concierge'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
