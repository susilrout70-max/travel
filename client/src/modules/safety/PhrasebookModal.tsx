import React, { useState, useEffect } from 'react';
import { X, Volume2, Globe, HeartPulse, ShieldAlert, FileQuestion, HelpCircle, Eye } from 'lucide-react';
import { api } from '../../utils/api';

interface PhrasebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryCode?: string;
}

export const PhrasebookModal: React.FC<PhrasebookModalProps> = ({
  isOpen,
  onClose,
  countryCode = 'IN',
}) => {
  const [phrases, setPhrases] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeLargePhrase, setActiveLargePhrase] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPhrases();
    }
  }, [isOpen, countryCode]);

  const fetchPhrases = async () => {
    // Check localStorage cache first for offline readiness
    const cacheKey = `emergency_phrases_${countryCode}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setPhrases(JSON.parse(cached));
      } catch (e) {
        // ignore
      }
    }

    setLoading(true);
    try {
      const res = await api.get(`/safety/phrases?country=${countryCode}`);
      setPhrases(res.data.data);
      localStorage.setItem(cacheKey, JSON.stringify(res.data.data));
    } catch (err) {
      console.warn('Using offline phrases fallback');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Phrases', icon: Globe },
    { id: 'medical', label: 'Medical', icon: HeartPulse },
    { id: 'police', label: 'Police', icon: ShieldAlert },
    { id: 'documents', label: 'Lost Docs', icon: FileQuestion },
    { id: 'general', label: 'Directions', icon: HelpCircle },
  ];

  const filteredPhrases =
    selectedCategory === 'all'
      ? phrases
      : phrases.filter((p) => p.category === selectedCategory);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 text-white relative flex-shrink-0">
          <button
            onClick={() => {
              setActiveLargePhrase(null);
              onClose();
            }}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
              Offline Ready ⚡
            </span>
            <span className="text-teal-100 text-xs font-semibold">India (Hindi & Regional)</span>
          </div>
          <h3 className="text-2xl font-black tracking-tight">Emergency Phrasebook</h3>
          <p className="text-teal-100 text-xs mt-0.5">
            Instant translations with high-contrast cards to show locals in emergencies
          </p>
        </div>

        {/* Large "Show to Someone" Card View */}
        {activeLargePhrase ? (
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center bg-amber-50/50">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3">
              Show this screen to someone nearby
            </span>
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-amber-200 w-full max-w-lg space-y-4">
              <p className="text-3xl font-black text-slate-900 leading-snug tracking-wide">
                {activeLargePhrase.localText}
              </p>
              {activeLargePhrase.phonetic && (
                <p className="text-sm font-semibold text-brand-600 italic">
                  Pronounce: &ldquo;{activeLargePhrase.phonetic}&rdquo;
                </p>
              )}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  English Translation:
                </p>
                <p className="text-base font-bold text-slate-700 mt-1">
                  {activeLargePhrase.englishText}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveLargePhrase(null)}
              className="mt-6 px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
            >
              ← Back to All Phrases
            </button>
          </div>
        ) : (
          <>
            {/* Category Filter Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/70 px-4 py-2 gap-1.5 overflow-x-auto flex-shrink-0">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      active
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Phrases List */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {filteredPhrases.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400">
                  {loading ? 'Loading emergency phrases...' : 'No phrases available in this category.'}
                </p>
              ) : (
                filteredPhrases.map((phrase) => (
                  <div
                    key={phrase.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all flex items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {phrase.category}
                        </span>
                        <p className="text-xs font-bold text-slate-800">{phrase.englishText}</p>
                      </div>
                      <p className="text-base font-black text-brand-700 tracking-wide">
                        {phrase.localText}
                      </p>
                      {phrase.phonetic && (
                        <p className="text-[11px] text-slate-400 italic">
                          Pronounce: &ldquo;{phrase.phonetic}&rdquo;
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => setActiveLargePhrase(phrase)}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 text-slate-700 group-hover:bg-brand-50 group-hover:text-brand-600 font-bold text-xs border border-slate-200 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Show Card</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between flex-shrink-0">
          <span>Cached for offline access when cell signals drop</span>
          <button onClick={onClose} className="font-bold text-slate-700 hover:text-slate-900">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
