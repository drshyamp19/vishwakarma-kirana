export type Role = 'customer' | 'shopkeeper';

export interface Product {
  id: string;
  nameMr: string;       // उदा. "साखर (Sugar)"
  nameEn: string;
  category: 'धान्य व डाळी' | 'तेल व तूप' | 'मसाले व पॅकेट' | 'दैनंदिन किराणा' | 'स्वच्छता व साबण';
  unit: string;         // '१ किलो', '५०० ग्रॅम', '१ लिटर', '१ पाकीट'
  image: string;
  inStock: boolean;
  approxRate?: number;  // अंदाजे दर (फक्त संदर्भासाठी)
}

export interface OrderItem {
  productId?: string;
  name: string;
  unit: string;
  quantity: number;
  dailyRate?: number;   // दुकानदाराने टाकलेला आजचा दर (प्रति युनिट)
  itemTotal?: number;   // quantity * dailyRate
  notes?: string;       // उदा. 'बारीक साखर हवी'
}

export type OrderStatus = 
  | 'दर_निश्चिती_बाकी' // Pending daily rate entry by shopkeeper
  | 'बिल_तयार'         // Shopkeeper added rates, bill generated
  | 'पॅक_झाली'          // Packed and ready
  | 'डिलिव्हर_झाली'    // Delivered / Picked up
  | 'रद्द';             // Cancelled

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  orderType: 'डिलिव्हरी' | 'दुकानातून_घेणे'; // Home delivery or Self pickup
  items: OrderItem[];
  parchiImage?: string; // जर हस्तलिखित चिठ्ठीचा फोटो असेल तर (Base64 किंवा URL)
  parchiNotes?: string;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod?: 'रोख' | 'UPI' | 'उधारी';
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KhataTransaction {
  id: string;
  date: string;
  type: 'उधारी_घेतली' | 'पैसे_जमा_केले';
  amount: number;
  notes: string;
}

export interface KhataCustomer {
  id: string;
  name: string;
  phone: string;
  totalDue: number; // एकूण बाकी उधारी
  lastUpdated: string;
  transactions: KhataTransaction[];
}

export interface ShopSettings {
  shopName: string;
  ownerName: string;
  phone: string;
  upiId: string;       // PhonePe / GPay UPI ID (उदा. 9876543210@ybl)
  address: string;
  isOpen: boolean;
  minOrderAmount: number;
  deliveryCharge: number;
}
