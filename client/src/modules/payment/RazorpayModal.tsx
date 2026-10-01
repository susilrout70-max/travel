import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building,
  CheckCircle2,
  Lock,
  Download,
  CalendarCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBookingStore } from '../../store/bookingStore';
import { api } from '../../utils/api';

export const RazorpayModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    isCheckoutOpen,
    checkoutType,
    selectedHotel,
    selectedRoom,
    selectedVehicle,
    checkoutBookingData,
    paymentOrder,
    closeCheckout,
  } = useBookingStore();

  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | 'NETBANKING'>('UPI');
  const [upiId, setUpiId] = useState('traveler@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('789');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedVoucher, setConfirmedVoucher] = useState<string | null>(null);

  if (!isCheckoutOpen || !checkoutBookingData || !paymentOrder) return null;

  const totalAmount = checkoutBookingData.totalPrice || paymentOrder.amount;

  const handlePayNow = async () => {
    setIsProcessing(true);

    try {
      // Simulate Razorpay payment confirmation
      const payload = {
        bookingType: checkoutType,
        bookingId: checkoutBookingData.id,
        razorpayOrderId: paymentOrder.orderId,
        razorpayPaymentId: `pay_${Math.random().toString(36).substring(2, 12)}`,
        razorpaySignature: 'mock_signature_verified_2026',
      };

      const res = await api.post('/bookings/confirm-payment', payload);
      const voucher = res.data.data.voucherToken || `TH-VCHR-${Date.now()}`;
      setConfirmedVoucher(voucher);

      // Trigger confetti celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payment simulation error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinish = () => {
    closeCheckout();
    setConfirmedVoucher(null);
    navigate('/profile');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* If Confirmed Success */}
        {confirmedVoucher ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Payment Confirmed
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-3">
                Reservation Confirmed!
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Your booking e-voucher has been generated and emailed.
              </p>
            </div>

            {/* Voucher Card */}
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-4 text-left space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-200 pb-2">
                <span>Voucher Code</span>
                <span className="font-mono font-bold text-slate-800">{confirmedVoucher}</span>
              </div>
              <div className="text-xs text-slate-700 space-y-1 pt-1">
                <p>
                  <span className="font-semibold text-slate-500">Service:</span>{' '}
                  {checkoutType === 'HOTEL'
                    ? `${selectedHotel?.name} (${selectedRoom?.roomType})`
                    : selectedVehicle?.name}
                </p>
                <p>
                  <span className="font-semibold text-slate-500">Amount Paid:</span>{' '}
                  <span className="font-bold text-slate-900">₹{totalAmount.toLocaleString('en-IN')}</span> (Razorpay)
                </p>
                <p>
                  <span className="font-semibold text-slate-500">Status:</span>{' '}
                  <span className="text-emerald-600 font-bold">Guaranteed & Confirmed</span>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <CalendarCheck className="w-4 h-4" />
                View in My Bookings
              </button>
            </div>
          </div>
        ) : (
          /* Razorpay Payment Flow */
          <div>
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-white text-sm">
                  ₹
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Razorpay Secure Checkout
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </h4>
                  <p className="text-[11px] text-slate-400">Merchant: TravelHub India Pvt Ltd</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeCheckout}
                className="text-slate-400 hover:text-white p-1 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price banner */}
            <div className="bg-brand-50/60 p-4 border-b border-brand-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-brand-800 font-semibold">Total Payable</span>
                <p className="text-2xl font-black text-brand-700">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block truncate max-w-[200px]">
                  {checkoutType === 'HOTEL' ? selectedHotel?.name : selectedVehicle?.name}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Order ID: {paymentOrder.orderId}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-brand-500 bg-brand-50/40 text-brand-700 font-bold shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-5 h-5 mx-auto mb-1 text-brand-600" />
                  <span className="text-xs block">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'CARD'
                      ? 'border-brand-500 bg-brand-50/40 text-brand-700 font-bold shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1 text-brand-600" />
                  <span className="text-xs block">Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('NETBANKING')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'NETBANKING'
                      ? 'border-brand-500 bg-brand-50/40 text-brand-700 font-bold shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-5 h-5 mx-auto mb-1 text-brand-600" />
                  <span className="text-xs block">NetBanking</span>
                </button>
              </div>

              {/* Method Forms */}
              {paymentMethod === 'UPI' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Virtual Payment Address (VPA / UPI ID)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@bank"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-700">Supported:</span> Google Pay, PhonePe, Paytm, BHIM, Cred
                  </div>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        value={cvv}
                        maxLength={4}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'NETBANKING' && (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Popular Bank
                  </label>
                  <select className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option>HDFC Bank</option>
                    <option>State Bank of India (SBI)</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              {/* Pay button */}
              <button
                type="button"
                onClick={handlePayNow}
                disabled={isProcessing}
                className="w-full mt-4 py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                {isProcessing
                  ? 'Verifying with Bank...'
                  : `Authorize Payment • ₹${totalAmount.toLocaleString('en-IN')}`}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                256-bit Bank Grade Encryption • 100% Refund Guarantee
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
