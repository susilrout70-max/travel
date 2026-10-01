import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Search, MapPin, ArrowRight, Activity, Hotel } from 'lucide-react';
import { api } from '../../utils/api';
import { Destination } from '../../types';
import { fallbackDestinations } from '../../utils/fallbackData';

export const DestinationsPage: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>(fallbackDestinations);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [pathType, setPathType] = useState<'POPULAR' | 'OFFBEAT'>('POPULAR');

  const categories = [
    { id: 'ALL', label: 'All Destinations' },
    { id: 'HILL_STATION', label: 'Hill Stations' },
    { id: 'BEACH', label: 'Beaches' },
    { id: 'NATURE', label: 'Nature & Valleys' },
    { id: 'ADVENTURE', label: 'High Altitude' },
    { id: 'WILDLIFE', label: 'Wildlife Safaris' },
    { id: 'CULTURAL', label: 'Spiritual & Heritage' },
  ];

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category !== 'ALL') params.append('category', category);

        const res = await api.get(`/destinations?${params.toString()}`);
        let data = res.data?.data;
        if (Array.isArray(data) && data.length > 0) {
          if (pathType === 'OFFBEAT') {
            data = [...data].sort((a, b) => {
              const isOffbeatA = a.category === 'NATURE' || a.category === 'ADVENTURE' || a.category === 'WILDLIFE';
              const isOffbeatB = b.category === 'NATURE' || b.category === 'ADVENTURE' || b.category === 'WILDLIFE';
              return (isOffbeatB ? 1 : 0) - (isOffbeatA ? 1 : 0);
            });
          }
          setDestinations(data);
          return;
        }
      } catch (e) {
        // Fallback filter
      }

      // Filter locally from fallbackDestinations
      let filtered = [...fallbackDestinations];
      if (category !== 'ALL') {
        filtered = filtered.filter((d) => d.category === category);
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.state.toLowerCase().includes(q) ||
            d.description.toLowerCase().includes(q)
        );
      }
      if (pathType === 'OFFBEAT') {
        filtered.sort((a, b) => {
          const isOffbeatA = a.category === 'NATURE' || a.category === 'ADVENTURE' || a.category === 'WILDLIFE';
          const isOffbeatB = b.category === 'NATURE' || b.category === 'ADVENTURE' || b.category === 'WILDLIFE';
          return (isOffbeatB ? 1 : 0) - (isOffbeatA ? 1 : 0);
        });
      }
      setDestinations(filtered);
      setLoading(false);
    };

    fetchDestinations();
  }, [search, category, pathType]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600">
            <Compass className="w-4 h-4" />
            Curated Travel Discovery
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Explore India’s Most Captivating Regions
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Insider travel guides, crowd density warnings, and curated local offbeat spots.
          </p>
        </div>

        {/* Discovery Layer Toggle: Popular vs Off the Beaten Path */}
        <div className="flex items-center p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => setPathType('POPULAR')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              pathType === 'POPULAR'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🌟 Popular Hotspots
          </button>
          <button
            onClick={() => setPathType('OFFBEAT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              pathType === 'OFFBEAT'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🌿 Off the Beaten Path
          </button>
        </div>
      </div>

      {/* Search & Categories Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                category === cat.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search destination, state..."
            className="w-full pl-10 pr-4 py-2 bg-white rounded-2xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Destinations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 rounded-3xl bg-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((dest) => {
            const destImage =
              Array.isArray(dest.images) && dest.images.length > 0
                ? dest.images[0]
                : typeof dest.images === 'string' && dest.images.startsWith('[')
                ? JSON.parse(dest.images)[0]
                : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';

            return (
              <Link
                key={dest.id}
                to={`/destinations/${dest.slug}`}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1"
              >
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={destImage}
                    alt={dest.name}
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                <div className="absolute top-3 left-3 bg-slate-950/70 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-teal-400" />
                  {dest.state}
                </div>
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-slate-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
                  {dest.category.replace('_', ' ')}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-brand-600 transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {dest.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Hotel className="w-3.5 h-3.5 text-brand-600" />
                    {dest.hotelCount || 0} stays
                  </span>

                  <span className="text-brand-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Guide <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      )}
    </div>
  );
};
