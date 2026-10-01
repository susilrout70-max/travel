import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Hotel as HotelIcon,
  Search,
  Filter,
  Star,
  MapPin,
  Wifi,
  Coffee,
  Waves,
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react';
import { api } from '../../utils/api';
import { Hotel } from '../../types';
import { fallbackHotels } from '../../utils/fallbackData';

export const HotelsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotels, setHotels] = useState<Hotel[]>(fallbackHotels);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'rating');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const destinationSlug = searchParams.get('destinationSlug') || '';

  const amenitiesList = [
    'Free High-Speed WiFi',
    'Heated Pool',
    'Mountain View',
    'Luxury Spa',
    'Complimentary Breakfast',
    'Fireplace',
    'Private Beach Access',
  ];

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const fetchHotels = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (destinationSlug) params.append('destinationSlug', destinationSlug);
      if (minRating) params.append('minRating', minRating);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sortBy) params.append('sortBy', sortBy);
      if (selectedAmenities.length > 0) {
        params.append('amenities', selectedAmenities.join(','));
      }

      const res = await api.get(`/hotels?${params.toString()}`);
      if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
        setHotels(res.data.data);
        setLoading(false);
        return;
      }
    } catch (e) {
      // Fallback
    }

    // Local filter on fallbackHotels
    let filtered = [...fallbackHotels];
    if (destinationSlug) {
      filtered = filtered.filter(
        (h) => h.destination?.slug === destinationSlug || h.destinationId.includes(destinationSlug)
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q) ||
          h.description.toLowerCase().includes(q)
      );
    }
    if (minRating) {
      filtered = filtered.filter((h) => h.rating >= parseFloat(minRating));
    }
    if (maxPrice) {
      filtered = filtered.filter((h) => (h.startingPrice || 0) <= parseFloat(maxPrice));
    }
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter((h) =>
        selectedAmenities.every((amenity) => (h.amenities || []).includes(amenity))
      );
    }
    if (sortBy === 'price_asc') {
      filtered.sort((a, b) => (a.startingPrice || 0) - (b.startingPrice || 0));
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => (b.startingPrice || 0) - (a.startingPrice || 0));
    } else {
      filtered.sort((a, b) => b.rating - a.rating);
    }
    setHotels(filtered);
    setLoading(false);
  };

  useEffect(() => {
    fetchHotels();
  }, [searchParams, destinationSlug, minRating, maxPrice, sortBy, selectedAmenities]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHotels();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
            <HotelIcon className="w-4 h-4" />
            Verified Stays & Resorts
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {destinationSlug
              ? `Stays in ${destinationSlug.charAt(0).toUpperCase() + destinationSlug.slice(1)}`
              : 'Browse Luxury Stays across India'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {hotels.length} boutique retreats, heritage palaces, and nature lodges available
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          >
            <option value="rating">Top Rated (4.8+)</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                Filter Stays
              </h3>
              {(searchQuery || minRating || maxPrice || selectedAmenities.length > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setMinRating('');
                    setMaxPrice('');
                    setSelectedAmenities([]);
                  }}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Keyword / Hotel Name
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Castle, Taj, Chalet..."
                  className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Price Cap */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5">
                <span className="uppercase tracking-wider text-slate-500">Max Nightly Price</span>
                <span className="text-brand-600 font-bold">
                  {maxPrice ? `₹${Number(maxPrice).toLocaleString('en-IN')}` : 'Any Price'}
                </span>
              </div>
              <input
                type="range"
                min={2500}
                max={25000}
                step={500}
                value={maxPrice || 25000}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                <span>₹2,500</span>
                <span>₹12,000</span>
                <span>₹25,000+</span>
              </div>
            </div>

            {/* Min Rating */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Guest Rating
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['', '4.5', '4.8'].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setMinRating(rate)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-colors ${
                      minRating === rate
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {rate ? `${rate}+ ★` : 'All'}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities Checkboxes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Amenities & Perks
              </label>
              <div className="space-y-2">
                {amenitiesList.map((amenity) => {
                  const isChecked = selectedAmenities.includes(amenity);
                  return (
                    <label
                      key={amenity}
                      className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer hover:text-slate-900"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleAmenity(amenity)}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span>{amenity}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Hotels Grid */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-80 rounded-3xl bg-slate-200 animate-pulse"></div>
              ))}
            </div>
          ) : hotels.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-slate-200 space-y-4">
              <HotelIcon className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No matching stays found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try clearing your price, rating, or amenity filters to discover more properties.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={
                        Array.isArray(hotel.images) && hotel.images.length > 0
                          ? hotel.images[0]
                          : typeof hotel.images === 'string' && hotel.images.startsWith('[')
                          ? JSON.parse(hotel.images)[0]
                          : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80'
                      }
                      alt={hotel.name}
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-slate-950/70 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-teal-400" />
                      {hotel.destination?.name || 'India'}
                    </div>

                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-bold text-slate-900 flex items-center gap-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {hotel.rating}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                        {hotel.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {hotel.description}
                      </p>

                      {/* Amenities pills */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                          >
                            {amenity}
                          </span>
                        ))}
                        {hotel.amenities.length > 3 && (
                          <span className="text-[10px] font-semibold text-slate-400 self-center">
                            +{hotel.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Starting Nightly Rate
                        </span>
                        <span className="text-xl font-black text-brand-700">
                          ₹{(hotel.startingPrice || 4500).toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-500"> / night</span>
                      </div>

                      <Link
                        to={`/hotels/${hotel.id}`}
                        className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all group-hover:scale-105"
                      >
                        View Rooms & Book
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
