'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Product, 
  Order, 
  OrderItem, 
  KhataCustomer, 
  ShopSettings, 
  OrderStatus 
} from '@/types/kirana';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_SHOP_SETTINGS, 
  INITIAL_KHATA_CUSTOMERS 
} from './sample-data';
import { db, isFirebaseConfigured } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  updateDoc 
} from 'firebase/firestore';

const STORAGE_KEYS = {
  SETTINGS: 'aapla_kirana_settings_v1',
  PRODUCTS: 'aapla_kirana_products_v1',
  ORDERS: 'aapla_kirana_orders_v1',
  KHATA: 'aapla_kirana_khata_v1',
  CUSTOMER_PHONE: 'aapla_kirana_customer_phone',
  CUSTOMER_NAME: 'aapla_kirana_customer_name',
  CUSTOMER_ADDRESS: 'aapla_kirana_customer_address',
};

export function useKiranaStore() {
  const [isClient, setIsClient] = useState(false);
  const [settings, setSettings] = useState<ShopSettings>(INITIAL_SHOP_SETTINGS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [khataCustomers, setKhataCustomers] = useState<KhataCustomer[]>(INITIAL_KHATA_CUSTOMERS);
  const [firebaseActive, setFirebaseActive] = useState<boolean>(false);

  // Initialize
  useEffect(() => {
    setIsClient(true);
    setFirebaseActive(isFirebaseConfigured());

    if (isFirebaseConfigured() && db) {
      // Setup Firestore Real-time Listeners
      const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
        const liveOrders: Order[] = [];
        snapshot.forEach((d) => liveOrders.push(d.data() as Order));
        liveOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(liveOrders);
      });

      const unsubSettings = onSnapshot(doc(db, 'settings', 'shop'), (snapshot) => {
        if (snapshot.exists()) {
          setSettings(snapshot.data() as ShopSettings);
        }
      });

      const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
        if (!snapshot.empty) {
          const liveProducts: Product[] = [];
          snapshot.forEach((d) => liveProducts.push(d.data() as Product));
          setProducts(liveProducts);
        }
      });

      const unsubKhata = onSnapshot(collection(db, 'khata'), (snapshot) => {
        if (!snapshot.empty) {
          const liveKhata: KhataCustomer[] = [];
          snapshot.forEach((d) => liveKhata.push(d.data() as KhataCustomer));
          setKhataCustomers(liveKhata);
        }
      });

      return () => {
        unsubOrders();
        unsubSettings();
        unsubProducts();
        unsubKhata();
      };
    } else {
      // LocalStorage Fallback
      try {
        const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (storedSettings) setSettings(JSON.parse(storedSettings));

        const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        if (storedProducts) setProducts(JSON.parse(storedProducts));

        const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
        if (storedOrders) setOrders(JSON.parse(storedOrders));

        const storedKhata = localStorage.getItem(STORAGE_KEYS.KHATA);
        if (storedKhata) setKhataCustomers(JSON.parse(storedKhata));
      } catch (err) {
        console.error('LocalStorage read error:', err);
      }
    }
  }, []);

  // Save to LocalStorage helper
  const persistLocally = useCallback((key: string, data: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage write failed:', e);
    }
  }, []);

  // 1. दुकानाची सेटिंग अपडेट करणे (Update Shop Settings)
  const updateSettings = async (newSettings: Partial<ShopSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (!firebaseActive) {
      persistLocally(STORAGE_KEYS.SETTINGS, updated);
    } else if (db) {
      await setDoc(doc(db, 'settings', 'shop'), updated, { merge: true });
    }
  };

  // दुकान चालू/बंद टॉगल
  const toggleShopOpen = async () => {
    await updateSettings({ isOpen: !settings.isOpen });
  };

  // 2. नवीन ऑर्डर पाठवणे (Customer: Create Order)
  const placeOrder = async (orderData: {
    customerName: string;
    customerPhone: string;
    customerAddress?: string;
    orderType: 'डिलिव्हरी' | 'दुकानातून_घेणे';
    items: OrderItem[];
    parchiImage?: string;
    parchiNotes?: string;
  }): Promise<Order> => {
    const newOrder: Order = {
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress,
      orderType: orderData.orderType,
      items: orderData.items,
      parchiImage: orderData.parchiImage,
      parchiNotes: orderData.parchiNotes,
      status: 'दर_निश्चिती_बाकी',
      totalAmount: 0,
      isPaid: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);

    if (!firebaseActive) {
      persistLocally(STORAGE_KEYS.ORDERS, updatedOrders);
    } else if (db) {
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);
    }

    return newOrder;
  };

  // 3. दुकानदार: आजचे दर टाकून बिल तयार करणे (Shopkeeper: Set Daily Rates & Bill)
  const setOrderDailyRates = async (
    orderId: string, 
    updatedItems: OrderItem[], 
    discount = 0
  ) => {
    const subtotal = updatedItems.reduce((sum, item) => {
      const itemTotal = (item.dailyRate || 0) * item.quantity;
      return sum + itemTotal;
    }, 0);

    const finalTotal = Math.max(0, subtotal - discount);

    const updatedOrders = orders.map((ord) => {
      if (ord.id === orderId) {
        return {
          ...ord,
          items: updatedItems.map((it) => ({
            ...it,
            itemTotal: (it.dailyRate || 0) * it.quantity,
          })),
          totalAmount: finalTotal,
          status: 'बिल_तयार' as OrderStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return ord;
    });

    setOrders(updatedOrders);

    if (!firebaseActive) {
      persistLocally(STORAGE_KEYS.ORDERS, updatedOrders);
    } else if (db) {
      const target = updatedOrders.find((o) => o.id === orderId);
      if (target) {
        await updateDoc(doc(db, 'orders', orderId), {
          items: target.items,
          totalAmount: target.totalAmount,
          status: 'बिल_तयार',
          updatedAt: target.updatedAt,
        });
      }
    }
  };

  // 4. ऑर्डर स्थिती बदलणे (Change Order Status)
  const updateOrderStatus = async (
    orderId: string, 
    status: OrderStatus, 
    paymentMethod?: 'रोख' | 'UPI' | 'उधारी',
    isPaid?: boolean
  ) => {
    const updatedOrders = orders.map((ord) => {
      if (ord.id === orderId) {
        return {
          ...ord,
          status,
          paymentMethod: paymentMethod || ord.paymentMethod,
          isPaid: isPaid !== undefined ? isPaid : ord.isPaid,
          updatedAt: new Date().toISOString(),
        };
      }
      return ord;
    });

    setOrders(updatedOrders);

    if (!firebaseActive) {
      persistLocally(STORAGE_KEYS.ORDERS, updatedOrders);
    } else if (db) {
      const updates: Record<string, unknown> = {
        status,
        updatedAt: new Date().toISOString(),
      };
      if (paymentMethod) updates.paymentMethod = paymentMethod;
      if (isPaid !== undefined) updates.isPaid = isPaid;
      await updateDoc(doc(db, 'orders', orderId), updates);
    }
  };

  // 5. उधारी वही: नवीन व्यवहार नोंदवणे (Khata Management)
  const recordKhataTransaction = async (
    customerId: string,
    type: 'उधारी_घेतली' | 'पैसे_जमा_केले',
    amount: number,
    notes: string
  ) => {
    const updatedKhata = khataCustomers.map((cust) => {
      if (cust.id === customerId) {
        const change = type === 'उधारी_घेतली' ? amount : -amount;
        const newTotal = Math.max(0, cust.totalDue + change);
        const newTx = {
          id: 'tx-' + Date.now(),
          date: new Date().toLocaleDateString('mr-IN'),
          type,
          amount,
          notes,
        };
        return {
          ...cust,
          totalDue: newTotal,
          lastUpdated: new Date().toLocaleDateString('mr-IN'),
          transactions: [newTx, ...cust.transactions],
        };
      }
      return cust;
    });

    setKhataCustomers(updatedKhata);

    if (!firebaseActive) {
      persistLocally(STORAGE_KEYS.KHATA, updatedKhata);
    } else if (db) {
      const target = updatedKhata.find((c) => c.id === customerId);
      if (target) {
        await setDoc(doc(db, 'khata', customerId), target);
      }
    }
  };

  // नवीन उधारी ग्राहक जोडणे
  const addKhataCustomer = async (name: string, phone: string, initialDue = 0) => {
    const newCustomer: KhataCustomer = {
      id: 'khata-' + Date.now(),
      name,
      phone,
      totalDue: initialDue,
      lastUpdated: new Date().toLocaleDateString('mr-IN'),
      transactions: initialDue > 0 ? [
        {
          id: 'tx-' + Date.now(),
          date: new Date().toLocaleDateString('mr-IN'),
          type: 'उधारी_घेतली',
          amount: initialDue,
          notes: 'सुरुवातीची बाकी उधारी',
        }
      ] : [],
    };

    const updated = [newCustomer, ...khataCustomers];
    setKhataCustomers(updated);

    if (!firebaseActive) {
      persistLocally(STORAGE_KEYS.KHATA, updated);
    } else if (db) {
      await setDoc(doc(db, 'khata', newCustomer.id), newCustomer);
    }
  };

  // 6. व्हॉट्सॲप मेसेज जनरेटर (WhatsApp Reminder & Bill Generator)
  const generateWhatsAppReminderUrl = (customer: KhataCustomer): string => {
    const phone = customer.phone.replace(/[^0-9]/g, '');
    const cleanPhone = phone.startsWith('91') ? phone : `91${phone}`;
    
    // Direct UPI link
    const upiLink = `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(settings.shopName)}&am=${customer.totalDue}&cu=INR`;

    const message = 
`🛒 *${settings.shopName}*
------------------------------
नमस्कार *${customer.name}* जी,

आपल्या खात्यावरील किराणा उधारी बाकी आहे.
💰 *एकूण बाकी रक्कम:* *₹${customer.totalDue}*

📲 *थेट Google Pay / PhonePe ने भरण्यासाठी लिंक:*
${upiLink}

📍 दुकानाचा पत्ता: ${settings.address}
📞 संपर्क: ${settings.phone}
🙏 धन्यवाद!`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const generateWhatsAppBillUrl = (order: Order): string => {
    const phone = order.customerPhone.replace(/[^0-9]/g, '');
    const cleanPhone = phone.startsWith('91') ? phone : `91${phone}`;

    const itemsText = order.items
      .map((it, i) => `${i + 1}. ${it.name} (${it.quantity} ${it.unit}) : ₹${it.itemTotal || 0}`)
      .join('\n');

    const upiLink = `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(settings.shopName)}&am=${order.totalAmount}&cu=INR`;

    const message = 
`🧾 *${settings.shopName} - बिल*
------------------------------
ग्राहक: *${order.customerName}*
ऑर्डर क्र.: *#${order.id}*
तारीख: ${new Date(order.createdAt).toLocaleDateString('mr-IN')}
प्रकार: ${order.orderType}

*सामानाची यादी (आजच्या भावासह):*
${itemsText}

------------------------------
💵 *एकूण बिल रक्कम: ₹${order.totalAmount}*
------------------------------

📲 *थेट UPI (PhonePe / GPay) द्वारे पेमेंट करा:*
${upiLink}

📍 पत्ता: ${settings.address}
📞 फोन: ${settings.phone}
आपल्या सेवेत नेहमी तत्पर! 🙏`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // वस्तूचा स्टॉक बदलणे
  const toggleProductStock = async (productId: string) => {
    const updated = products.map((p) => p.id === productId ? { ...p, inStock: !p.inStock } : p);
    setProducts(updated);
    if (!firebaseActive) {
      persistLocally(STORAGE_KEYS.PRODUCTS, updated);
    } else if (db) {
      const target = updated.find(p => p.id === productId);
      if (target) await updateDoc(doc(db, 'products', productId), { inStock: target.inStock });
    }
  };

  return {
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
  };
}
