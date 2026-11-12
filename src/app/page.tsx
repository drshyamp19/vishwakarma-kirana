'use client';

import React, { useState } from 'react';
import { useKiranaStore } from '@/lib/store';
import { Role, Order, KhataCustomer } from '@/types/kirana';
import { Header } from '@/components/Header';
import { CustomerView } from '@/components/CustomerView';
import { ShopkeeperView } from '@/components/ShopkeeperView';
import { ParchiUploadModal } from '@/components/ParchiUploadModal';
import { BillModal } from '@/components/BillModal';
import { KhataReminderModal } from '@/components/KhataReminderModal';

export default function HomePage() {
  const {
    isClient,
    settings,
    products,
    orders,
    khataCustomers,
    firebaseActive,
    updateSettings,
    toggleShopOpen,
    placeOrder,
    setOrderDailyRates,
    updateOrderStatus,
    recordKhataTransaction,
    addKhataCustomer,
    toggleProductStock,
    generateWhatsAppReminderUrl,
    generateWhatsAppBillUrl,
  } = useKiranaStore();

  const [currentRole, setCurrentRole] = useState<Role>('customer');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isParchiModalOpen, setIsParchiModalOpen] = useState(false);
  const [selectedBillOrder, setSelectedBillOrder] = useState<Order | null>(null);
  const [selectedKhataCustomer, setSelectedKhataCustomer] = useState<KhataCustomer | null>(null);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <h2 className="text-lg font-black text-emerald-900">आपला किराणा सुरू होत आहे...</h2>
        </div>
      </div>
    );
  }

  // Count pending rate orders
  const pendingOrdersCount = orders.filter((o) => o.status === 'दर_निश्चिती_बाकी').length;

  // WhatsApp Handlers
  const handleShareWhatsAppBill = (order: Order) => {
    const url = generateWhatsAppBillUrl(order);
    window.open(url, '_blank');
  };

  const handleSendWhatsAppKhataReminder = (customer: KhataCustomer) => {
    const url = generateWhatsAppReminderUrl(customer);
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        settings={settings}
        cartCount={0}
        onOpenCart={() => setIsCartOpen(true)}
        firebaseActive={firebaseActive}
        pendingOrdersCount={pendingOrdersCount}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentRole === 'customer' ? (
          <CustomerView
            products={products}
            settings={settings}
            orders={orders}
            khataCustomers={khataCustomers}
            onPlaceOrder={placeOrder}
            onOpenParchiModal={() => setIsParchiModalOpen(true)}
            onViewBill={(order) => setSelectedBillOrder(order)}
            isCartOpen={isCartOpen}
            onCloseCart={() => setIsCartOpen(false)}
          />
        ) : (
          <ShopkeeperView
            settings={settings}
            orders={orders}
            khataCustomers={khataCustomers}
            products={products}
            onToggleShopOpen={toggleShopOpen}
            onUpdateSettings={updateSettings}
            onSetOrderDailyRates={setOrderDailyRates}
            onUpdateOrderStatus={updateOrderStatus}
            onOpenKhataModal={(cust) => setSelectedKhataCustomer(cust)}
            onAddKhataCustomer={addKhataCustomer}
            onShareWhatsAppBill={handleShareWhatsAppBill}
            onSendWhatsAppKhataReminder={handleSendWhatsAppKhataReminder}
            onToggleProductStock={toggleProductStock}
            onViewBill={(order) => setSelectedBillOrder(order)}
          />
        )}
      </main>

      {/* Modals */}
      <ParchiUploadModal
        isOpen={isParchiModalOpen}
        onClose={() => setIsParchiModalOpen(false)}
        onSubmit={async (data) => {
          await placeOrder({
            ...data,
            items: [],
          });
          alert('आपली कागदी यादी दुकानात पोहोचली आहे! दुकानदार आजचे भाव लावून बिल तयार करेल.');
        }}
      />

      <BillModal
        order={selectedBillOrder}
        settings={settings}
        onClose={() => setSelectedBillOrder(null)}
        onShareWhatsApp={handleShareWhatsAppBill}
      />

      <KhataReminderModal
        customer={selectedKhataCustomer}
        settings={settings}
        onClose={() => setSelectedKhataCustomer(null)}
        onSendWhatsApp={handleSendWhatsAppKhataReminder}
        onRecordTransaction={recordKhataTransaction}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 px-4 text-center text-xs text-gray-500 mt-12 print:hidden">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800">{settings.shopName}</span>
            <span>•</span>
            <span>स्थानिक किराणा डिजिटल ॲप 🛒</span>
          </div>

          <div className="flex items-center gap-3 text-gray-400">
            <span>मराठी भाषा</span>
            <span>•</span>
            <span>WhatsApp बिलिंग व उधारी वही</span>
            <span>•</span>
            <span>GitHub & Vercel Ready ⚡</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
