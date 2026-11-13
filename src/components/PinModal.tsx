'use client';

import React, { useState } from 'react';
import { Lock, X, Delete, Check, AlertCircle } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  correctPin: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  correctPin,
  onSuccess,
  onClose,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDigitClick = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError('');

      if (nextPin.length === 4) {
        if (nextPin === (correctPin || '8605')) {
          setTimeout(() => {
            setPin('');
            setError('');
            onSuccess();
          }, 150);
        } else {
          setTimeout(() => {
            setError('चुकीचा पिन! कृपया योग्य ४-अंकी पिन टाका.');
            setPin('');
          }, 200);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon & Title */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-700/20">
          <Lock className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-black text-gray-900">
          दुकानदार प्रवेश (Admin Lock)
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          फक्त दुकानाच्या मालकासाठी • कृपया आपला ४-अंकी पिन टाका
        </p>

        {/* PIN Dots Display */}
        <div className="flex justify-center gap-4 my-6">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  isFilled
                    ? 'bg-emerald-600 border-emerald-600 scale-125'
                    : 'bg-gray-100 border-gray-300'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 animate-bounce">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Number Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitClick(digit)}
              className="h-13 bg-gray-50 hover:bg-emerald-50 active:bg-emerald-100 text-gray-900 text-xl font-black rounded-2xl border border-gray-200 transition flex items-center justify-center shadow-xs active:scale-95"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-13 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-2xl transition flex items-center justify-center"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigitClick('0')}
            className="h-13 bg-gray-50 hover:bg-emerald-50 active:bg-emerald-100 text-gray-900 text-xl font-black rounded-2xl border border-gray-200 transition flex items-center justify-center shadow-xs active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-13 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition flex items-center justify-center"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-800 font-bold"
          >
            रद्द करा (ग्राहक म्हणून रहा)
          </button>
        </div>
      </div>
    </div>
  );
};
