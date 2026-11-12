'use client';

import React, { useState, useEffect } from 'react';
import { Product, OrderItem, Order, ShopSettings, KhataCustomer } from '@/types/kirana';
import { 
  Search, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Camera, 
  Clock, 
  CheckCircle2, 
  Truck, 
  FileText, 
  AlertCircle, 
  Sparkles,
  Phone,
  MapPin,
  X
} from 'lucide-react';

interface CustomerViewProps {
  products: Product[];
  settings: ShopSettings;
  orders: Order[];
  khataCustomers: KhataCustomer[];
  onPlaceOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    customerAddress?: string;
    orderType: 'डिलिव्हरी' | 'दुकानातून_घेणे';
    items: OrderItem[];
    parchiImage?: string;
    parchiNotes?: string;
  }) => Promise<Order>;
  onOpenParchiModal: () => void;
  onViewBill: (order: Order) => void;
  isCartOpen: boolean;
  onCloseCart: () => void;
}

const CATEGORIES = [
  'सर्व',
  'धान्य व डाळी',
  'तेल व तूप',
  'दैनंदिन किराणा',
  'मसाले व पॅकेट',
  'स्वच्छता व साबण',
] as const;

export const CustomerView: React.FC<CustomerViewProps> = ({
  products,
  settings,
  orders,
  khataCustomers,
  onPlaceOrder,
  onOpenParchiModal,
  onViewBill,
  isCartOpen,
  onCloseCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('सर्व');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderType, setOrderType] = useState<'डिलिव्हरी' | 'दुकानातून_घेणे'>('डिलिव्हरी');
  const [activeTab, setActiveTab] = useState<'वस्तू_कॅटलॉग' | 'माझ्या_ऑर्डर्स' | 'माझे_खाते'>('वस्तू_कॅटलॉग');
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [cartError, setCartError] = useState('');

  // Load saved customer info
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('aapla_kirana_c_name');
      const savedPhone = localStorage.getItem('aapla_kirana_c_phone');
      const savedAddress = localStorage.getItem('aapla_kirana_c_addr');
      if (savedName) setCustomerName(savedName);
      if (savedPhone) setCustomerPhone(savedPhone);
      if (savedAddress) setCustomerAddress(savedAddress);
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'सर्व' || p.category === selectedCategory;
    const matchesSearch = 
      p.nameMr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.nameMr,
          unit: product.unit,
          quantity: 1,
          dailyRate: product.approxRate,
          itemTotal: (product.approxRate || 0) * 1,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + change;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const getProductQuantityInCart = (productId: string) => {
    const found = cart.find((it) => it.productId === productId);
    return found ? found.quantity : 0;
  };

  // Submit cart order
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setCartError('पिशवी रिकामी आहे, कृपया वस्तू निवडा');
      return;
    }
    if (!customerName.trim()) {
      setCartError('कृपया आपले नाव टाका');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 10) {
      setCartError('कृपया १० अंकी योग्य मोबाईल नंबर टाका');
      return;
    }
    if (orderType === 'डिलिव्हरी' && !customerAddress.trim()) {
      setCartError('डिलिव्हरीसाठी घराचा पत्ता आवश्यक आहे');
      return;
    }

    setCartError('');
    try {
      localStorage.setItem('aapla_kirana_c_name', customerName);
      localStorage.setItem('aapla_kirana_c_phone', customerPhone);
      localStorage.setItem('aapla_kirana_c_addr', customerAddress);
    } catch (e) {
      console.warn(e);
    }

    const created = await onPlaceOrder({
      customerName,
      customerPhone,
      customerAddress,
      orderType,
      items: cart,
    });

    setCart([]);
    onCloseCart();
    setOrderSuccess(`ऑर्डर यशस्वीरीत्या नोंदवली! ऑर्डर क्र. #${created.id}. दुकानदार आता आजचे भाव लावून बिल तयार करेल.`);
    setActiveTab('माझ्या_ऑर्डर्स');
    setTimeout(() => setOrderSuccess(null), 8000);
  };

  // Customer's filtered orders based on phone number
  const myOrders = customerPhone 
    ? orders.filter(o => o.customerPhone.includes(customerPhone.slice(-10)))
    : orders.slice(0, 5);

  // Customer's Khata details if phone matches
  const myKhata = customerPhone
    ? khataCustomers.find(k => k.phone.includes(customerPhone.slice(-10)))
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Navigation Tabs for Customer */}
      <div className="flex border-b border-gray-200 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('वस्तू_कॅटलॉग')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'वस्तू_कॅटलॉग'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>किराणा वस्तू निवडा</span>
        </button>
        <button
          onClick={() => setActiveTab('माझ्या_ऑर्डर्स')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'माझ्या_ऑर्डर्स'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>माझ्या ऑर्डर्स ({myOrders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('माझे_खाते')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'माझे_खाते'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>माझे खाते (उधारी वही)</span>
        </button>
      </div>

      {orderSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-emerald-950">{orderSuccess}</p>
            <p className="text-xs text-emerald-700 mt-1">
              दुकानदाराने आजचा दर लावला की खाली 'माझ्या ऑर्डर्स' मध्ये तुम्हाला बिल दिसेल.
            </p>
          </div>
        </div>
      )}

      {/* 1. CATALOG TAB */}
      {activeTab === 'वस्तू_कॅटलॉग' && (
        <>
          {/* Hero Banner: Chitthi Upload Callout */}
          <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
            <div className="max-w-xl relative z-10">
              <div className="inline-flex items-center gap-2 bg-emerald-600/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-100 mb-3 border border-emerald-400/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>सोपा व जलद मार्ग</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
                किराणा यादी कागदावर लिहिली आहे का?
              </h2>
              <p className="text-emerald-100 text-xs sm:text-sm mt-2 leading-relaxed">
                टाईप करण्याचा त्रास नको! फक्त तुमच्या कागदी चिठ्ठीचा फोटो काढून पाठवा. दुकानदार आजच्या भावानुसार सामान पॅक करून बिल पाठवेल.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={onOpenParchiModal}
                  className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-gray-950 font-black rounded-2xl shadow-lg shadow-amber-400/30 flex items-center gap-2 transition active:scale-95 text-sm"
                >
                  <Camera className="w-5 h-5" />
                  <span>यादीचा फोटो पाठवा 📸</span>
                </button>
              </div>
            </div>

            {/* Decorative background art */}
            <div className="absolute right-4 bottom-2 text-8xl opacity-15 select-none pointer-events-none hidden sm:block">
              🛍️ 🌾 🍯
            </div>
          </div>

          {/* Rate Notice Banner */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">दर (Rate) बाबत महत्त्वाची नोंद: </span>
              किराणा सामानाचे भाव रोज बदलतात. खाली दाखवलेले दर फक्त संदर्भासाठी आहेत. 
              <strong> अंतिम बिल दुकानदार आजच्या अधिकृत बाजारभावानुसार लावेल.</strong>
            </div>
          </div>

          {/* Search Bar & Categories */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="वस्तू शोधा... (उदा. साखर, तेल, तूर डाळ, पोहे)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-gray-900"
              />
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => {
              const qtyInCart = getProductQuantityInCart(product.id);
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="h-20 bg-gray-50 rounded-xl flex items-center justify-center text-4xl mb-2.5">
                      {product.image}
                    </div>
                    <div className="text-[10px] text-gray-400 font-semibold uppercase">
                      {product.category}
                    </div>
                    <h3 className="text-xs sm:text-sm font-black text-gray-900 line-clamp-1 mt-0.5">
                      {product.nameMr}
                    </h3>
                    <p className="text-[11px] text-gray-500 font-medium">
                      प्रमाण: {product.unit}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-bold mt-1">
                      अंदाजे दर: ₹{product.approxRate}
                      <span className="text-[9px] text-gray-400 font-normal ml-1">
                        (आजचा भाव बिलात लागेल)
                      </span>
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-100">
                    {qtyInCart > 0 ? (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="w-7 h-7 bg-white text-emerald-800 rounded-lg flex items-center justify-center font-bold shadow-xs hover:bg-emerald-100"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-black text-emerald-900">
                          {qtyInCart}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          className="w-7 h-7 bg-emerald-700 text-white rounded-lg flex items-center justify-center font-bold shadow-xs hover:bg-emerald-800"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>पिशवीत टाका</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 2. MY ORDERS TAB */}
      {activeTab === 'माझ्या_ऑर्डर्स' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-black text-gray-900">आपल्या ऑर्डर्सची सद्यस्थिती</h3>
            <span className="text-xs text-gray-500">एकूण ऑर्डर्स: {myOrders.length}</span>
          </div>

          {myOrders.length > 0 ? (
            myOrders.map((ord) => {
              const isBilled = ord.status === 'बिल_तयार';
              const isPending = ord.status === 'दर_निश्चिती_बाकी';

              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">ऑर्डर #{ord.id}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-gray-100 text-gray-700">
                          {ord.orderType}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        तारीख: {new Date(ord.createdAt).toLocaleString('mr-IN')}
                      </p>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {isPending && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full animate-pulse">
                          <Clock className="w-3.5 h-3.5" /> आजचा दर लावला जात आहे...
                        </span>
                      )}
                      {isBilled && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> बिल तयार झाले (₹{ord.totalAmount})
                        </span>
                      )}
                      {ord.status === 'पॅक_झाली' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
                          <ShoppingBag className="w-3.5 h-3.5" /> सामान पॅक झाले
                        </span>
                      )}
                      {ord.status === 'डिलिव्हर_झाली' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-900 bg-emerald-200 px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> पूर्ण झाले
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Order Items or Parchi Photo */}
                  <div className="py-3 text-xs">
                    {ord.parchiImage ? (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                        <img
                          src={ord.parchiImage}
                          alt="कागदी यादी"
                          className="w-14 h-14 object-cover rounded-lg border border-gray-300"
                        />
                        <div>
                          <p className="font-bold text-gray-800">हस्तलिखित यादीचा फोटो</p>
                          <p className="text-gray-500 text-[11px]">{ord.parchiNotes || 'कोणतीही अतिरिक्त नोंद नाही'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-gray-700">
                            <span>
                              {it.name} ({it.quantity} {it.unit})
                            </span>
                            <span className="font-semibold">
                              {it.itemTotal ? `₹${it.itemTotal}` : 'दर बाकी'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Action */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500">एकूण रक्कम: </span>
                      <span className="text-base font-black text-emerald-800">
                        {ord.totalAmount > 0 ? `₹${ord.totalAmount}` : 'दुकानदार ठरवेल'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {ord.totalAmount > 0 && (
                        <button
                          onClick={() => onViewBill(ord)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition"
                        >
                          <FileText className="w-4 h-4" />
                          <span>पावती (Bill) पहा</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-600">अद्याप कोणतीही ऑर्डर केलेली नाही</p>
              <button
                onClick={() => setActiveTab('वस्तू_कॅटलॉग')}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
              >
                आताच किराणा निवडा
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. MY KHATA TAB */}
      {activeTab === 'माझे_खाते' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-gray-200">
            <h3 className="text-base font-black text-gray-900 mb-1">आपले उधारी खाते (Khata)</h3>
            <p className="text-xs text-gray-500 mb-4">
              तुमच्या मोबाईल नंबरनुसार दुकानातील उधारी व जमा रकमेचा हिशोब
            </p>

            <div className="flex gap-2 max-w-sm mb-4">
              <input
                type="tel"
                placeholder="आपला १० अंकी नंबर टाका..."
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl font-bold"
              />
            </div>

            {myKhata ? (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-base text-gray-900">{myKhata.name}</h4>
                    <p className="text-xs text-gray-500">मोबाईल: {myKhata.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">बाकी उधारी:</p>
                    <p className="text-2xl font-black text-rose-600">₹{myKhata.totalDue}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-200 text-xs">
                  <p className="font-bold text-gray-700 mb-2">व्यवहार तपशील:</p>
                  <div className="space-y-1.5">
                    {myKhata.transactions.map((tx) => (
                      <div key={tx.id} className="flex justify-between bg-white/70 p-2 rounded-lg">
                        <span>{tx.notes} ({tx.date})</span>
                        <span className={`font-bold ${tx.type === 'पैसे_जमा_केले' ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {tx.type === 'पैसे_जमा_केले' ? '-' : '+'}₹{tx.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-gray-500">
                {customerPhone 
                  ? 'या मोबाईल नंबरवर कोणतेही उधारी खाते आढळले नाही किंवा पूर्ण हिशोब पूर्ण आहे.' 
                  : 'हिशोब पाहण्यासाठी वर मोबाईल नंबर टाका.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cart Drawer / Slideover */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-700" />
                <h3 className="font-black text-base text-gray-900">माझी पिशवी (Cart)</h3>
              </div>
              <button
                onClick={onCloseCart}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cartError && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                {cartError}
              </div>
            )}

            {/* Daily rate reminder in cart */}
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-tight">
              ⚠️ <strong>दर बाबत सूचना:</strong> दैनंदिन बाजारभावातील बदलांमुळे, दुकानदार आजच्या भावानुसार अंतिम बिल तयार करेल.
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 divide-y divide-gray-100">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div key={item.productId} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-gray-900">{item.name}</p>
                      <p className="text-[11px] text-gray-500">प्रमाण: {item.unit}</p>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(item.productId!, -1)}
                        className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-xs font-bold text-gray-700 hover:bg-gray-200"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black px-1">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId!, 1)}
                        className="w-6 h-6 bg-emerald-600 text-white rounded-lg flex items-center justify-center text-xs font-bold hover:bg-emerald-700"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-bold">पिशवी रिकामी आहे</p>
                </div>
              )}
            </div>

            {/* Checkout Form */}
            {cart.length > 0 && (
              <form onSubmit={handleCheckout} className="pt-4 border-t border-gray-100 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="आपले नाव *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl font-medium"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="१० अंकी मोबाईल *"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType('डिलिव्हरी')}
                    className={`py-2 text-xs font-bold rounded-xl border ${
                      orderType === 'डिलिव्हरी'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    🛵 घरपोच डिलिव्हरी
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('दुकानातून_घेणे')}
                    className={`py-2 text-xs font-bold rounded-xl border ${
                      orderType === 'दुकानातून_घेणे'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    🏪 दुकानातून घेणे
                  </button>
                </div>

                {orderType === 'डिलिव्हरी' && (
                  <textarea
                    rows={2}
                    placeholder="घरपोच डिलिव्हरी पत्ता *"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl font-medium"
                    required
                  />
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md transition active:scale-98"
                >
                  ऑर्डर पाठवा (दुकानदाराकडे) 🚀
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
