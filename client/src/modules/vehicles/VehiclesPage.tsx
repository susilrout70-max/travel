import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Car,
  Bike,
  Search,
  MapPin,
  Fuel,
  Shield,
  Clock,
  Calendar,
  Users,
  CheckCircle2,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { api } from '../../utils/api';
import { Vehicle } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import { fallbackVehicles } from '../../utils/fallbackData';

export const VehiclesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const { openVehicleCheckout } = useBookingStore();

  const [vehicles, setVehicles] = useState<Vehicle[]>(fallbackVehicles);
  const [loading, setLoading] = useState(false);

  // Filters
  const [type, setType] = useState<string>(searchParams.get('type') || 'ALL');
  const [city, setCity] = useState<string>(searchParams.get('city') || '');
  const [transmission, setTransmission] = useState<string>('ALL');
  const [fuelType, setFuelType] = useState<string>('ALL');

  // Booking Modal State
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [startTime, setStartTime] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [endTime, setEndTime] = useState(
    new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [pickupLocation, setPickupLocation] = useState('Central Transport Hub');
  const [dropLocation, setDropLocation] = useState('Central Transport Hub');
  const [withDriver, setWithDriver] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchVehicles = async () => {
    try {
      const params = new URLSearchParams();
      if (type !== 'ALL') params.append('type', type);
      if (city) params.append('city', city);
      if (transmission !== 'ALL') params.append('transmission', transmission);
      if (fuelType !== 'ALL') params.append('fuelType', fuelType);

      const res = await api.get(`/vehicles?${params.toString()}`);
      if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
        setVehicles(res.data.data);
        setLoading(false);
        return;
      }
    } catch (e) {
      // Fallback
    }

    // Local filter on fallbackVehicles
    let filtered = [...fallbackVehicles];
    if (type !== 'ALL') {
      filtered = filtered.filter((v) => v.type === type);
    }
    if (city) {
      filtered = filtered.filter((v) => v.city.toLowerCase().includes(city.toLowerCase()));
    }
    if (transmission !== 'ALL') {
      filtered = filtered.filter((v) => v.transmission === transmission);
    }
    if (fuelType !== 'ALL') {
      filtered = filtered.filter((v) => v.fuelType === fuelType);
    }
    setVehicles(filtered);
    setLoading(false);
  };

  useEffect(() => {
    fetchVehicles();
  }, [type, city, transmission, fuelType]);

  // Duration calculation
  const start = new Date(startTime);
  const end = new Date(endTime);
  const hours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)));
  const days = Math.ceil(hours / 24);

  const calculateTotal = (veh: Vehicle) => {
    const baseRental = days >= 1 ? days * veh.pricePerDay : hours * veh.pricePerHour;
    const driverCharge = withDriver ? days * 800 : 0;
    const rentalAmount = baseRental + driverCharge;
    const taxes = Math.round(rentalAmount * 0.18);
    const serviceFee = Math.round(rentalAmount * 0.02);
    const deposit = veh.securityHold;
    return {
      baseRental,
      driver: driverCharge,
      rental: rentalAmount,
      taxes,
      serviceFee,
      deposit,
      total: rentalAmount + taxes + serviceFee + deposit,
    };
  };

  const handleStartBooking = (veh: Vehicle) => {
    setSelectedVehicle(veh);
    setPickupLocation(`${veh.city} Central Hub`);
    setDropLocation(`${veh.city} Central Hub`);
  };

  const handleConfirmVehicleBooking = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (!selectedVehicle) return;

    setBookingLoading(true);
    try {
      const payload = {
        vehicleId: selectedVehicle.id,
        startTime,
        endTime,
        pickupLocation,
        dropLocation,
        withDriver,
      };

      const res = await api.post('/bookings/vehicles', payload);
      const { booking, paymentOrder } = res.data.data;
      openVehicleCheckout(selectedVehicle, booking, paymentOrder);
      setSelectedVehicle(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to initiate vehicle rental booking');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
            <Car className="w-4 h-4" />
            Verified Fleet Rentals
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Self-Drive Cars, SUVs & Motorbikes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Explore Himalayan mountain tracks, coastal Goan roads, and desert highways with 100%
            sanitized, GPS-enabled rides.
          </p>
        </div>

        {/* Type selector */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setType('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              type === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            All Rides
          </button>
          <button
            onClick={() => setType('CAR')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              type === 'CAR' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Car className="w-3.5 h-3.5" /> Cars & 4x4s
          </button>
          <button
            onClick={() => setType('BIKE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              type === 'BIKE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Bike className="w-3.5 h-3.5" /> Motorbikes & EVs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-600" />
              Filter Fleet
            </h3>

            {/* City */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Rental City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Hubs</option>
                <option value="Manali">Manali</option>
                <option value="Goa">Goa</option>
                <option value="Munnar">Munnar</option>
                <option value="Leh-Ladakh">Leh-Ladakh</option>
                <option value="Jaipur">Jaipur</option>
                <option value="Jim Corbett">Jim Corbett</option>
              </select>
            </div>

            {/* Transmission */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Transmission
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['ALL', 'Automatic', 'Manual'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTransmission(t)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-colors ${
                      transmission === t
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t === 'ALL' ? 'All' : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Fuel Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Fuel Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['ALL', 'Petrol', 'Diesel'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFuelType(f)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-colors ${
                      fuelType === f
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {f === 'ALL' ? 'All' : f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Vehicles Grid */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-72 rounded-3xl bg-slate-200 animate-pulse"></div>
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-slate-200 space-y-4">
              <Car className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No vehicles available</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try selecting a different city or clearing transmission/fuel filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vehicles.map((veh) => (
                <div
                  key={veh.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    <img
                      src={
                        Array.isArray(veh.images) && veh.images.length > 0
                          ? veh.images[0]
                          : typeof veh.images === 'string' && veh.images.startsWith('[')
                          ? JSON.parse(veh.images)[0]
                          : 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={veh.name}
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      {veh.type === 'CAR' ? <Car className="w-3.5 h-3.5" /> : <Bike className="w-3.5 h-3.5" />}
                      {veh.type}
                    </div>
                    <div className="absolute top-3 right-3 bg-white/95 text-slate-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                      {veh.city} Hub
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {veh.brand} • {veh.modelYear}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 mt-0.5">{veh.name}</h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-semibold">Fuel</span>
                          <span className="text-xs font-bold text-slate-800">{veh.fuelType}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-semibold">Gear</span>
                          <span className="text-xs font-bold text-slate-800">{veh.transmission}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-semibold">Capacity</span>
                          <span className="text-xs font-bold text-slate-800">{veh.seatingCapacity} Seater</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xl font-black text-slate-900">
                          ₹{veh.pricePerDay.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-500"> / day</span>
                        <span className="block text-[10px] text-slate-400 font-medium">
                          (₹{veh.pricePerHour}/hr • ₹{veh.securityHold} security hold)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStartBooking(veh)}
                        className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-brand-600 text-white font-bold text-xs shadow-md transition-all group-hover:scale-105"
                      >
                        Rent Vehicle
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Rental Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-6">
              <span className="text-xs uppercase font-extrabold tracking-wider text-brand-400">
                Configure Rental Booking
              </span>
              <h3 className="text-2xl font-black tracking-tight mt-1">{selectedVehicle.name}</h3>
              <p className="text-xs text-slate-400">
                {selectedVehicle.city} Hub • {selectedVehicle.fuelType} • {selectedVehicle.transmission}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pickup Date & Time</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Drop-off Date & Time</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pickup Location</label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Drop Location</label>
                <input
                  type="text"
                  value={dropLocation}
                  onChange={(e) => setDropLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200"
                />
              </div>

              {selectedVehicle.type === 'CAR' && (
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={withDriver}
                    onChange={(e) => setWithDriver(e.target.checked)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">
                      Add Dedicated Chauffeur / Driver (+₹800/day)
                    </span>
                    <span className="text-slate-500">
                      Licensed mountain & local route driver for stress-free travel
                    </span>
                  </div>
                </label>
              )}

              {/* Breakdown */}
              {(() => {
                const costs = calculateTotal(selectedVehicle);
                return (
                  <div className="bg-slate-50 p-4 rounded-2xl space-y-1.5 text-xs border border-slate-100">
                    <div className="flex items-center justify-between font-bold text-slate-700 pb-1 border-b border-slate-200">
                      <span>Transparent Itemized Breakdown</span>
                      <span className="text-[10px] text-emerald-600 font-black uppercase">Zero Hidden Fees</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>
                        Base Rental ({days} {days === 1 ? 'day' : 'days'})
                      </span>
                      <span className="font-semibold text-slate-800">
                        ₹{costs.baseRental.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {withDriver && (
                      <div className="flex justify-between text-slate-600">
                        <span>Chauffeur Service ({days} days)</span>
                        <span className="font-semibold text-slate-800">
                          ₹{costs.driver.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Commercial GST (18%)</span>
                      <span className="font-semibold text-slate-800">
                        ₹{costs.taxes.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Fleet Concierge & Insurance (2%)</span>
                      <span className="font-semibold text-slate-800">
                        ₹{costs.serviceFee.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Refundable Security Deposit (Returned upon drop)</span>
                      <span className="font-semibold text-emerald-700">
                        ₹{costs.deposit.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-slate-900">
                      <span>All-Inclusive Total (Razorpay)</span>
                      <span className="text-brand-700 text-base">₹{costs.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedVehicle(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmVehicleBooking}
                  disabled={bookingLoading}
                  className="flex-2 py-3 px-6 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  {bookingLoading ? 'Initiating...' : 'Pay with Razorpay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
