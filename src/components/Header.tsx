'use client';

import React from 'react';
import { Role, ShopSettings } from '@/types/kirana';
import { ShoppingBag, Store, User, Sparkles, Lock, LogOut } from 'lucide-react';

interface HeaderProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  settings: ShopSettings;
  cartCount: number;
  onOpenCart: () => void;
  firebaseActive: boolean;
  onOpenOrders?: () => void;
  pendingOrdersCount?: number;
  isShopkeeperUnlocked?: boolean;
  onLockShopkeeper?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  settings,
  cartCount,
  onOpenCart,
  firebaseActive,
  pendingOrdersCount = 0,
  isShopkeeperUnlocked = false,
  onLockShopkeeper,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        <span>
          {settings.isOpen ? (
            <span className="font-medium">
              🟢 दुकान चालू आहे | ऑर्डर स्वीकारल्या जात आहेत
            </span>
          ) : (
            <span className="font-medium text-amber-200">
              🔴 दुकान सध्या बंद आहे | पुढील वेळेत ऑर्डर पूर्ण केली जाईल
            </span>
          )}
        </span>
        <span className="text-emerald-200 text-[11px] hidden sm:inline">
          • {settings.address}
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo and Shop Name */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              {settings.shopName}
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                मराठी
              </span>
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              किराणा यादी पाठवा • आजच्या भावाने ताजे सामान मिळवा
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Firebase live badge */}
          <div 
            title={firebaseActive ? "Firebase Live Database कनेक्ट आहे" : "लोकल मोड (Firebase जोडून मल्टि-युझर लाईव्ह करू शकता)"}
            className={`hidden md:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
              firebaseActive 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${firebaseActive ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
            <span>{firebaseActive ? 'Firebase Live' : 'स्थानिक मोड'}</span>
          </div>

          {/* Role Switcher Pill */}
          <div className="bg-gray-100 p-1 rounded-xl flex items-center border border-gray-200">
            <button
              onClick={() => onRoleChange('customer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                currentRole === 'customer'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>ग्राहक</span>
            </button>
            <button
              onClick={() => onRoleChange('shopkeeper')}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                currentRole === 'shopkeeper'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>दुकानदार</span>
              {!isShopkeeperUnlocked && (
                <Lock className="w-3 h-3 text-amber-300" />
              )}
              {pendingOrdersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
          </div>

          {/* Shopkeeper Logout/Lock button */}
          {currentRole === 'shopkeeper' && onLockShopkeeper && (
            <button
              onClick={onLockShopkeeper}
              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition text-xs font-bold flex items-center gap-1"
              title="डॅशबोर्ड लॉक करा (Logout)"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">लॉक</span>
            </button>
          )}

          {/* Cart / My Orders Button (Only for Customer) */}
          {currentRole === 'customer' && (
            <button
              onClick={onOpenCart}
              className="relative bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-sm transition active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">माझी यादी</span>
              {cartCount > 0 && (
                <span className="bg-amber-400 text-gray-900 text-xs font-black px-1.5 py-0.5 rounded-full min-w-5 text-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
