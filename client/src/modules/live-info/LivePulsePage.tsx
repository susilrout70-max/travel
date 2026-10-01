import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Activity,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  Car,
  AlertTriangle,
  Leaf,
  Camera,
  RefreshCw,
  MapPin,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../utils/api';
import { LivePulseData } from '../../types';
import { fallbackPulseData } from '../../utils/fallbackData';

export const LivePulsePage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();

  const [activeSlug, setActiveSlug] = useState<string>(slug || 'manali');
  const [pulseData, setPulseData] = useState<LivePulseData | null>(
    (slug && fallbackPulseData[slug]) || fallbackPulseData['manali']
  );
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const destinations = [
    { slug: 'manali', name: 'Manali', state: 'Himachal Pradesh' },
    { slug: 'goa', name: 'Goa', state: 'Goa' },
    { slug: 'munnar', name: 'Munnar', state: 'Kerala' },
    { slug: 'leh-ladakh', name: 'Leh-Ladakh', state: 'Ladakh' },
    { slug: 'jaipur', name: 'Jaipur', state: 'Rajasthan' },
    { slug: 'jim-corbett', name: 'Jim Corbett', state: 'Uttarakhand' },
    { slug: 'varanasi', name: 'Varanasi', state: 'Uttar Pradesh' },
    { slug: 'andaman-islands', name: 'Andaman Islands', state: 'Andaman' },
  ];

  const fetchPulse = async (targetSlug: string) => {
    try {
      const res = await api.get(`/live-info/${targetSlug}`);
      if (res.data?.data) {
        setPulseData(res.data.data);
        return;
      }
    } catch (e) {
      // Fallback
    }

    if (fallbackPulseData[targetSlug]) {
      setPulseData(fallbackPulseData[targetSlug]);
    } else {
      setPulseData(fallbackPulseData['manali']);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (slug && slug !== activeSlug) {
      setActiveSlug(slug);
    }
  }, [slug]);

  useEffect(() => {
    fetchPulse(activeSlug);
  }, [activeSlug]);

  const handleSelectDestination = (destSlug: string) => {
    setActiveSlug(destSlug);
    navigate(`/pulse/${destSlug}`);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPulse(activeSlug);
    setIsRefreshing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Real-Time Situational Radar
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Live Destination Pulse
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Aggregated weather radar, Google Maps traffic congestion index, and regional wildlife
            biodiversity data.
          </p>
        </div>

        {/* Destination Selector Pill & Refresh */}
        <div className="flex items-center gap-3">
          <select
            value={activeSlug}
            onChange={(e) => handleSelectDestination(e.target.value)}
            className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {destinations.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name} ({d.state})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
          </button>
        </div>
      </div>

      {loading || !pulseData ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-500">Querying live telemetry feeds...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main 3 Metrics: Weather, Traffic, Wildlife */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Weather Module */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-500" /> Weather Telemetry
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                    {pulseData.pulse.weather.source}
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black text-slate-900">
                      {pulseData.pulse.weather.temperature}°C
                    </span>
                    <span className="text-sm font-bold text-slate-500">
                      Feels like {pulseData.pulse.weather.feelsLike}°C
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-brand-700 mt-1">
                    {pulseData.pulse.weather.condition}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Humidity</span>
                    <span className="font-bold text-slate-800">
                      {pulseData.pulse.weather.humidity}%
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Wind</span>
                    <span className="font-bold text-slate-800">
                      {pulseData.pulse.weather.windSpeedKmH} km/h
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">UV Index</span>
                    <span className="font-bold text-slate-800">{pulseData.pulse.weather.uvIndex} / 10</span>
                  </div>
                </div>
              </div>

              {/* 3-day Forecast */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Short Forecast
                </span>
                <div className="space-y-1.5">
                  {pulseData.pulse.weather.forecast.map((fc, i) => (
                    <div key={i} className="flex justify-between text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">{fc.day}</span>
                      <span>{fc.condition}</span>
                      <span className="font-bold text-slate-900">
                        {fc.high}° / {fc.low}°
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Traffic Module */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-emerald-500" /> Traffic Congestion Index
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                    {pulseData.pulse.traffic.source}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-slate-900">
                      {pulseData.pulse.traffic.congestionLevel}
                    </span>
                    <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {pulseData.pulse.traffic.congestionIndexPercent}% Density
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Avg Arterial Speed: {pulseData.pulse.traffic.averageSpeedKmh} km/h
                  </p>
                </div>

                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex justify-between text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-semibold">Peak Rush Hours:</span>
                    <span className="font-bold">{pulseData.pulse.traffic.peakHours}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-semibold">Recommended Travel Window:</span>
                    <span className="font-bold text-emerald-700">
                      {pulseData.pulse.traffic.bestTravelWindow}
                    </span>
                  </div>
                </div>
              </div>

              {/* Alerts */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Situational Road Alerts
                </span>
                {pulseData.pulse.traffic.liveAlerts.map((alert, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-xs text-emerald-900 leading-relaxed font-medium"
                  >
                    {alert}
                  </div>
                ))}
              </div>
            </div>

            {/* Wildlife Module */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-600 flex items-center gap-1.5">
                    <Leaf className="w-4 h-4 text-teal-500" /> Regional Wildlife Sightings
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                    {pulseData.pulse.wildlife.source}
                  </span>
                </div>

                <div>
                  <span className="text-4xl font-black text-slate-900">
                    {pulseData.pulse.wildlife.speciesCount}+ Species
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    Spotting Probability: {pulseData.pulse.wildlife.spottingProbability}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  {pulseData.pulse.wildlife.featuredFauna.map((fauna, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{fauna.name}</span>
                        <span className="text-[11px] text-slate-400">
                          Best time: {fauna.bestTime} • {fauna.sightingRate}
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase bg-teal-50 text-teal-700 px-2 py-1 rounded-lg border border-teal-200">
                        {fauna.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Ecosystem: {pulseData.pulse.wildlife.regionName}</span>
              </div>
            </div>
          </div>

          {/* Curated Landscape Gallery */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-brand-600" />
                  Verified Landscape & Terrain Imagery
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Representative photographs curated by {pulseData.pulse.landscape.curatedBy}.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {pulseData.pulse.landscape.images.map((img, i) => (
                <div
                  key={i}
                  className="group relative h-64 rounded-2xl overflow-hidden shadow-sm"
                >
                  <img
                    src={img}
                    alt="Destination terrain"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 text-white text-xs font-semibold">
                    Captured on terrain expedition
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
