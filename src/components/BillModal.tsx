'use client';

import React from 'react';
import { Order, ShopSettings } from '@/types/kirana';
import { X, Printer, Share2, CheckCircle2, QrCode, Phone, Clock } from 'lucide-react';

interface BillModalProps {
  order: Order | null;
  settings: ShopSettings;
  onClose: () => void;
  onShareWhatsApp: (order: Order) => void;
}

export const BillModal: React.FC<BillModalProps> = ({
  order,
  settings,
  onClose,
  onShareWhatsApp,
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const upiUrl = `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(settings.shopName)}&am=${order.totalAmount}&cu=INR`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 my-8">
        {/* Actions bar (hidden in print) */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧾</span>
            <h2 className="text-lg font-black text-gray-900">किराणा पावती (Bill)</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              title="प्रिंट करा"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Bill Area */}
        <div id="printable-bill" className="mt-4 p-4 border border-gray-200 rounded-2xl bg-amber-50/20 font-sans">
          {/* Shop Header */}
          <div className="text-center pb-3 border-b-2 border-dashed border-gray-300">
            <h3 className="text-xl font-black text-emerald-900">{settings.shopName}</h3>
            <p className="text-xs text-gray-700 font-semibold mt-0.5">प्रो. {settings.ownerName}</p>
            <p className="text-xs text-gray-600">{settings.address}</p>
            <p className="text-xs font-mono font-bold text-emerald-800">मोबाईल: {settings.phone}</p>
          </div>

          {/* Customer & Order Meta */}
          <div className="grid grid-cols-2 gap-2 text-xs py-3 border-b border-gray-200">
            <div>
              <p className="text-gray-500">ग्राहक नाव:</p>
              <p className="font-bold text-gray-900">{order.customerName}</p>
              <p className="text-gray-600 font-mono">{order.customerPhone}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">ऑर्डर क्र.: <span className="font-bold text-gray-900">#{order.id}</span></p>
              <p className="text-gray-600">तारीख: {new Date(order.createdAt).toLocaleDateString('mr-IN')}</p>
              <p className="font-bold text-emerald-800">🏪 दुकानातून घेणे</p>
              {order.pickupReadyTime && (
                <p className="text-[11px] font-bold text-teal-800 flex items-center justify-end gap-1 mt-0.5">
                  <Clock className="w-3 h-3" /> {order.pickupReadyTime}
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-300 text-gray-500 text-left">
                  <th className="py-1">अ.क्र.</th>
                  <th className="py-1">वस्तू</th>
                  <th className="py-1 text-center">प्रमाण</th>
                  <th className="py-1 text-right">आजचा दर</th>
                  <th className="py-1 text-right">रक्कम</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.length > 0 ? (
                  order.items.map((it, idx) => (
                    <tr key={idx} className="text-gray-800">
                      <td className="py-1.5">{idx + 1}</td>
                      <td className="py-1.5 font-medium">{it.name}</td>
                      <td className="py-1.5 text-center font-medium">{it.quantity} × {it.unit}</td>
                      <td className="py-1.5 text-right font-medium">₹{it.dailyRate || 0}</td>
                      <td className="py-1.5 text-right font-bold">₹{it.itemTotal || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-3 text-center text-gray-500 italic">
                      कागदी चिठ्ठीनुसार सामान दिले
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="mt-4 pt-3 border-t-2 border-dashed border-gray-300 flex justify-between items-center">
            <span className="text-sm font-black text-gray-800">एकूण बिल (Total):</span>
            <span className="text-2xl font-black text-emerald-800">₹{order.totalAmount}</span>
          </div>

          {/* Payment Status */}
          <div className="mt-2 text-center text-xs">
            {order.isPaid ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> पेमेंट झाले आहे ({order.paymentMethod || 'रोख'})
              </span>
            ) : (
              <span className="inline-block text-rose-700 font-bold bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                पेमेंट बाकी आहे ({order.paymentMethod || 'रोख / उधारी'})
              </span>
            )}
          </div>

          {/* Prominent PhonePe / GPay Box */}
          <div className="mt-4 p-3 bg-white border-2 border-emerald-300 rounded-xl text-center shadow-xs">
            <div className="flex items-center justify-center gap-1.5 text-emerald-900 font-bold text-xs mb-1">
              <Phone className="w-4 h-4 text-emerald-700" />
              <span>थेट PhonePe / Google Pay नंबर:</span>
            </div>
            <p className="text-lg font-mono font-black text-gray-900 tracking-wider">
              {settings.phone}
            </p>
            <p className="text-[11px] text-gray-500">नाव: {settings.ownerName} ({settings.shopName})</p>

            <a
              href={upiUrl}
              className="mt-2.5 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded-xl shadow-xs transition print:hidden"
            >
              <QrCode className="w-4 h-4" /> थेट UPI ॲपने पैसे भरा (₹{order.totalAmount})
            </a>
          </div>

          <div className="mt-3 text-center text-[10px] text-gray-400">
            आपल्या विश्वासासाठी धन्यवाद! पुन्हा भेट द्या.
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-5 flex gap-2 print:hidden">
          <button
            onClick={() => onShareWhatsApp(order)}
            className="flex-1 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-2xl shadow flex items-center justify-center gap-2 transition active:scale-98 text-xs sm:text-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp वर पावती पाठवा</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl text-xs sm:text-sm transition"
          >
            बंद करा
          </button>
        </div>
      </div>
    </div>
  );
};
