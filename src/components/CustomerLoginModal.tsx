'use client';

import React, { useState } from 'react';
import { Store, User, Phone, Check, AlertCircle } from 'lucide-react';

interface CustomerLoginModalProps {
  isOpen: boolean;
  onSuccess: (name: string, phone: string) => void;
  onClose?: () => void;
  initialName?: string;
  initialPhone?: string;
}

export const CustomerLoginModal: React.FC<CustomerLoginModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
  initialName = '',
  initialPhone = '',
}) => {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('कृपया आपले पूर्ण नाव टाका');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('कृपया १० अंकी योग्य मोबाईल नंबर टाका');
      return;
    }

    setError('');
    onSuccess(name.trim(), cleanPhone);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center relative">
        {/* Shop Logo & Welcome Header */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-700/20">
          <Store className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-black text-gray-900 leading-tight">
          विश्वकर्मा किराणा स्टोअर्स
        </h3>
        <p className="text-xs font-bold text-emerald-800 mt-0.5">
          शिरोली (ता. घाटंजी, जि. यवतमाळ)
        </p>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          आपले स्वागत आहे! खरेदी सुरू करण्यासाठी आपले नाव आणि मोबाईल नंबर टाका (फक्त १ वेळा).
        </p>

        {error && (
          <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5 text-left">
          <div>
            <label className="text-[11px] font-bold text-gray-700 block mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span>आपले नाव *</span>
            </label>
            <input
              type="text"
              placeholder="उदा. रमेश पाटील"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-gray-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-700 block mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>मोबाईल नंबर (१० अंकी) *</span>
            </label>
            <input
              type="tel"
              maxLength={10}
              placeholder="उदा. ९८२२०१२३४५"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-gray-300 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
              required
            />
            <p className="text-[10px] text-gray-400 mt-1">
              कोणताही पासवर्ड नको • हा नंबर तुमच्या फोनमध्ये सेव्ह राहील
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-bold rounded-xl text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-1.5 mt-2"
          >
            <Check className="w-4 h-4" />
            <span>खरेदी सुरू करा 🛍️</span>
          </button>
        </form>

        {onClose && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-gray-400 hover:text-gray-700 font-bold"
            >
              नंतर नाव टाकेन (फक्त वस्तू पाहण्यासाठी)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
