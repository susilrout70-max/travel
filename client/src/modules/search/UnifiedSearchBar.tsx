import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Hotel,
  Car,
  Bike,
  Search,
  MapPin,
  Calendar,
  Users,
  Clock,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useBookingStore } from '../../store/bookingStore';

export const UnifiedSearchBar: React.FC = () => {
  const navigate = useNavigate();
  const {
    searchCategory,
    setSearchCategory,
    searchDestination,
    setSearchDestination,
    checkInDate,
    checkOutDate,
    setDates,
    guestCount,
    setGuestCount,
    vehicleType,
    setVehicleType,
    vehicleCity,
    setVehicleCity,
  } = useBookingStore();

  const [suggestOpen, setSuggestOpen] = useState(false);

  const popularDestinations = [
    { name: 'Manali', state: 'Himachal Pradesh', type: 'Hill Station' },
    { name: 'Goa', state: 'Goa', type: 'Beach Paradise' },
    { name: 'Munnar', state: 'Kerala', type: 'Tea Estates' },
    { name: 'Leh-Ladakh', state: 'Ladakh', type: 'Adventure Desert' },
    { name: 'Jaipur', state: 'Rajasthan', type: 'Royal Heritage' },
    { name: 'Jim Corbett', state: 'Uttarakhand', type: 'Tiger Safari' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCategory === 'HOTELS') {
      const params = new URLSearchParams();
      if (searchDestination) params.append('search', searchDestination);
      params.append('checkIn', checkInDate);
      params.append('checkOut', checkOutDate);
      params.append('guests', guestCount.toString());
      navigate(`/hotels?${params.toString()}`);
    } else {
      const params = new URLSearchParams();
      if (vehicleCity) params.append('city', vehicleCity);
      if (vehicleType !== 'ALL') params.append('type', vehicleType);
      navigate(`/vehicles?${params.toString()}`);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-4 sm:p-6 border border-white/80 transition-all duration-300">
      {/* Category Tabs */}
      <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
        <button
          type="button"
          onClick={() => setSearchCategory('HOTELS')}
          className={`flex items-center gap-2.5 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
            searchCategory === 'HOTELS'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 scale-[1.02]'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Hotel className="w-4 h-4" />
          Hotels & Stays
        </button>

        <button
          type="button"
          onClick={() => setSearchCategory('VEHICLES')}
          className={`flex items-center gap-2.5 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
            searchCategory === 'VEHICLES'
              ? 'bg-slate-900 text-white shadow-md scale-[1.02]'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Car className="w-4 h-4" />
          Car & Bike Rentals
        </button>
      </div>

      {/* Form Area */}
      <form onSubmit={handleSearch} className="pt-4">
        {searchCategory === 'HOTELS' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            {/* Destination Input */}
            <div className="relative md:col-span-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Destination / City
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-brand-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchDestination}
                  onChange={(e) => setSearchDestination(e.target.value)}
                  onFocus={() => setSuggestOpen(true)}
                  placeholder="Where are you traveling?"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                />
              </div>

              {/* Suggestions dropdown */}
              {suggestOpen && (
                <div
                  className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-glass border border-slate-100 p-2 z-30"
                  onMouseLeave={() => setSuggestOpen(false)}
                >
                  <p className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1">
                    Popular Destinations
                  </p>
                  {popularDestinations.map((dest) => (
                    <button
                      key={dest.name}
                      type="button"
                      onClick={() => {
                        setSearchDestination(dest.name);
                        setSuggestOpen(false);
                      }}
                      className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl hover:bg-brand-50 transition-colors text-xs"
                    >
                      <span className="font-bold text-slate-800">
                        {dest.name}, {dest.state}
                      </span>
                      <span className="text-[10px] text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
                        {dest.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Check-in & Check-out */}
            <div className="md:col-span-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Check-in — Check-out
              </label>
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 text-brand-500 absolute left-3 top-3.5" />
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setDates(e.target.value, checkOutDate)}
                  className="w-full pl-9 pr-2 py-2 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Guests */}
            <div className="md:col-span-0.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Guests
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-brand-500 absolute left-3.5 top-3.5" />
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                  <option value={3}>3 Guests</option>
                  <option value={4}>4+ Guests</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-1 pt-4 md:pt-0">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5"
              >
                <Search className="w-4 h-4" />
                Find Stays
              </button>
            </div>
          </div>
        ) : (
          /* Car & Bike Rentals Tab */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            {/* City */}
            <div className="md:col-span-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Rental City / Hub
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-brand-500 absolute left-3.5 top-3.5" />
                <select
                  value={vehicleCity}
                  onChange={(e) => setVehicleCity(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">All Rental Hubs</option>
                  <option value="Manali">Manali Hub (Himalayan 4x4 & Bikes)</option>
                  <option value="Goa">Goa Hub (Coastal SUVs & EVs)</option>
                  <option value="Munnar">Munnar Hub (Innova & Cruisers)</option>
                  <option value="Leh-Ladakh">Leh-Ladakh Hub (Expedition 4x4)</option>
                  <option value="Jaipur">Jaipur Hub (Heritage Fleet)</option>
                  <option value="Jim Corbett">Jim Corbett Hub (Gypsy Safari)</option>
                </select>
              </div>
            </div>

            {/* Vehicle Type */}
            <div className="md:col-span-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Vehicle Type
              </label>
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setVehicleType('ALL')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    vehicleType === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleType('CAR')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
                    vehicleType === 'CAR' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <Car className="w-3 h-3" /> Cars
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleType('BIKE')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
                    vehicleType === 'BIKE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <Bike className="w-3 h-3" /> Bikes
                </button>
              </div>
            </div>

            {/* Plan / Duration */}
            <div className="md:col-span-0.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Rate Plan
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <select className="w-full pl-9 pr-3 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800">
                  <option value="daily">Daily Rental</option>
                  <option value="hourly">Hourly Rental</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="md:col-span-1 pt-4 md:pt-0">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5"
              >
                <Search className="w-4 h-4" />
                Search Rides
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
