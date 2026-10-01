import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  MapPin,
  Star,
  Shield,
  Zap,
  Activity,
  Heart,
  ArrowRight,
  Sun,
  CloudRain,
  Compass,
  CheckCircle2,
  Calendar,
  Car,
  Bike,
  Hotel as HotelIcon,
} from 'lucide-react';
import { UnifiedSearchBar } from '../search/UnifiedSearchBar';
import { InteractiveMap } from '../map/InteractiveMap';
import { api } from '../../utils/api';
import { Destination, Hotel, Vehicle } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { fallbackDestinations, fallbackHotels, fallbackVehicles } from '../../utils/fallbackData';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [recommendations, setRecommendations] = useState<Destination[]>(fallbackDestinations);
  const [featuredHotels, setFeaturedHotels] = useState<Hotel[]>(fallbackHotels);
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>(fallbackVehicles);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recsRes, hotelsRes, vehiclesRes] = await Promise.allSettled([
          api.get('/recommendations'),
          api.get('/hotels?sortBy=rating'),
          api.get('/vehicles'),
        ]);

        if (recsRes.status === 'fulfilled' && recsRes.value.data?.data?.length > 0) {
          setRecommendations(recsRes.value.data.data);
        }
        if (hotelsRes.status === 'fulfilled' && hotelsRes.value.data?.data?.length > 0) {
          setFeaturedHotels(hotelsRes.value.data.data.slice(0, 4));
        }
        if (vehiclesRes.status === 'fulfilled' && vehiclesRes.value.data?.data?.length > 0) {
          setFeaturedVehicles(vehiclesRes.value.data.data.slice(0, 4));
        }
      } catch (e) {
        console.warn('API unavailable, continuing with verified destination content:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const categories = [
    { id: 'ALL', label: 'All Destinations' },
    { id: 'HILL_STATION', label: 'Hill Stations' },
    { id: 'BEACH', label: 'Beaches & Islands' },
    { id: 'NATURE', label: 'Nature & Tea Valleys' },
    { id: 'ADVENTURE', label: 'Adventure & Expeditions' },
    { id: 'WILDLIFE', label: 'Wildlife & Safaris' },
    { id: 'CULTURAL', label: 'Heritage & Culture' },
  ];

  const filteredRecs =
    selectedCategory === 'ALL'
      ? recommendations
      : recommendations.filter((d) => d.category === selectedCategory);

  const tickerDestinations = [
    { name: 'Manali', temp: '14°C', weather: 'Crisp Breeze', traffic: 'Light' },
    { name: 'Goa', temp: '29°C', weather: 'Sunny Coastal', traffic: 'Moderate' },
    { name: 'Munnar', temp: '18°C', weather: 'Misty Valleys', traffic: 'Clear' },
    { name: 'Leh-Ladakh', temp: '11°C', weather: 'High Desert Clear', traffic: 'Open Passes' },
    { name: 'Jim Corbett', temp: '26°C', weather: 'Safari Sunny', traffic: 'Zone Active' },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[640px] pt-12 pb-24 flex flex-col justify-center items-center text-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=85"
            alt="Himalayan and coastal vistas"
            className="w-full h-full object-cover brightness-[0.45] scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-50"></div>
        </div>

        {/* Hero Content */}
        <div className="max-w-4xl mx-auto px-4 space-y-6 pt-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-wide animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Discover India’s Hidden Marvels • Verified Bookings & Live Pulse
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            Curated Stays. Iconic Rides.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-teal-200 to-emerald-300">
              Live Destination Pulse.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-200 font-medium max-w-2xl mx-auto leading-relaxed">
            From misty tea valleys in Kerala to snow-laden Himalayan chalets and coastal sunrises.
            Book verified hotels, self-drive 4x4s, and track live conditions in real-time.
          </p>
        </div>

        {/* Search Bar Container */}
        <div className="w-full max-w-5xl mx-auto px-4 mt-10">
          <UnifiedSearchBar />
        </div>
      </section>

      {/* Live Destination Pulse Ticker */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-brand-600 font-bold text-xs uppercase tracking-wider flex-shrink-0">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Live Pulse Stream:
          </div>

          <div className="flex items-center gap-4 overflow-x-auto w-full no-scrollbar text-xs font-semibold text-slate-700">
            {tickerDestinations.map((td) => (
              <Link
                key={td.name}
                to={`/pulse/${td.name.toLowerCase()}`}
                className="flex items-center gap-2 bg-slate-50 hover:bg-brand-50 hover:text-brand-700 px-3 py-1.5 rounded-xl border border-slate-200 flex-shrink-0 transition-colors"
              >
                <span className="font-bold text-slate-900">{td.name}:</span>
                <span className="text-brand-600 font-bold">{td.temp}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">{td.weather}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
                  Traffic {td.traffic}
                </span>
              </Link>
            ))}
          </div>

          <Link
            to="/pulse"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 flex-shrink-0"
          >
            Full Radar <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Personalized Recommendations Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Tailored For Your Travel Style
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Recommended Destinations
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Ranked dynamically by seasonal conditions, trending popularity, and traveler affinities.
            </p>
          </div>

          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700"
          >
            Explore All Guides <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredRecs.slice(0, 4).map((dest) => {
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
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={destImage}
                    alt={dest.name}
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-teal-400" />
                    {dest.state}
                  </div>

                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                  {dest.category.replace('_', ' ')}
                </div>

                {dest.recommendationReason && (
                  <div className="absolute bottom-3 left-3 right-3 bg-brand-950/80 backdrop-blur-md text-brand-200 text-[10px] font-semibold px-2.5 py-1 rounded-xl truncate">
                    ✨ {dest.recommendationReason}
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-brand-600 transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {dest.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Best Season: {dest.bestSeason.split(' ')[0]}</span>
                  <span className="text-brand-600 font-bold flex items-center gap-1">
                    View Guide <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Stays & Luxury Escapes */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
                <HotelIcon className="w-3.5 h-3.5" />
                Hand-Picked Accommodations
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Featured Stays & Boutique Resorts
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Verified luxury hotels, mountain chalets, and heritage palace retreats.
              </p>
            </div>

            <Link
              to="/hotels"
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700"
            >
              View All 16+ Stays <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredHotels.map((hotel) => {
              const hotelImg =
                Array.isArray(hotel.images) && hotel.images.length > 0
                  ? hotel.images[0]
                  : typeof hotel.images === 'string' && hotel.images.startsWith('[')
                  ? JSON.parse(hotel.images)[0]
                  : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80';

              return (
                <Link
                  key={hotel.id}
                  to={`/hotels/${hotel.id}`}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={hotelImg}
                      alt={hotel.name}
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full text-xs font-bold text-slate-800 flex items-center gap-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {hotel.rating}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {hotel.destination?.name || 'Verified Retreat'}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 mt-0.5">
                        {hotel.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-1">{hotel.address}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Starts from
                        </span>
                        <span className="text-base font-black text-brand-600">
                          ₹{(hotel.startingPrice || 4500).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium"> / night</span>
                      </div>

                      <span className="px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 text-xs font-bold group-hover:bg-brand-600 group-hover:text-white transition-colors">
                        Book Stay
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Top Rental Rides (Cars & Bikes) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
              <Car className="w-3.5 h-3.5" />
              Freedom of the Open Road
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Self-Drive 4x4s & Cruiser Bikes
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Explore Himalayan passes, coastal roads, and safari routes on your own terms.
            </p>
          </div>

          <Link
            to="/vehicles"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700"
          >
            Explore All Vehicles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredVehicles.map((veh) => {
            const vehImg =
              Array.isArray(veh.images) && veh.images.length > 0
                ? veh.images[0]
                : typeof veh.images === 'string' && veh.images.startsWith('[')
                ? JSON.parse(veh.images)[0]
                : 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={veh.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={vehImg}
                    alt={veh.name}
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    {veh.type === 'CAR' ? <Car className="w-3.5 h-3.5" /> : <Bike className="w-3.5 h-3.5" />}
                    {veh.type}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/95 text-slate-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                    {veh.city} Hub
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{veh.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>{veh.fuelType}</span>
                      <span>•</span>
                      <span>{veh.transmission}</span>
                      <span>•</span>
                      <span>{veh.seatingCapacity} Seats</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-base font-black text-slate-900">
                        ₹{veh.pricePerDay.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-500"> / day</span>
                    </div>

                    <Link
                      to="/vehicles"
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold transition-colors"
                    >
                      Rent Now
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive India Explorer Map */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Pan-India Map Explorer
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
            Navigate Verified Destinations & Live Stays
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Click on markers across North, West, South, and Islands to view live pulse and lodging.
          </p>
        </div>

        <InteractiveMap
          center={[22.5, 78.5]}
          zoom={5}
          className="h-[460px]"
          markers={recommendations.map((d) => ({
            id: d.id,
            lat: d.latitude,
            lng: d.longitude,
            title: `${d.name} (${d.category.replace('_', ' ')})`,
            subtitle: `${d.state} • ${d.hotelCount || 0} luxury stays available`,
            color: '#0d9488',
          }))}
        />
      </section>

      {/* Why Choose TravelHub */}
      <section className="bg-slate-950 text-white py-20 rounded-3xl mx-4 sm:mx-8 lg:mx-12 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs font-bold tracking-widest uppercase text-brand-400">
              Why TravelHub
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              The Next Era of Indian Tourism
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Real-Time Destination Pulse</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Check live weather radar, road congestion indices, regional wildlife sightings, and
                verified landscape imagery before packing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Zero-Fraud Razorpay Escrow</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bank-grade encrypted payments with instant verifiable e-vouchers and hassle-free
                policy-based cancellations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Live GPS Trip Sharing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate secure, time-limited trip links to share real-time pin updates and itinerary
                milestones with family and companions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
