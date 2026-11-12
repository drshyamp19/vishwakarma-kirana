'use client';

import React, { useState } from 'react';
import { KhataCustomer, ShopSettings } from '@/types/kirana';
import { X, Send, Plus, ArrowDownLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface KhataReminderModalProps {
  customer: KhataCustomer | null;
  settings: ShopSettings;
  onClose: () => void;
  onSendWhatsApp: (customer: KhataCustomer) => void;
  onRecordTransaction: (
    customerId: string,
    type: 'उधारी_घेतली' | 'पैसे_जमा_केले',
    amount: number,
    notes: string
  ) => void;
}

export const KhataReminderModal: React.FC<KhataReminderModalProps> = ({
  customer,
  settings,
  onClose,
  onSendWhatsApp,
  onRecordTransaction,
}) => {
  const [showAddTx, setShowAddTx] = useState(false);
  const [txType, setTxType] = useState<'उधारी_घेतली' | 'पैसे_जमा_केले'>('पैसे_जमा_केले');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  if (!customer) return null;

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) return;

    onRecordTransaction(customer.id, txType, num, notes || (txType === 'पैसे_जमा_केले' ? 'जमा पावती' : 'किराणा खरेदी'));
    setAmount('');
    setNotes('');
    setShowAddTx(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-black text-gray-900">{customer.name}</h2>
            <p className="text-xs text-gray-500 font-mono">मोबाईल: {customer.phone}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Due Amount Highlight Card */}
        <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-rose-800">एकूण बाकी उधारी (Balance Due)</p>
            <h3 className="text-3xl font-black text-rose-700 mt-1">₹{customer.totalDue}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">शेवटचा बदल: {customer.lastUpdated}</p>
          </div>

          <button
            onClick={() => onSendWhatsApp(customer)}
            className="px-4 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-2xl shadow flex items-center gap-2 transition active:scale-95 text-xs sm:text-sm"
          >
            <Send className="w-4 h-4" />
            <span>WhatsApp पाठवा</span>
          </button>
        </div>

        {/* Quick Transaction Action */}
        <div className="mt-4">
          {!showAddTx ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setTxType('पैसे_जमा_केले');
                  setShowAddTx(true);
                }}
                className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
              >
                <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                <span>+ पैसे जमा झाले (Paid)</span>
              </button>
              <button
                onClick={() => {
                  setTxType('उधारी_घेतली');
                  setShowAddTx(true);
                }}
                className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
              >
                <ArrowUpRight className="w-4 h-4 text-rose-600" />
                <span>+ नवीन उधारी दिली (Credit)</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleAddTx} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">
                  {txType === 'पैसे_जमा_केले' ? '🟢 रक्कम जमा करा' : '🔴 उधारी वाढवा'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddTx(false)}
                  className="text-xs text-gray-500 hover:text-gray-800"
                >
                  रद्द करा
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="रक्कम ₹"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-gray-300 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="नोंद (उदा. GPay ने दिले)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
              >
                नोंद सेव्ह करा
              </button>
            </form>
          )}
        </div>

        {/* Transaction History List */}
        <div className="mt-5">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            मागील व्यवहार इतिहास (History)
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {customer.transactions && customer.transactions.length > 0 ? (
              customer.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        tx.type === 'पैसे_जमा_केले'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {tx.type === 'पैसे_जमा_केले' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">
                        {tx.type === 'पैसे_जमा_केले' ? 'रक्कम जमा' : 'उधारी घेतली'}
                      </p>
                      <p className="text-[11px] text-gray-500">{tx.notes} • {tx.date}</p>
                    </div>
                  </div>
                  <span
                    className={`font-black text-sm ${
                      tx.type === 'पैसे_जमा_केले' ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {tx.type === 'पैसे_जमा_केले' ? '-' : '+'}₹{tx.amount}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-gray-400 py-4">अजून कोणताही व्यवहार नोंदवलेला नाही</p>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-5 pt-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition"
          >
            बंद करा
          </button>
        </div>
      </div>
    </div>
  );
};
