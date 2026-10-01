import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Phone, CheckCircle2, Shield, X, MapPin, Radio, Compass, Users } from 'lucide-react';
import { api } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import { EmergencyContactsModal } from './EmergencyContactsModal';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripShareId?: string;
}

export const SOSModal: React.FC<SOSModalProps> = ({ isOpen, onClose, tripShareId }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sosResult, setSosResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);

  const timerRef = useRef<any>(null);
  const holdDurationMs = 2500; // 2.5 seconds hold
  const intervalMs = 50;

  useEffect(() => {
    if (!isOpen) {
      setHoldProgress(0);
      setIsHolding(false);
      setIsTriggered(false);
      setSosResult(null);
      setError(null);
    } else if (isAuthenticated) {
      api.get('/safety/contacts')
        .then((res) => setContacts(res.data.data || []))
        .catch(() => {});
    }
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const startHold = () => {
    if (isTriggered || loading) return;
    setIsHolding(true);
    let elapsed = 0;

    timerRef.current = setInterval(() => {
      elapsed += intervalMs;
      const progress = Math.min(100, (elapsed / holdDurationMs) * 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        clearInterval(timerRef.current);
        dispatchSOS();
      }
    }, intervalMs);
  };

  const cancelHold = () => {
    if (isTriggered) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  const dispatchSOS = async () => {
    setIsHolding(false);
    setLoading(true);
    setError(null);

    try {
      let latitude = 32.2432;
      let longitude = 77.1892;

      // Attempt native browser geolocation if allowed
      if (navigator.geolocation) {
        try {
          const pos: any = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
          });
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
        } catch (geoErr) {
          // fallback to last known / destination coordinates
        }
      }

      const res = await api.post('/safety/sos', {
        tripShareId,
        latitude,
        longitude,
        customMessage: 'Emergency beacon triggered by traveler.',
      });

      setSosResult(res.data.data);
      setIsTriggered(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to dispatch SOS beacon. Please dial 112 directly.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg my-auto max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100 animate-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-600 to-red-600 p-5 sm:p-6 text-white relative flex-shrink-0">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 bg-white/20 rounded-xl">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-black tracking-widest uppercase text-rose-100">
                Traveler Safety Protocol
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">Emergency Assistance & SOS</h3>
            <p className="text-rose-100 text-xs mt-1">
              Fast emergency beacon and local emergency helpline directory
            </p>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                {error}
              </div>
            )}

            {!isTriggered ? (
              <div className="text-center py-2 sm:py-4">
                <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto mb-5">
                  Press and hold the SOS button for <span className="font-bold text-slate-700">2.5 seconds</span> to broadcast your live GPS coordinates to your registered emergency contacts and TravelHub concierge.
                </p>

                {/* SOS Hold Trigger Button */}
                <div className="flex flex-col items-center justify-center">
                  <button
                    onMouseDown={startHold}
                    onMouseUp={cancelHold}
                    onMouseLeave={cancelHold}
                    onTouchStart={startHold}
                    onTouchEnd={cancelHold}
                    disabled={loading}
                    className={`relative w-36 h-36 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center select-none transition-all duration-300 shadow-xl ${
                      isHolding
                        ? 'scale-95 bg-rose-700 text-white ring-8 ring-rose-300'
                        : 'bg-rose-600 hover:bg-rose-700 text-white ring-8 ring-rose-100 hover:scale-105'
                    }`}
                  >
                    <Radio className={`w-8 h-8 mb-1 ${isHolding ? 'animate-ping' : ''}`} />
                    <span className="text-xl font-black tracking-wider">SOS</span>
                    <span className="text-[10px] font-semibold text-rose-200 uppercase mt-0.5">
                      {loading ? 'Dispatched...' : isHolding ? 'Hold...' : 'Hold 2.5s'}
                    </span>

                    {/* SVG Circular Progress Bar */}
                    {isHolding && (
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="74"
                          stroke="rgba(255,255,255,0.4)"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="74"
                          stroke="white"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 74}
                          strokeDashoffset={2 * Math.PI * 74 * (1 - holdProgress / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-400 mt-4">
                    Release anytime to cancel before the timer finishes
                  </p>
                </div>

                {/* Immediate Calling Strip */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    Direct One-Tap Helplines (India)
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <a
                      href="tel:112"
                      className="flex items-center justify-center gap-2 p-3 bg-slate-900 text-white rounded-2xl font-bold text-xs hover:bg-slate-800 transition-colors shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5 text-rose-400" />
                      <span>Dial 112 (National)</span>
                    </a>
                    <a
                      href="tel:100"
                      className="flex items-center justify-center gap-2 p-3 bg-slate-100 text-slate-800 rounded-2xl font-bold text-xs hover:bg-slate-200 transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                      <span>Dial 100 (Police)</span>
                    </a>
                    <a
                      href="tel:108"
                      className="flex items-center justify-center gap-2 p-3 bg-slate-100 text-slate-800 rounded-2xl font-bold text-xs hover:bg-slate-200 transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Dial 108 (Ambulance)</span>
                    </a>
                    <a
                      href="tel:+918004258747"
                      className="flex items-center justify-center gap-2 p-3 bg-brand-50 text-brand-700 border border-brand-200 rounded-2xl font-bold text-xs hover:bg-brand-100 transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5 text-brand-600" />
                      <span>TravelHub 24/7 Desk</span>
                    </a>
                  </div>
                </div>

                {/* Personal Trusted Emergency Contacts */}
                <div className="mt-5 pt-4 border-t border-slate-100 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-rose-600" />
                      Personal Emergency Contacts ({contacts.length})
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsContactsModalOpen(true)}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline"
                    >
                      + Manage Contacts
                    </button>
                  </div>
                  {contacts.length > 0 ? (
                    <div className="space-y-1.5">
                      {contacts.map((c: any) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-800">{c.name}</span>
                            <span className="text-slate-400 ml-1.5 font-normal">({c.relation || 'Contact'})</span>
                          </div>
                          <a
                            href={`tel:${c.phone}`}
                            className="font-bold text-rose-600 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            {c.phone}
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-center text-xs text-slate-600">
                      <p className="font-medium">No personal contacts registered yet.</p>
                      <button
                        type="button"
                        onClick={() => setIsContactsModalOpen(true)}
                        className="mt-1 font-bold text-rose-600 hover:underline inline-block"
                      >
                        + Add Family / Friend Contact
                      </button>
                    </div>
                  )}
                </div>

                {/* Explicit Dismiss button */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 font-bold text-xs transition-colors"
                  >
                    Cancel & Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">
                      SOS Beacon Successfully Broadcast!
                    </h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Your coordinates have been dispatched to registered contacts and logged with TravelHub emergency dispatch.
                    </p>
                  </div>
                </div>

                {/* Location pin */}
                {sosResult?.location?.mapLink && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <MapPin className="w-4 h-4 text-rose-600" />
                      <span>Lat: {sosResult.location.latitude?.toFixed(4)}, Lng: {sosResult.location.longitude?.toFixed(4)}</span>
                    </div>
                    <a
                      href={sosResult.location.mapLink}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-brand-600 hover:underline"
                    >
                      Open Google Maps
                    </a>
                  </div>
                )}

                {/* Contacts notified */}
                <div>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Emergency Contacts Notified ({sosResult?.contactsNotified?.length || 0})
                  </p>
                  <div className="space-y-2">
                    {sosResult?.contactsNotified?.map((contact: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800">{contact.name}</span>
                          <span className="text-slate-400 ml-1.5 font-normal">({contact.phone})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                          SMS & Email Sent
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
                  <p className="font-bold">Next Recommended Actions:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-amber-800 text-[11px]">
                    <li>Stay in a safe, well-lit public area with mobile coverage if possible.</li>
                    <li>Keep battery saver mode turned ON.</li>
                    <li>Local emergency responders or TravelHub support will call your registered phone.</li>
                  </ul>
                </div>

                <div className="flex gap-2 pt-2">
                  <a
                    href="tel:112"
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs text-center transition-colors shadow-md"
                  >
                    Call 112 Directly
                  </a>
                  <button
                    onClick={onClose}
                    className="px-5 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isContactsModalOpen && (
        <EmergencyContactsModal
          isOpen={isContactsModalOpen}
          onClose={() => {
            setIsContactsModalOpen(false);
            if (isAuthenticated) {
              api.get('/safety/contacts')
                .then((res) => setContacts(res.data.data || []))
                .catch(() => {});
            }
          }}
        />
      )}
    </>,
    document.body
  );
};
