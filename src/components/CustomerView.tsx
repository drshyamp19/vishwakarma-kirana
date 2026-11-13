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
  FileText, 
  AlertCircle, 
  Sparkles,
  Phone,
  User,
  X,
  RotateCcw,
  Trash2,
  Store,
  Edit2
} from 'lucide-react';
import { CustomerLoginModal } from './CustomerLoginModal';

interface CustomerViewProps {
  products: Product[];
  settings: ShopSettings;
  orders: Order[];
  khataCustomers: KhataCustomer[];
  onPlaceOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    customerAddress?: string;
    orderType: 'दुकानातून_घेणे';
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
  const [activeTab, setActiveTab] = useState<'वस्तू_कॅटलॉग' | 'माझ्या_ऑर्डर्स' | 'माझे_खाते'>('वस्तू_कॅटलॉग');
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [cartError, setCartError] = useState('');
  const [deliveryAlert, setDeliveryAlert] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Selected unit for each product card
  const [selectedProductUnits, setSelectedProductUnits] = useState<Record<string, string>>({});

  // Load saved customer info permanently
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('vishwakarma_c_name') || localStorage.getItem('aapla_kirana_c_name');
      const savedPhone = localStorage.getItem('vishwakarma_c_phone') || localStorage.getItem('aapla_kirana_c_phone');
      if (savedName) setCustomerName(savedName);
      if (savedPhone) setCustomerPhone(savedPhone);
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // Save customer login permanently
  const handleCustomerLoginSuccess = (name: string, phone: string) => {
    setCustomerName(name);
    setCustomerPhone(phone);
    setIsLoginModalOpen(false);
    try {
      localStorage.setItem('vishwakarma_c_name', name);
      localStorage.setItem('vishwakarma_c_phone', phone);
    } catch (e) {
      console.warn(e);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'सर्व' || p.category === selectedCategory;
    const matchesSearch = 
      p.nameMr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle unit selection change
  const handleUnitSelect = (productId: string, unit: string) => {
    setSelectedProductUnits((prev) => ({ ...prev, [productId]: unit }));
  };

  // Get active unit for product
  const getActiveUnit = (product: Product): string => {
    return selectedProductUnits[product.id] || product.unit;
  };

  // Cart operations (Fix: Exactly 1 line item per product, no duplicates)
  const addToCart = (product: Product) => {
    // If user hasn't registered name & phone yet, prompt modal gently
    if (!customerPhone) {
      setIsLoginModalOpen(true);
    }

    const chosenUnit = getActiveUnit(product);

    setCart((prev) => {
      // Look for the product in the cart (regardless of previous unit)
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        // If already in cart, update its unit to chosen unit and keep or increment quantity
        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                unit: chosenUnit,
                quantity: item.unit === chosenUnit ? item.quantity + 1 : item.quantity,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.nameMr,
          unit: chosenUnit,
          quantity: 1,
          dailyRate: product.approxRate,
          itemTotal: (product.approxRate || 0) * 1,
        },
      ];
    });
  };

  // Allow switching unit right inside the cart drawer
  const changeCartItemUnit = (itemIndex: number, newUnit: string) => {
    setCart((prev) =>
      prev.map((item, idx) => (idx === itemIndex ? { ...item, unit: newUnit } : item))
    );
  };

