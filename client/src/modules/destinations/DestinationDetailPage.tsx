import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Calendar,
  Sparkles,
  Heart,
  Share2,
  CheckCircle2,
  ArrowRight,
  Activity,
  Hotel as HotelIcon,
  Sun,
  ShieldAlert,
  Leaf,
  Clock,
  Car,
  ThumbsUp,
  CloudRain,
  Thermometer,
  Shield,
  Phone,
  FileText,
  UserCheck,
  Users,
} from 'lucide-react';
import { api } from '../../utils/api';
import { Destination, LivePulseData } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { PhrasebookModal } from '../safety/PhrasebookModal';
import { SOSModal } from '../safety/SOSModal';
import { fallbackDestinations, fallbackPulseData, fallbackHotels } from '../../utils/fallbackData';

export const DestinationDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, openAuthModal } = useAuthStore();

  const initialDest = fallbackDestinations.find((d) => d.slug === slug) || fallbackDestinations[0];
  const initialPulse = (slug && fallbackPulseData[slug]) || fallbackPulseData['manali'];

  const [destination, setDestination] = useState<any | null>(initialDest);
  const [pulseData, setPulseData] = useState<LivePulseData | null>(initialPulse);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'GUIDE' | 'LOCAL_PICKS' | 'SEASONS' | 'EMERGENCY' | 'PULSE' | 'STAYS'
  >('GUIDE');
  const [localPicks, setLocalPicks] = useState<any[]>([]);
  const [isPhrasebookOpen, setIsPhrasebookOpen] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [destRes, pulseRes] = await Promise.allSettled([
          api.get(`/destinations/${slug}`),
          api.get(`/live-info/${slug}`),
        ]);

        if (destRes.status === 'fulfilled' && destRes.value.data?.data) {
          setDestination(destRes.value.data.data);
          setIsWishlisted(destRes.value.data.data.isWishlisted || false);
          setLocalPicks(destRes.value.data.data.localPicks || []);
        } else {
          const fallback = fallbackDestinations.find((d) => d.slug === slug);
          if (fallback) {
            const hotelsForDest = fallbackHotels.filter(
              (h) => h.destinationId === fallback.id || h.destination?.slug === slug
            );
            setDestination({ ...fallback, hotels: hotelsForDest });
          }
        }

        if (pulseRes.status === 'fulfilled' && pulseRes.value.data?.data) {
          setPulseData(pulseRes.value.data.data);
        } else if (slug && fallbackPulseData[slug]) {
          setPulseData(fallbackPulseData[slug]);
        }
      } catch (err) {
        console.warn('API notice: using verified fallback guide data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const handleUpvote = async (pickId: string) => {
    try {
      await api.post(`/destinations/${destination!.id}/local-picks/${pickId}/upvote`);
      setLocalPicks((prev) =>
        prev.map((p) => (p.id === pickId ? { ...p, upvotes: p.upvotes + 1 } : p))
      );
    } catch (e) {
      // ignore
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (!destination) return;

    try {
      const res = await api.post('/destinations/wishlist/toggle', {
        destinationId: destination.id,
      });
      setIsWishlisted(res.data.data.isWishlisted);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !destination) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-500">Loading destination guide & pulse...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Hero Header */}
      <div className="relative h-[480px] flex items-end">
        <img
          src={
            Array.isArray(destination.images) && destination.images.length > 0
              ? destination.images[0]
              : typeof destination.images === 'string' && destination.images.startsWith('[')
              ? JSON.parse(destination.images)[0]
              : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80'
          }
          alt={destination.name}
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80';
          }}
          className="absolute inset-0 w-full h-full object-cover brightness-[0.4]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-6 text-white">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="bg-brand-500 text-white text-xs font-black uppercase px-3 py-1 rounded-full">
                {destination.category.replace('_', ' ')}
              </span>
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                {destination.state}, India
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight">{destination.name}</h1>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
              {destination.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleWishlist}
              className={`p-3.5 rounded-2xl backdrop-blur-md border transition-all ${
                isWishlisted
                  ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-white' : ''}`} />
            </button>

            <Link
              to={`/hotels?destinationSlug=${destination.slug}`}
              className="px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-500/30 transition-all flex items-center gap-2"
            >
              <HotelIcon className="w-4 h-4" />
              Book Stays in {destination.name}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('GUIDE')}
            className={`pb-4 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'GUIDE'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            Curated Guide
          </button>

          <button
            onClick={() => setActiveTab('LOCAL_PICKS')}
            className={`pb-4 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'LOCAL_PICKS'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Local Picks ({localPicks.length})
          </button>

          <button
            onClick={() => setActiveTab('SEASONS')}
            className={`pb-4 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'SEASONS'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4 text-teal-500" />
            12-Month Climate
          </button>

          <button
            onClick={() => setActiveTab('EMERGENCY')}
            className={`pb-4 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'EMERGENCY'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-4 h-4 text-rose-500" />
            Emergency Directory
          </button>

          <button
            onClick={() => setActiveTab('PULSE')}
            className={`pb-4 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'PULSE'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-500" />
            Live Pulse Radar
          </button>

          <button
            onClick={() => setActiveTab('STAYS')}
            className={`pb-4 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'STAYS'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HotelIcon className="w-4 h-4" />
            Hotels & Resorts ({destination.hotels?.length || 0})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {activeTab === 'GUIDE' && destination.travelGuide && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              {/* Highlights */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Must-Experience Highlights
                </h2>
                <div className="space-y-3">
                  {destination.travelGuide.highlights.map((highlight: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                      <div className="w-5 h-5 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="leading-relaxed font-medium">{highlight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day by day Itinerary */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-brand-600" />
                  Suggested 3-Day Explorer Itinerary
                </h2>
                <div className="space-y-4">
                  {destination.travelGuide.sampleItinerary.map((item: any) => (
                    <div
                      key={item.day}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider bg-slate-900 text-white px-2.5 py-0.5 rounded-md">
                          Day {item.day}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.plan}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar: Best Time & Insider Tips */}
            <div className="space-y-6">
              {/* Best Time */}
              <div className="bg-brand-50/50 p-6 rounded-3xl border border-brand-100 space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-800 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-500" />
                  Optimal Travel Window
                </h3>
                <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                  {destination.travelGuide.bestTimeToVisit}
                </p>
              </div>

              {/* Local Tips */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Insider Local Tips
                </h3>
                <div className="space-y-3">
                  {destination.travelGuide.localTips.map((tip: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Pulse Tab */}
        {activeTab === 'PULSE' && pulseData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Weather Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-500" /> Live Weather
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {pulseData.pulse.weather.source}
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-slate-900">
                  {pulseData.pulse.weather.temperature}°C
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {pulseData.pulse.weather.condition}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">Humidity</span>
                  <span className="font-bold text-slate-800">
                    {pulseData.pulse.weather.humidity}%
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">Wind</span>
                  <span className="font-bold text-slate-800">
                    {pulseData.pulse.weather.windSpeedKmH} km/h
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">Air Quality</span>
                  <span className="font-bold text-slate-800">AQI 38</span>
                </div>
              </div>
            </div>

            {/* Traffic Density Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-emerald-500" /> Traffic Density
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {pulseData.pulse.traffic.source}
                </span>
              </div>

              <div>
                <span className="text-2xl font-black text-slate-900">
                  {pulseData.pulse.traffic.congestionLevel} Congestion
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Best window: {pulseData.pulse.traffic.bestTravelWindow}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                {pulseData.pulse.traffic.liveAlerts[0]}
              </div>
            </div>

            {/* Regional Wildlife Tracker */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-teal-500" /> Regional Wildlife
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">GBIF Biodiversity</span>
              </div>

              <div>
                <span className="text-2xl font-black text-slate-900">
                  {pulseData.pulse.wildlife.speciesCount}+ Species
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Spotting probability: {pulseData.pulse.wildlife.spottingProbability}
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                {pulseData.pulse.wildlife.featuredFauna.slice(0, 2).map((fauna, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-slate-50 p-2 rounded-xl"
                  >
                    <span className="font-semibold text-slate-800">{fauna.name.split('(')[0]}</span>
                    <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md">
                      {fauna.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* Live Crowd Density Indicator */}
            {pulseData?.pulse?.crowd && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-500" /> Real-time Crowd Density
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">Places Density API</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-black text-slate-900">
                      {pulseData.pulse.crowd.level} Footfall
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {pulseData.pulse.crowd.percent}% peak capacity right now
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${
                      pulseData.pulse.crowd.level === 'HIGH'
                        ? 'bg-rose-100 text-rose-700'
                        : pulseData.pulse.crowd.level === 'LOW'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {pulseData.pulse.crowd.percent}%
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-600 leading-relaxed">
                  {pulseData.pulse.crowd.advice}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Local Picks Tab */}
        {activeTab === 'LOCAL_PICKS' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200">
                    Curated Discovery Layer
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">100% Non-Commercial</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  Hidden Gems & Off-the-Beaten-Path Spots
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Curated by local Himalayan guides and verified travelers who have explored {destination.name}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {localPicks.map((pick) => (
                <div
                  key={pick.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  {pick.imageUrl && (
                    <img
                      src={pick.imageUrl}
                      alt={pick.name}
                      className="h-48 w-full object-cover"
                    />
                  )}
                  <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {pick.category}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{pick.addedBy}</span>
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-slate-900">{pick.name}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {pick.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">
                        {pick.upvotes} travelers found this spot authentic
                      </span>
                      <button
                        onClick={() => handleUpvote(pick.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors border border-amber-200"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Upvote ({pick.upvotes})</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 12-Month Climate Tab */}
        {activeTab === 'SEASONS' && (
          <div className="space-y-8">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 space-y-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  12-Month Best-Time-To-Visit Timeline
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Historical climate normals, rainfall trends, pass openings and festival windows
                </p>
              </div>

              {/* 12-Month Horizontal Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
                {(destination.seasonalInsights || []).map((m: any) => {
                  const isCurrent = m.month === (new Date().getMonth() + 1);
                  const isSelected = m.month === selectedMonth;
                  return (
                    <button
                      key={m.month}
                      onClick={() => setSelectedMonth(m.month)}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/70 shadow-sm ring-2 ring-teal-200'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {isCurrent && (
                        <span className="absolute top-2 right-2 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-slate-900 text-white">
                          Now
                        </span>
                      )}
                      <p className="text-sm font-black text-slate-900">{m.monthName}</p>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-lg font-bold text-slate-800">{m.avgTempC}°C</span>
                      </div>
                      <span
                        className={`inline-block mt-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          m.rainfallLevel === 'HIGH'
                            ? 'bg-blue-100 text-blue-700'
                            : m.rainfallLevel === 'MODERATE'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {m.rainfallLevel} Rain
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Month Detail Card */}
              {destination.seasonalInsights && (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 mt-4">
                  {(() => {
                    const sel =
                      destination.seasonalInsights.find((m: any) => m.month === selectedMonth) ||
                      destination.seasonalInsights[0];
                    if (!sel) return null;
                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-slate-900">
                            Month of {sel.monthName}: {sel.verdict}
                          </span>
                          <span className="text-xs font-bold text-teal-700 bg-teal-100 px-3 py-1 rounded-full">
                            Avg Temp: {sel.avgTempC}°C
                          </span>
                        </div>
                        {sel.notes && (
                          <p className="text-xs text-slate-600 leading-relaxed">
                            <strong>Travel Advisory:</strong> {sel.notes}
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Emergency Directory Tab */}
        {activeTab === 'EMERGENCY' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-rose-50 to-orange-50 p-6 rounded-3xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
                  <Shield className="w-4 h-4" />
                  Verified Rapid Response Network
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  In Case of Emergency — {destination.name}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Direct helpline numbers, local trauma care hospitals, tourist police & 24/7 concierge
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPhrasebookOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                  Phrasebook
                </button>
                <button
                  onClick={() => setIsSOSOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black hover:bg-rose-700 transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Trigger SOS
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(destination.emergencyDirectory || []).map((dir: any) => (
                <div
                  key={dir.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {dir.type.replace('_', ' ')}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 pt-1">{dir.name}</h4>
                    {dir.address && (
                      <p className="text-xs text-slate-500 flex items-start gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span>{dir.address}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-700">{dir.phone}</span>
                    <a
                      href={`tel:${dir.phone}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3 h-3 text-rose-400" />
                      Dial
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stays Tab */}
        {activeTab === 'STAYS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destination.hotels?.map((hotel: any) => (
              <div
                key={hotel.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm flex flex-col justify-between"
              >
                <img src={hotel.images[0]} alt={hotel.name} className="h-52 w-full object-cover" />
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-base text-slate-900">{hotel.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{hotel.description}</p>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-black text-brand-700">
                      ₹{(hotel.startingPrice || 4500).toLocaleString('en-IN')}{' '}
                      <span className="text-xs text-slate-400 font-normal">/ night</span>
                    </span>
                    <Link
                      to={`/hotels/${hotel.id}`}
                      className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-sm"
                    >
                      Book Stay
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <PhrasebookModal
        isOpen={isPhrasebookOpen}
        onClose={() => setIsPhrasebookOpen(false)}
        countryCode="IN"
      />
      <SOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />
    </div>
  );
};
