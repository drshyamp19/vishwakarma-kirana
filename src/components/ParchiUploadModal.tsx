'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, AlertCircle } from 'lucide-react';

interface ParchiUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    customerName: string;
    customerPhone: string;
    customerAddress?: string;
    orderType: 'डिलिव्हरी' | 'दुकानातून_घेणे';
    parchiImage: string;
    parchiNotes?: string;
  }) => void;
}

export const ParchiUploadModal: React.FC<ParchiUploadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderType, setOrderType] = useState<'डिलिव्हरी' | 'दुकानातून_घेणे'>('डिलिव्हरी');
  const [parchiNotes, setParchiNotes] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('फोटोचा आकार ५ MB पेक्षा लहान असावा');
        return;
      }
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) {
      setError('कृपया कागदी यादीचा फोटो निवडा किंवा काढा');
      return;
    }
    if (!customerName.trim()) {
      setError('कृपया आपले नाव टाका');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 10) {
      setError('कृपया १० अंकी योग्य मोबाईल नंबर टाका');
      return;
    }
    if (orderType === 'डिलिव्हरी' && !customerAddress.trim()) {
      setError('होम डिलिव्हरीसाठी घराचा पत्ता आवश्यक आहे');
      return;
    }

    onSubmit({
      customerName,
      customerPhone,
      customerAddress,
      orderType,
      parchiImage: imagePreview,
      parchiNotes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📝</span>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                कागदी यादीचा फोटो पाठवा
              </h2>
              <p className="text-xs text-gray-500">
                चिट्ठीवर लिहिलेला किराणा फोटो काढून थेट दुकानात पाठवा
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Photo Upload Area */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              यादीचा फोटो (कागद / डायरी) *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-400 bg-gray-50">
                <img
                  src={imagePreview}
                  alt="यादीचा फोटो"
                  className="w-full h-48 object-contain bg-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 right-2 bg-rose-600 text-white p-1.5 rounded-full shadow"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={handleCameraCapture}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 rounded-2xl p-6 text-center cursor-pointer transition hover:bg-emerald-50"
              >
                <div className="flex justify-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center shadow">
                    <Upload className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm font-bold text-emerald-950">
                  कॅमेऱ्याने फोटो काढा किंवा गॅलरीतून निवडा
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  कागदावर लिहिलेली अक्षरे स्पष्ट दिसावीत याची काळजी घ्या
                </p>
              </div>
            )}
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                आपले पूर्ण नाव *
              </label>
              <input
                type="text"
                placeholder="उदा. राहुल पाटील"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                मोबाईल नंबर *
              </label>
              <input
                type="tel"
                placeholder="१० अंकी नंबर"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900"
              />
            </div>
          </div>

          {/* Delivery or Pickup */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              माल कसा हवा आहे?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderType('डिलिव्हरी')}
                className={`p-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  orderType === 'डिलिव्हरी'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                <span>🛵 घरपोच डिलिव्हरी</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('दुकानातून_घेणे')}
                className={`p-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  orderType === 'दुकानातून_घेणे'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                <span>🏪 दुकानात येऊन घेणे</span>
              </button>
            </div>
          </div>

          {orderType === 'डिलिव्हरी' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                घरपोच डिलिव्हरीचा पत्ता *
              </label>
              <textarea
                rows={2}
                placeholder="उदा. फ्लॅट क्र. ४०२, साई दर्शन अपार्टमेंट, भाजी मंडई जवळ..."
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              काही खास सूचना (ऐच्छिक)
            </label>
            <input
              type="text"
              placeholder="उदा. साखर बारीक हवी, तेल ५ वाजता पाठवा..."
              value={parchiNotes}
              onChange={(e) => setParchiNotes(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <Check className="w-5 h-5" />
              <span>यादी दुकानात पाठवा</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