  const updateQuantity = (itemIndex: number, change: number) => {
    setCart((prev) =>
      prev
        .map((item, idx) => {
          if (idx === itemIndex) {
            const newQty = item.quantity + change;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const removeFromCart = (itemIndex: number) => {
    setCart((prev) => prev.filter((_, idx) => idx !== itemIndex));
  };

  const getProductQuantityInCart = (productId: string) => {
    return cart
      .filter((it) => it.productId === productId)
      .reduce((sum, it) => sum + it.quantity, 0);
  };

  // 4. Repeat previous order with editing
  const handleReorderPastItems = (pastOrder: Order) => {
    if (!pastOrder.items || pastOrder.items.length === 0) {
      alert('या ऑर्डरमध्ये थेट यादी नाही (कागदी चिठ्ठीचा फोटो होता). कृपया नवीन फोटो पाठवा किंवा खाली वस्तू निवडा.');
      return;
    }

    setCart(pastOrder.items.map((it) => ({ ...it })));
    setOrderSuccess('मागच्या ऑर्डरमधील वस्तू तुमच्या यादीत भरल्या आहेत! हवे ते बदल (प्रमाण किंवा नवीन वस्तू) करून ऑर्डर पाठवा.');
    setTimeout(() => setOrderSuccess(null), 8000);
  };

  // Submit cart order
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setCartError('यादी रिकामी आहे, कृपया वस्तू जोडा');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      setIsLoginModalOpen(true);
      return;
    }

    setCartError('');
    try {
      localStorage.setItem('vishwakarma_c_name', customerName);
      localStorage.setItem('vishwakarma_c_phone', customerPhone);
    } catch (e) {
      console.warn(e);
    }

    const created = await onPlaceOrder({
      customerName,
      customerPhone,
      orderType: 'दुकानातून_घेणे',
      items: cart,
    });

    setCart([]);
    onCloseCart();
    setOrderSuccess(`ऑर्डर यशस्वीरीत्या नोंदवली! ऑर्डर क्र. #${created.id}. दुकानदार आता आजचे भाव लावून बिल तयार करेल.`);
    setActiveTab('माझ्या_ऑर्डर्स');
    setTimeout(() => setOrderSuccess(null), 8000);
  };

  // Filter orders by customer phone automatically
  const myOrders = customerPhone 
    ? orders.filter(o => o.customerPhone.includes(customerPhone.slice(-10)))
    : orders.slice(0, 5);

  // Customer Khata automatically
  const myKhata = customerPhone
    ? khataCustomers.find(k => k.phone.includes(customerPhone.slice(-10)))
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Customer Permanent Login Status Bar */}
      <div className="bg-white rounded-2xl p-3 border border-emerald-200 shadow-xs mb-5 flex flex-wrap items-center justify-between gap-2">
        {customerName && customerPhone ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black text-gray-900">
                नमस्कार, {customerName} जी! 👋
              </p>
              <p className="text-[11px] font-mono text-gray-500 font-bold">
                मोबाईल: {customerPhone}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-gray-700">
            <User className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold">
              विश्वकर्मा किराणामध्ये स्वागत आहे! एकदा आपले नाव व मोबाईल टाका.
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsLoginModalOpen(true)}
          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs"
        >
          {customerName ? (
            <>
              <Edit2 className="w-3 h-3" />
              <span>नाव / नंबर बदला</span>
            </>
          ) : (
            <span>नाव व मोबाईल टाका ➔</span>
          )}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('वस्तू_कॅटलॉग')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'वस्तू_कॅटलॉग'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>किराणा यादी बनवा</span>
        </button>
        <button
          onClick={() => setActiveTab('माझ्या_ऑर्डर्स')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
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
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
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
              दुकानदार आजचे भाव लावून बिल तयार करेल, त्यानंतर तुम्ही पावती पाहू शकाल.
            </p>
          </div>
        </div>
      )}

      {/* 1. CATALOG TAB */}
      {activeTab === 'वस्तू_कॅटलॉग' && (
        <>
          {/* Hero Banner: Chitthi Upload Callout */}
          <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-6 relative overflow-hidden">
            <div className="max-w-xl relative z-10">
              <div className="inline-flex items-center gap-2 bg-emerald-600/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-100 mb-3 border border-emerald-400/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>सोपा व जलद मार्ग</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
                किराणा यादी कागदावर लिहिली आहे का?
              </h2>
              <p className="text-emerald-100 text-xs sm:text-sm mt-2 leading-relaxed">
                टाईप करण्याचा त्रास नको! कागदी चिठ्ठीचा फोटो काढून पाठवा किंवा खालील वस्तूंमधून निवडून यादी बनवा.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={onOpenParchiModal}
                  className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-gray-950 font-black rounded-2xl shadow-lg shadow-amber-400/30 flex items-center gap-2 transition active:scale-95 text-xs sm:text-sm"
                >
                  <Camera className="w-5 h-5" />
                  <span>यादीचा फोटो पाठवा 📸</span>
                </button>
              </div>
            </div>

            <div className="absolute right-4 bottom-2 text-8xl opacity-15 select-none pointer-events-none hidden sm:block">
              🛍️ 🌾 🍯
            </div>
          </div>

          {/* Delivery & Rate Information Notice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-950">
              <Store className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>
                <strong>🏪 दुकानातून येऊन घेणे (पिक-अप):</strong> ऑर्डर दिल्यानंतर दुकानदार सामान पॅक करेल, दुकानात येऊन घेऊन जावे. (घरपोच सेवा सध्या बंद आहे).
              </span>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-950">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
              <span>
                <strong>⚖️ आजचे भाव:</strong> रोजच्या बाजारभावानुसार दुकानदार माल भरताना आजचा दर लावून अंतिम बिल बनवेल.
              </span>
            </div>
          </div>

          {/* Search Bar & Categories */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="वस्तू शोधा... (उदा. साखर, तेल, तूर डाळ, पोहे, गूळ)"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const activeUnit = getActiveUnit(product);
              const qtyInCart = getProductQuantityInCart(product.id);
              const unitOptions = product.availableUnits || [product.unit];

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="h-20 bg-gray-50 rounded-xl flex items-center justify-center text-4xl mb-2.5">
                      {product.image}
                    </div>
                    <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                      {product.category}
                    </div>
                    <h3 className="text-sm font-black text-gray-900 line-clamp-1 mt-0.5">
                      {product.nameMr}
                    </h3>
                    <p className="text-[11px] text-emerald-800 font-bold mt-0.5">
                      अंदाजे दर: ₹{product.approxRate}
                      <span className="text-[10px] text-gray-400 font-normal ml-1">
                        (आजचा भाव बिलात लागेल)
                      </span>
                    </p>

                    {/* Flexible Weight / Quantity Selector */}
                    <div className="mt-3">
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                        प्रमाण निवडा (वजन):
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {unitOptions.map((u) => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => handleUnitSelect(product.id, u)}
                            className={`px-2 py-1 text-[11px] font-bold rounded-lg transition border ${
                              activeUnit === u
                                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Add Button */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ यादीत जोडा ({activeUnit})</span>
                    </button>
                    {qtyInCart > 0 && (
                      <p className="text-center text-[10px] text-emerald-700 font-semibold mt-1">
                        ✓ यादीत जोडले आहे ({cart.find(it => it.productId === product.id)?.unit})
                      </p>
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
            <div>
              <h3 className="text-base font-black text-gray-900">आपल्या ऑर्डर्सची स्थिती</h3>
              <p className="text-xs text-gray-500">
                दुकानातून सामान कधी घेऊन जायचे ते येथे दिसेल
              </p>
            </div>
            <span className="text-xs text-gray-500 font-bold">एकूण ऑर्डर्स: {myOrders.length}</span>
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
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">ऑर्डर #{ord.id}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                          🏪 दुकानात येऊन घेणे
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        तारीख: {new Date(ord.createdAt).toLocaleString('mr-IN')}
                      </p>
                      {ord.pickupReadyTime && (
                        <p className="text-xs font-bold text-teal-800 mt-1 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>पिक-अप वेळ: {ord.pickupReadyTime}</span>
                        </p>
                      )}
                    </div>

                    {/* Status Pill */}
                    <div>
                      {isPending && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full animate-pulse">
                          <Clock className="w-3.5 h-3.5" /> आजचा भाव लावला जात आहे...
                        </span>
                      )}
                      {isBilled && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> बिल तयार (₹{ord.totalAmount})
                        </span>
                      )}
                      {ord.status === 'पॅक_झाली' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
                          <ShoppingBag className="w-3.5 h-3.5" /> सामान तयार आहे! दुकानातून घ्या
                        </span>
                      )}
                      {ord.status === 'डिलिव्हर_झाली' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> सामान घेऊन गेले (पूर्ण झाले)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
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
                          <p className="text-gray-500 text-[11px]">{ord.parchiNotes || 'कागदी चिठ्ठीनुसार सामान दिले'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-gray-700">
                            <span>
                              {it.name} ({it.quantity} × {it.unit})
                            </span>
                            <span className="font-semibold">
                              {it.itemTotal ? `₹${it.itemTotal}` : 'दर बाकी'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs text-gray-500">एकूण बिल: </span>
                      <span className="text-base font-black text-emerald-800">
                        {ord.totalAmount > 0 ? `₹${ord.totalAmount}` : 'दुकानदार ठरवेल'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {/* Repeat Order Button */}
                      {ord.items && ord.items.length > 0 && (
                        <button
                          onClick={() => handleReorderPastItems(ord)}
                          className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95"
                          title="याच वस्तू पुन्हा यादीत घ्या आणि हवे ते बदल करा"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                          <span>पुन्हा हीच यादी मागवा (बदलांसह)</span>
                        </button>
                      )}

                      {ord.totalAmount > 0 && (
                        <button
                          onClick={() => onViewBill(ord)}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition"
                        >
                          <FileText className="w-4 h-4" />
                          <span>पावती (Bill)</span>
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
                className="mt-3 px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl"
              >
                आताच यादी तयार करा
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

            {myKhata ? (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-base text-gray-900">{myKhata.name}</h4>
                    <p className="text-xs text-gray-500 font-mono">मोबाईल: {myKhata.phone}</p>
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
                  ? `मोबाईल नंबर ${customerPhone} वर कोणतेही उधारी खाते आढळले नाही किंवा पूर्ण हिशोब पूर्ण आहे.` 
                  : 'हिशोब पाहण्यासाठी वर आपले नाव व मोबाईल नंबर टाका.'}
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
                <h3 className="font-black text-base text-gray-900">माझी यादी ({cart.length} वस्तू)</h3>
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
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-950 leading-tight">
              ⚖️ <strong>दर बाबत नोंद:</strong> किराणा सामानाचे भाव रोज बदलतात. दुकानदार माल भरताना आजच्या भावानुसार अंतिम बिल तयार करेल.
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto py-4 divide-y divide-gray-100">
              {cart.length > 0 ? (
                cart.map((item, idx) => {
                  const itemProduct = products.find((p) => p.id === item.productId);
                  const availableUnits = itemProduct?.availableUnits || [item.unit];

                  return (
                    <div key={idx} className="py-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-bold text-xs text-gray-900">{item.name}</p>
                          <p className="text-[11px] text-emerald-800 font-bold mt-0.5">
                            निवडलेले माप: {item.unit}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                            <button
                              onClick={() => updateQuantity(idx, -1)}
                              className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-xs font-bold text-gray-700 hover:bg-gray-200 shadow-xs"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-black px-1.5">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(idx, 1)}
                              className="w-6 h-6 bg-emerald-700 text-white rounded-lg flex items-center justify-center text-xs font-bold hover:bg-emerald-800 shadow-xs"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Remove item button */}
                          <button
                            onClick={() => removeFromCart(idx)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                            title="यादीतून काढून टाका"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Interactive Unit Switcher inside Cart */}
                      {availableUnits.length > 1 && (
                        <div className="flex flex-wrap items-center gap-1 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                          <span className="text-[10px] text-gray-400 font-semibold mr-1">माप बदला:</span>
                          {availableUnits.map((u) => (
                            <button
                              key={u}
                              type="button"
                              onClick={() => changeCartItemUnit(idx, u)}
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-md border transition ${
                                item.unit === u
                                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              {u}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-bold">यादी रिकामी आहे, कृपया वस्तू निवडा</p>
                </div>
              )}
            </div>

            {/* Checkout Form */}
            {cart.length > 0 && (
              <form onSubmit={handleCheckout} className="pt-4 border-t border-gray-100 space-y-3">
                {/* Pre-filled / Logged-in Customer info summary */}
                {customerName && customerPhone ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-900">{customerName}</p>
                      <p className="text-gray-500 font-mono">{customerPhone}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLoginModalOpen(true)}
                      className="text-[11px] text-emerald-800 font-bold hover:underline"
                    >
                      बदला ✏️
                    </button>
                  </div>
                ) : (
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
                      placeholder="१० अंकी नंबर *"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl font-medium font-mono"
                      required
                    />
                  </div>
                )}

                {/* Delivery Option with Alert */}
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">माल कसा घेणार?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className="py-2.5 px-2 text-xs font-bold rounded-xl border bg-emerald-700 text-white border-emerald-700 flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>🏪 दुकानातून येऊन घेणे</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryAlert(true);
                        setTimeout(() => setDeliveryAlert(false), 5000);
                      }}
                      className="py-2.5 px-2 text-xs font-bold rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:bg-gray-100 flex items-center justify-center gap-1"
                    >
                      <span>🛵 घरपोच डिलिव्हरी</span>
                    </button>
                  </div>

                  {deliveryAlert && (
                    <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold animate-in fade-in">
                      ⚠️ सध्या घरपोच डिलिव्हरी उपलब्ध नाही. कृपया ऑर्डर दिल्यानंतर दुकानातून येऊन सामान घ्यावे.
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-bold rounded-xl text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-2"
                >
                  <span>यादी दुकानात पाठवा (ऑर्डर करा) 🚀</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Customer 1-Time Easy Login Modal */}
      <CustomerLoginModal
        isOpen={isLoginModalOpen}
        onSuccess={handleCustomerLoginSuccess}
        onClose={() => setIsLoginModalOpen(false)}
        initialName={customerName}
        initialPhone={customerPhone}
      />
    </div>
  );
};
