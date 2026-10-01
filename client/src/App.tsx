import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { RazorpayModal } from './modules/payment/RazorpayModal';

import { HomePage } from './modules/home/HomePage';
import { HotelsPage } from './modules/hotels/HotelsPage';
import { HotelDetailPage } from './modules/hotels/HotelDetailPage';
import { VehiclesPage } from './modules/vehicles/VehiclesPage';
import { DestinationsPage } from './modules/destinations/DestinationsPage';
import { DestinationDetailPage } from './modules/destinations/DestinationDetailPage';
import { LivePulsePage } from './modules/live-info/LivePulsePage';
import { LocationSharePage } from './modules/location-sharing/LocationSharePage';
import { SharedTripView } from './modules/location-sharing/SharedTripView';
import { ProfilePage } from './modules/profile/ProfilePage';
import { TripDashboardPage } from './modules/trips/TripDashboardPage';
import { AdminLayout } from './modules/admin/AdminLayout';
import { AdminLoginPage } from './modules/admin/AdminLoginPage';
import { useAuthStore } from './store/authStore';

export const App: React.FC = () => {
  const { fetchMe } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    fetchMe();
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isSharedTripView = location.pathname.startsWith('/trips/view/');
  const isAdminView = location.pathname.startsWith('/admin');
  const hidePublicChrome = isSharedTripView || isAdminView;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
      {!hidePublicChrome && <Navbar />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hotels" element={<HotelsPage />} />
          <Route path="/hotels/:id" element={<HotelDetailPage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/destinations/:slug" element={<DestinationDetailPage />} />
          <Route path="/pulse" element={<LivePulsePage />} />
          <Route path="/pulse/:slug" element={<LivePulsePage />} />
          <Route path="/trips/share" element={<LocationSharePage />} />
          <Route path="/trips/view/:token" element={<SharedTripView />} />
          <Route path="/trips/plan" element={<TripDashboardPage />} />
          <Route path="/trips/plan/:id" element={<TripDashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />} />
          <Route path="/admin/*" element={<AdminLayout />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {!hidePublicChrome && <Footer />}

      {/* Global Modals */}
      <AuthModal />
      <RazorpayModal />
    </div>
  );
};
