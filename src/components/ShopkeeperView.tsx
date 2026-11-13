'use client';

import React, { useState } from 'react';
import { 
  Order, 
  ShopSettings, 
  KhataCustomer, 
  Product, 
  OrderItem, 
  OrderStatus 
} from '@/types/kirana';
import { 
  Store, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Share2, 
  Send, 
  Plus, 
  Search, 
  AlertCircle, 
  UserPlus, 
  Settings as SettingsIcon,
  PackageCheck,
  Eye,
  Check,
  Power,
  Lock
} from 'lucide-react';

interface ShopkeeperViewProps {
  settings: ShopSettings;
  orders: Order[];
  khataCustomers: KhataCustomer[];
  products: Product[];
  onToggleShopOpen: () => void;
  onUpdateSettings: (settings: Partial<ShopSettings>) => void;
  onSetOrderDailyRates: (orderId: string, items: OrderItem[], discount?: number, pickupReadyTime?: string) => void;
  onUpdateOrderStatus: (
    orderId: string, 
    status: OrderStatus, 
    paymentMethod?: 'रोख' | 'UPI' | 'उधारी',
    isPaid?: boolean,
    pickupReadyTime?: string
  ) => void;
  onOpenKhataModal: (customer: KhataCustomer) => void;
  onAddKhataCustomer: (name: string, phone: string, initialDue: number) => void;
  onShareWhatsAppBill: (order: Order) => void;
  onSendWhatsAppKhataReminder: (customer: KhataCustomer) => void;
  onToggleProductStock: (productId: string) => void;
  onViewBill: (order: Order) => void;
}

