import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Zap, Heart, MapPin, Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white">
                <Compass className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Travel<span className="text-brand-400">Hub</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              India’s next-generation travel platform uniting verified hotel bookings, self-drive
              cars & bike rentals, curated guides, and real-time destination pulse info.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-400" />
                <span>PCI-DSS Razorpay</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Instant Confirmation</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Explore Stays
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/hotels?destinationSlug=manali" className="hover:text-brand-400 transition-colors">
                  Manali Mountain Chalets
                </Link>
              </li>
              <li>
                <Link to="/hotels?destinationSlug=goa" className="hover:text-brand-400 transition-colors">
                  Goa Luxury Villas
                </Link>
              </li>
              <li>
                <Link to="/hotels?destinationSlug=munnar" className="hover:text-brand-400 transition-colors">
                  Munnar Tea Plantations
                </Link>
              </li>
              <li>
                <Link to="/hotels?destinationSlug=leh-ladakh" className="hover:text-brand-400 transition-colors">
                  Ladakh Heritage Suites
                </Link>
              </li>
              <li>
                <Link to="/hotels?destinationSlug=jaipur" className="hover:text-brand-400 transition-colors">
                  Jaipur Palace Stays
                </Link>
              </li>
            </ul>
          </div>

          {/* Rentals & Guides */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Rides & Guides
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/vehicles?type=CAR" className="hover:text-brand-400 transition-colors">
                  Self-Drive SUVs & Sedans
                </Link>
              </li>
              <li>
                <Link to="/vehicles?type=BIKE" className="hover:text-brand-400 transition-colors">
                  Royal Enfield Expeditions
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="hover:text-brand-400 transition-colors">
                  Curated Travel Guides
                </Link>
              </li>
              <li>
                <Link to="/pulse" className="hover:text-brand-400 transition-colors">
                  Live Destination Pulse
                </Link>
              </li>
              <li>
                <Link to="/trips/share" className="hover:text-brand-400 transition-colors">
                  Share My Trip Map
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Travel Concierge
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>Indiranagar, Bangalore, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>+91 (800) 425-TRIP</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>support@travelhub.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TravelHub Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Cancellation Policy</span>
            <span className="flex items-center gap-1 text-slate-400">
              Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for travelers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