export const ShopkeeperView: React.FC<ShopkeeperViewProps> = ({
  settings,
  orders,
  khataCustomers,
  products,
  onToggleShopOpen,
  onUpdateSettings,
  onSetOrderDailyRates,
  onUpdateOrderStatus,
  onOpenKhataModal,
  onAddKhataCustomer,
  onShareWhatsAppBill,
  onSendWhatsAppKhataReminder,
  onToggleProductStock,
  onViewBill,
}) => {
  const [activeTab, setActiveTab] = useState<'ऑर्डर्स' | 'उधारी_वही' | 'साठा_व्यवस्थापन' | 'सेटिंग्ज'>('ऑर्डर्स');
  
  // Rate entry state: map orderId -> items with editable daily rates
  const [editingRates, setEditingRates] = useState<Record<string, OrderItem[]>>({});
  const [orderReadyTimes, setOrderReadyTimes] = useState<Record<string, string>>({});
  const [selectedParchiImage, setSelectedParchiImage] = useState<string | null>(null);

  // Khata search & new customer modal
  const [khataSearch, setKhataSearch] = useState('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustDue, setNewCustDue] = useState('');

  // Settings form
  const [shopNameInput, setShopNameInput] = useState(settings.shopName);
  const [ownerNameInput, setOwnerNameInput] = useState(settings.ownerName);
  const [phoneInput, setPhoneInput] = useState(settings.phone);
  const [upiIdInput, setUpiIdInput] = useState(settings.upiId);
  const [addressInput, setAddressInput] = useState(settings.address);
  const [pinInput, setPinInput] = useState(settings.adminPin || '8605');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Counters
  const pendingRateOrders = orders.filter((o) => o.status === 'दर_निश्चिती_बाकी');
  const billedOrders = orders.filter((o) => o.status === 'बिल_तयार');
  const totalDueAmount = khataCustomers.reduce((sum, c) => sum + c.totalDue, 0);

  // Rate change handler for an order
  const handleRateChange = (orderId: string, itemIndex: number, newRate: number) => {
    const currentItems = editingRates[orderId] || orders.find(o => o.id === orderId)?.items || [];
    const updated = currentItems.map((it, idx) => {
      if (idx === itemIndex) {
        return {
          ...it,
          dailyRate: newRate,
          itemTotal: newRate * it.quantity,
        };
      }
      return it;
    });
    setEditingRates(prev => ({ ...prev, [orderId]: updated }));
  };

  // Item details change (for custom handwritten items)
  const handleItemDetailsChange = (
    orderId: string,
    itemIndex: number,
    field: 'name' | 'unit' | 'quantity',
    value: string | number
  ) => {
    const currentItems = editingRates[orderId] || orders.find(o => o.id === orderId)?.items || [];
    const updated = currentItems.map((it, idx) => {
      if (idx === itemIndex) {
        const itemObj = { ...it, [field]: value };
        if (field === 'quantity') {
          itemObj.itemTotal = (itemObj.dailyRate || 0) * (value as number);
        }
        return itemObj;
      }
      return it;
    });
    setEditingRates(prev => ({ ...prev, [orderId]: updated }));
  };

  // Submit final daily rates & generate bill
  const handleSaveRatesAndBill = (orderId: string) => {
    const items = editingRates[orderId] || orders.find(o => o.id === orderId)?.items || [];
    const readyTime = orderReadyTimes[orderId] || 'साधारण ३० मिनिटांत तयार होईल';
    onSetOrderDailyRates(orderId, items, 0, readyTime);
  };

  // Add new item into order (e.g. from parchi)
  const handleAddItemToOrder = (orderId: string) => {
    const currentItems = editingRates[orderId] || orders.find(o => o.id === orderId)?.items || [];
    const newItem: OrderItem = {
      name: 'इतर वस्तू (उदा. कापूर / अगरबत्ती)',
      unit: '१ पाकीट',
      quantity: 1,
      dailyRate: 0,
      itemTotal: 0,
    };
    setEditingRates(prev => ({ ...prev, [orderId]: [...currentItems, newItem] }));
  };

  // Add Khata customer submit
  const handleCreateKhataCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;
    onAddKhataCustomer(newCustName, newCustPhone, parseFloat(newCustDue) || 0);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustDue('');
    setShowAddCustomerModal(false);
  };

  // Save settings submit
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      shopName: shopNameInput,
      ownerName: ownerNameInput,
      phone: phoneInput,
      upiId: upiIdInput,
      address: addressInput,
      adminPin: pinInput || '8605',
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 4000);
  };

  // Filtered Khata
  const filteredKhata = khataCustomers.filter(c => 
    c.name.toLowerCase().includes(khataSearch.toLowerCase()) ||
    c.phone.includes(khataSearch)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Top Shopkeeper Header & Quick Actions */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xl shadow">
            🏪
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">
              दुकानदार नियंत्रण कक्ष (Shopkeeper Admin)
            </h2>
            <p className="text-xs text-gray-500">
              {settings.shopName} • प्रो. {settings.ownerName}
            </p>
          </div>
        </div>

        {/* Shop Open/Closed Toggle */}
        <button
          onClick={onToggleShopOpen}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-sm ${
            settings.isOpen
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-rose-600 hover:bg-rose-700 text-white'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{settings.isOpen ? 'दुकान चालू आहे (खुले)' : 'दुकान बंद आहे'}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <p className="text-xs font-bold text-amber-800">भाव ठरवायचा बाकी (Pending Rates)</p>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-amber-900">{pendingRateOrders.length} ऑर्डर्स</h3>
            <span className="text-[11px] text-amber-700 font-semibold">लगेच भाव टाका</span>
          </div>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <p className="text-xs font-bold text-emerald-800">आजच्या तयार ऑर्डर्स (Billed)</p>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-emerald-900">{billedOrders.length} ऑर्डर्स</h3>
            <span className="text-[11px] text-emerald-700 font-semibold">पॅक / डिलिव्हरी बाकी</span>
          </div>
        </div>

        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl">
          <p className="text-xs font-bold text-rose-800">बाजारातील एकूण उधारी (Khata Due)</p>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-rose-700">₹{totalDueAmount}</h3>
            <span className="text-[11px] text-rose-600 font-semibold">
              {khataCustomers.length} ग्राहक
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('ऑर्डर्स')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'ऑर्डर्स'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>ऑर्डर्स व बिलिंग ({orders.length})</span>
          {pendingRateOrders.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white text-[10px] rounded-full">
              {pendingRateOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('उधारी_वही')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'उधारी_वही'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>उधारी वही (Khata Book)</span>
        </button>

        <button
          onClick={() => setActiveTab('साठा_व्यवस्थापन')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'साठा_व्यवस्थापन'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>वस्तू व साठा (Inventory)</span>
        </button>

        <button
          onClick={() => setActiveTab('सेटिंग्ज')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'सेटिंग्ज'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>दुकान व UPI सेटिंग्ज</span>
        </button>
      </div>

      {/* 1. ORDERS TAB */}
      {activeTab === 'ऑर्डर्स' && (
        <div className="space-y-6">
          {orders.length > 0 ? (
            orders.map((ord) => {
              const items = editingRates[ord.id] || ord.items;
              const isPendingRate = ord.status === 'दर_निश्चिती_बाकी';
              const currentTotal = items.reduce((sum, it) => sum + (it.itemTotal || ((it.dailyRate || 0) * it.quantity)), 0);

              return (
                <div
                  key={ord.id}
                  className={`bg-white rounded-3xl border p-5 shadow-sm transition ${
                    isPendingRate ? 'border-amber-400 ring-2 ring-amber-100' : 'border-gray-200'
                  }`}
                >
                  {/* Order Top Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-gray-900">
                          ऑर्डर #{ord.id}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-gray-100 text-gray-800">
                          {ord.orderType === 'डिलिव्हरी' ? '🛵 घरपोच' : '🏪 दुकानातून'}
                        </span>
                        {isPendingRate && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-black bg-amber-100 text-amber-800 animate-pulse">
                            ⚠️ आजचा भाव टाकायचा बाकी
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        तारीख: {new Date(ord.createdAt).toLocaleString('mr-IN')}
                      </p>
                    </div>

                    {/* Customer info */}
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-900">{ord.customerName}</p>
                      <p className="text-xs font-mono text-emerald-700 font-bold">{ord.customerPhone}</p>
                      {ord.customerAddress && (
                        <p className="text-[11px] text-gray-500 max-w-xs truncate">
                          पत्ता: {ord.customerAddress}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* If Handwritten Parchi Photo Uploaded */}
                  {ord.parchiImage && (
                    <div className="mt-3 p-3 bg-amber-50/60 border border-amber-200 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={ord.parchiImage}
                          alt="कागदी यादी"
                          className="w-16 h-16 object-cover rounded-xl border border-amber-300 cursor-pointer shadow-xs"
                          onClick={() => setSelectedParchiImage(ord.parchiImage!)}
                        />
                        <div>
                          <p className="text-xs font-bold text-gray-900">
                            📝 ग्राहकाने कागदी यादीचा फोटो पाठवला आहे
                          </p>
                          <p className="text-[11px] text-gray-600 mt-0.5">
                            {ord.parchiNotes || 'खाली वस्तू व आजचे भाव टाका'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedParchiImage(ord.parchiImage!)}
                        className="px-3 py-1.5 bg-white border border-gray-300 text-gray-800 text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs hover:bg-gray-50"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>फोटो मोठा पहा</span>
                      </button>
                    </div>
                  )}

                  {/* Items List with Daily Rate Inputs */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        मागवलेल्या वस्तू व आजचे दर (Daily Rates)
                      </h4>
                      {isPendingRate && (
                        <button
                          onClick={() => handleAddItemToOrder(ord.id)}
                          className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> + आणखी वस्तू जोडा
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs"
                        >
                          <div className="flex-1 min-w-[140px]">
                            {isPendingRate && !item.productId ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={item.name}
                                  placeholder="वस्तूचे नाव"
                                  onChange={(e) => handleItemDetailsChange(ord.id, idx, 'name', e.target.value)}
                                  className="w-full font-bold text-gray-900 border border-gray-300 rounded px-1.5 py-0.5 text-xs"
                                />
                                <input
                                  type="text"
                                  value={item.unit}
                                  placeholder="प्रमाण (उदा. १ पाकीट)"
                                  onChange={(e) => handleItemDetailsChange(ord.id, idx, 'unit', e.target.value)}
                                  className="w-24 text-[11px] text-gray-700 border border-gray-300 rounded px-1.5 py-0.5"
                                />
                              </div>
                            ) : (
                              <>
                                <p className="font-bold text-gray-900">{item.name}</p>
                                <p className="text-[11px] text-gray-500">
                                  प्रमाण: {item.quantity} × {item.unit}
                                </p>
                              </>
                            )}
                          </div>

                          {/* Daily rate input */}
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-[11px]">आजचा दर ₹:</span>
                            {isPendingRate ? (
                              <input
                                type="number"
                                placeholder="दर"
                                value={item.dailyRate ?? ''}
                                onChange={(e) =>
                                  handleRateChange(ord.id, idx, parseFloat(e.target.value) || 0)
                                }
                                className="w-20 px-2 py-1 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            ) : (
                              <span className="font-bold text-gray-900">
                                ₹{item.dailyRate || 0}
                              </span>
                            )}
                          </div>

                          <div className="w-20 text-right">
                            <span className="text-gray-400 text-[10px] block">एकूण</span>
                            <span className="font-black text-gray-900">
                              ₹{item.itemTotal || (item.dailyRate || 0) * item.quantity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ready Time Selector */}
                  {isPendingRate && (
                    <div className="mt-3 p-3 bg-teal-50/70 border border-teal-200 rounded-2xl">
                      <label className="text-[11px] font-bold text-teal-950 block mb-1.5">
                        ⏰ सामान दुकानातून कधी घेऊन जायचे? (पिक-अप वेळ):
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {['२० मिनिटांत तयार होईल', '३० मिनिटांत तयार होईल', '४५ मिनिटांत तयार होईल', '१ तासात तयार होईल'].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setOrderReadyTimes(prev => ({ ...prev, [ord.id]: t }))}
                            className={`px-3 py-1 text-xs font-bold rounded-xl border transition ${
                              (orderReadyTimes[ord.id] || '३० मिनिटांत तयार होईल') === t
                                ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                                : 'bg-white text-teal-900 border-teal-200 hover:bg-teal-100'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Total & Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-gray-600">एकूण बिल रक्कम:</span>
                      <span className="text-xl font-black text-emerald-800">
                        ₹{ord.status === 'दर_निश्चिती_बाकी' ? currentTotal : ord.totalAmount}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {/* 1. Generate Bill Button if rate pending */}
                      {isPendingRate && (
                        <button
                          onClick={() => handleSaveRatesAndBill(ord.id)}
                          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow"
                        >
                          <Check className="w-4 h-4" />
                          <span>आजचे भाव लावून बिल बनवा</span>
                        </button>
                      )}

                      {/* 2. WhatsApp Bill Share Button */}
                      {ord.totalAmount > 0 && (
                        <button
                          onClick={() => onShareWhatsAppBill(ord)}
                          className="px-3.5 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
                          title="WhatsApp वर संपूर्ण पावती पाठवा"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>WhatsApp बिल</span>
                        </button>
                      )}

                      {/* 3. View / Print Bill */}
                      {ord.totalAmount > 0 && (
                        <button
                          onClick={() => onViewBill(ord)}
                          className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs flex items-center gap-1.5"
                        >
                          <FileText className="w-4 h-4" />
                          <span>पावती</span>
                        </button>
                      )}

                      {/* 4. Packing & Delivery Lifecycle */}
                      {ord.status === 'बिल_तयार' && (
                        <button
                          onClick={() => onUpdateOrderStatus(ord.id, 'पॅक_झाली')}
                          className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                        >
                          <span>सामान पॅक झाले 📦</span>
                        </button>
                      )}

                      {ord.status === 'पॅक_झाली' && (
                        <button
                          onClick={() => onUpdateOrderStatus(ord.id, 'डिलिव्हर_झाली')}
                          className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                        >
                          <span>डिलिव्हर झाले / दिले ✅</span>
                        </button>
                      )}

                      {/* Mark Paid button */}
                      {!ord.isPaid && ord.totalAmount > 0 && (
                        <button
                          onClick={() => onUpdateOrderStatus(ord.id, ord.status, 'UPI', true)}
                          className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-xl text-xs"
                        >
                          पेमेंट मिळाले ✅
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-200">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-600">अद्याप नवीन ऑर्डर आलेली नाही</p>
              <p className="text-xs text-gray-400 mt-1">
                ग्राहकाने ऑर्डर दिली की येथे रिअल-टाइम दिसेल
              </p>
            </div>
          )}
        </div>
      )}

      {/* 2. KHATA BOOK TAB */}
      {activeTab === 'उधारी_वही' && (
        <div className="space-y-4">
          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ग्राहक नाव किंवा मोबाईल नंबर शोधा..."
                value={khataSearch}
                onChange={(e) => setKhataSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 font-medium"
              />
            </div>

            <button
              onClick={() => setShowAddCustomerModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ नवीन उधारी ग्राहक जोडा</span>
            </button>
          </div>

          {/* Customers List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredKhata.map((customer) => (
              <div
                key={customer.id}
                className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-black text-sm text-gray-900">{customer.name}</h4>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{customer.phone}</p>
                    </div>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                      {customer.lastUpdated}
                    </span>
                  </div>

                  <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                    <p className="text-[11px] font-bold text-rose-800">बाकी उधारी (Due):</p>
                    <p className="text-2xl font-black text-rose-700 mt-0.5">₹{customer.totalDue}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => onSendWhatsAppKhataReminder(customer)}
                    className="flex-1 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs"
                    title="WhatsApp रिमाइंडर पाठवा"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp आठवण</span>
                  </button>
                  <button
                    onClick={() => onOpenKhataModal(customer)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs"
                  >
                    हिशोब
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. INVENTORY TAB */}
      {activeTab === 'साठा_व्यवस्थापन' && (
        <div className="bg-white rounded-3xl p-5 border border-gray-200 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-black text-sm text-gray-900">किराणा वस्तूंचा साठा (Stock)</h3>
              <p className="text-xs text-gray-500">
                कोणती वस्तू संपली आहे ते येथे एका क्लिकवर बंद करा
              </p>
            </div>
            <span className="text-xs text-gray-600 font-bold">एकूण वस्तू: {products.length}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="p-3 rounded-2xl border border-gray-200 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{prod.image}</span>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{prod.nameMr}</p>
                    <p className="text-[11px] text-gray-500">{prod.unit} • अंदाजे ₹{prod.approxRate}</p>
                  </div>
                </div>

                <button
                  onClick={() => onToggleProductStock(prod.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
                    prod.inStock
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                  }`}
                >
                  {prod.inStock ? 'स्टॉकमध्ये आहे 🟢' : 'संपला 🔴'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SETTINGS TAB */}
      {activeTab === 'सेटिंग्ज' && (
        <div className="max-w-2xl bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
          <h3 className="font-black text-base text-gray-900 mb-1">दुकान व पेमेंट माहिती</h3>
          <p className="text-xs text-gray-500 mb-5">
            ही माहिती तुमच्या बिलावर आणि WhatsApp वर पाठवल्या जाणाऱ्या मेसेजमध्ये वापरली जाईल
          </p>

          {settingsSaved && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>दुकान माहिती यशस्वीरीत्या सेव्ह झाली!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">दुकानाचे नाव *</label>
              <input
                type="text"
                value={shopNameInput}
                onChange={(e) => setShopNameInput(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-gray-300 rounded-xl font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">दुकानदाराचे नाव</label>
                <input
                  type="text"
                  value={ownerNameInput}
                  onChange={(e) => setOwnerNameInput(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-gray-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">मोबाईल नंबर *</label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-gray-300 rounded-xl font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1">
                Google Pay / PhonePe UPI ID (पेमेंट लिंकसाठी अतिशय महत्त्वाचे) *
              </label>
              <input
                type="text"
                placeholder="उदा. 9876543210@ybl किंवा shop@okaxis"
                value={upiIdInput}
                onChange={(e) => setUpiIdInput(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border-2 border-emerald-400 bg-emerald-50/30 rounded-xl font-mono font-bold text-gray-900"
                required
              />
              <p className="text-[11px] text-gray-500 mt-1">
                याच UPI ID वरून ग्राहकाला WhatsApp मेसेजमध्ये थेट पेमेंट लिंक जाईल.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">दुकानाचा पत्ता *</label>
              <textarea
                rows={2}
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                className="w-full text-xs px-3.5 py-2 border border-gray-300 rounded-xl font-medium"
                required
              />
            </div>

            {/* Secret PIN Field */}
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl">
              <label className="block text-xs font-black text-amber-950 mb-1 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>दुकानदार सिक्रेट पिन (Secret 4-Digit PIN) *</span>
              </label>
              <input
                type="text"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="उदा. 8605"
                className="w-full text-base tracking-widest font-mono font-black px-3.5 py-2.5 border-2 border-amber-400 bg-white rounded-xl text-amber-950"
                required
              />
              <p className="text-[11px] text-amber-900 mt-1 leading-relaxed">
                हा ४-अंकी पिन फक्त तुम्हाला माहित असेल. दुकानदार डॅशबोर्ड उघडण्यासाठी हाच पिन लागेल. तुम्हाला हवा तो पिन येथे टाकून 'माहिती सेव्ह करा' दाबा.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl text-xs shadow transition"
            >
              माहिती सेव्ह करा
            </button>
          </form>
        </div>
      )}

      {/* Parchi Image View Modal */}
      {selectedParchiImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-4 overflow-hidden relative">
            <button
              onClick={() => setSelectedParchiImage(null)}
              className="absolute top-4 right-4 bg-gray-900 text-white p-2 rounded-full shadow"
            >
              ✕
            </button>
            <h4 className="text-sm font-bold text-gray-900 mb-2">हस्तलिखित किराणा चिठ्ठी</h4>
            <div className="max-h-[80vh] overflow-auto">
              <img
                src={selectedParchiImage}
                alt="चिट्ठी"
                className="w-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Khata Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-black text-base text-gray-900 mb-3">
              + नवीन उधारी ग्राहक नोंदवा
            </h3>

            <form onSubmit={handleCreateKhataCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ग्राहकाचे नाव *</label>
                <input
                  type="text"
                  placeholder="उदा. संतोष गायकवाड"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">मोबाईल नंबर *</label>
                <input
                  type="tel"
                  placeholder="१० अंकी नंबर (WhatsApp साठी)"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">सुरुवातीची बाकी उधारी ₹</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newCustDue}
                  onChange={(e) => setNewCustDue(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl font-bold"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                >
                  ग्राहक जोडा
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
                >
                  रद्द
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
