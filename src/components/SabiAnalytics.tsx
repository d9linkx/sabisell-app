import React, { useState } from 'react';
import { 
  Award, 
  Users, 
  TrendingUp, 
  Gift, 
  Share2, 
  ArrowUpRight, 
  DollarSign, 
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { Product, Sale, BusinessProfile } from '../types';

interface SabiAnalyticsProps {
  products: Product[];
  sales: Sale[];
  businessProfile?: BusinessProfile;
}

export default function SabiAnalytics({ products, sales, businessProfile }: SabiAnalyticsProps) {
  const [bonusFormOpen, setBonusFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [customBonusMessage, setCustomBonusMessage] = useState('Thank you so much for being our top customer! We have a special Christmas gift / discount package waiting for you at the shop.');

  // Group and compute customer rankings
  const customerStatsMap: { [key: string]: { totalSpend: number; totalPaid: number; totalOwed: number; transactionCount: number } } = {};

  sales.forEach(sale => {
    const rawName = sale.customerName || 'Walk-in Customer';
    // Clean name a bit or leave as is
    const name = rawName.trim();
    if (!customerStatsMap[name]) {
      customerStatsMap[name] = { totalSpend: 0, totalPaid: 0, totalOwed: 0, transactionCount: 0 };
    }
    customerStatsMap[name].totalSpend += sale.totalAmount;
    customerStatsMap[name].totalPaid += sale.amountPaid;
    customerStatsMap[name].totalOwed += sale.balanceDebt;
    customerStatsMap[name].transactionCount += 1;
  });

  // Sort customers by total spend descending
  const rankedCustomers = Object.entries(customerStatsMap)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.totalSpend - a.totalSpend);

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleShareReward = (customerName: string, totalSpend: number) => {
    const defaultGreeting = `Hello ${customerName}! 🌟\n\nThis is *${businessProfile?.businessName || 'our shop'}*. We are looking at our annual VIP customer records, and we see say you be one of our top customers with total patronage of *${formatNaira(totalSpend)}*!\n\nAs a big thank you, ${customBonusMessage}\n\nWe appreciate your business! God bless you. 😊🙏`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(defaultGreeting)}`;
    window.open(waUrl, '_blank');
  };

  // Top Spender metrics
  const totalPatronageValue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const activeCustomerCount = rankedCustomers.length;
  const avgSpendPerCustomer = activeCustomerCount > 0 ? totalPatronageValue / activeCustomerCount : 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in font-sans" id="sabi-analytics-container">
      {/* Jumbotron header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
          <Award className="h-6 w-6 text-pink-500 animate-pulse" />
          <span>Sabi SME Customer Loyalty & Analytics</span>
        </h1>
        <p className="text-xs text-gray-500">
          Trace custom customer patronage, find total investments, and reward top spenders to grow customer retention.
        </p>
      </div>

      {/* Aggregate metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-3xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Sales Invoiced</span>
            <div className="bg-pink-50 text-pink-600 p-2 rounded-xl border border-pink-100">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-display font-semibold text-slate-900 tracking-tight">{formatNaira(totalPatronageValue)}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Sum total of all registered business transactions</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-3xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Registered Clients</span>
            <div className="bg-blue-50 text-blue-600 p-2 rounded-xl border border-blue-100">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-display font-semibold text-slate-900 tracking-tight">{activeCustomerCount} Client Account(s)</h3>
            <p className="text-[10px] text-slate-400 mt-1">Unique customer profiles active on ledger</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-3xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Average Customer Lifetime Value</span>
            <div className="bg-green-50 text-green-600 p-2 rounded-xl border border-green-100">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-display font-semibold text-slate-900 tracking-tight">{formatNaira(avgSpendPerCustomer)}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Average patronage revenue per unique client</p>
          </div>
        </div>
      </div>

      {/* Main Loyalty board and VIP Customer insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ranked loyalty list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <p className="font-display font-bold text-slate-900 text-sm">Customer Patronage Leaderboard (VIP Rankings)</p>
              </div>
              <span className="text-[10px] bg-pink-100 text-pink-700 font-bold px-2.5 py-1 rounded-full border border-pink-200">
                Sorted by Revenue
              </span>
            </div>

            {rankedCustomers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-405 border-b border-slate-100 bg-slate-50 uppercase text-[9px] font-bold tracking-wider">
                      <th className="p-3 text-center w-12">Rank</th>
                      <th className="p-3">Customer Profile</th>
                      <th className="p-3 text-center">Invoices</th>
                      <th className="p-3 text-right">Owed Debt</th>
                      <th className="p-3 text-right">Total Patronage</th>
                      <th className="p-3 text-center">Reward Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rankedCustomers.map((customer, index) => {
                      const spendLimitReward = customer.totalSpend >= 100000;
                      return (
                        <tr key={customer.name} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 text-center font-bold">
                            {index === 0 && <span className="text-lg" title="Gold Spender">🥇</span>}
                            {index === 1 && <span className="text-lg" title="Silver Spender">🥈</span>}
                            {index === 2 && <span className="text-lg" title="Bronze Spender">🥉</span>}
                            {index > 2 && <span className="text-slate-500 font-mono">#{index + 1}</span>}
                          </td>
                          <td className="p-3 font-semibold text-slate-900">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[10px]">
                                {customer.name.substring(0,2).toUpperCase()}
                              </div>
                              <div>
                                <span className="block text-slate-900 font-bold">{customer.name}</span>
                                {spendLimitReward && (
                                  <span className="inline-flex items-center bg-pink-50 text-pink-700 text-[8px] px-1.5 py-0.5 rounded-full font-bold border border-pink-200 mt-0.5 uppercase tracking-wide">
                                    ⭐ VIP Gold Tier
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center font-mono text-slate-650">{customer.transactionCount} sale(s)</td>
                          <td className="p-3 text-right font-mono text-slate-600">
                            {customer.totalOwed > 0 ? (
                              <span className="text-red-500 font-semibold">{formatNaira(customer.totalOwed)}</span>
                            ) : (
                              <span className="text-slate-400">All Clear</span>
                            )}
                          </td>
                          <td className="p-3 text-right font-mono text-emerald-700 font-bold">
                            {formatNaira(customer.totalSpend)}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCustomer(customer.name);
                                setBonusFormOpen(true);
                              }}
                              className="text-[10px] bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 font-semibold px-2.5 py-1.5 rounded-xl flex items-center gap-1 mx-auto transition-all cursor-pointer"
                              title="Prepare gift or discount offer message"
                            >
                              <Gift className="h-3.5 w-3.5" />
                              <span>Give Special Reward</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 flex flex-col items-center justify-center gap-2">
                <AlertCircle className="h-8 w-8 text-neutral-300" />
                <p className="text-slate-400 font-medium">Log trades in Sales & Debts tab to populate leaderboard!</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Engagement Advisor & Christmas Cards Builder */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-205 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Gift className="h-4.5 w-4.5 text-pink-500 animate-bounce" />
              <span>Sabi VIP Treatment Lounge</span>
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed font-light">
              Reward loyal spenders with special Christmas gifts, bonuses, and prioritize their deliveries to maintain consistent revenue flow. Use the text builder below as a message template:
            </p>

            <div className="space-y-3.5 pt-3 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Custom Promo or Gift Note</label>
                <textarea
                  value={customBonusMessage}
                  onChange={(e) => setCustomBonusMessage(e.target.value)}
                  placeholder="Describe gift/bonus info: e.g. We have a special gift pack worth ₦5000 waiting for you!"
                  className="w-full bg-slate-50 border border-slate-150 rounded-xl p-3 text-xs focus:outline-none focus:bg-white focus:border-pink-400 transition-all leading-relaxed resize-none h-28"
                />
              </div>

              {bonusFormOpen && selectedCustomer && (
                <div className="p-3 bg-pink-50 border border-pink-150 text-slate-800 rounded-xl space-y-2.5 animate-fade-in text-xs font-sans">
                  <p className="font-bold text-pink-900">Custom Reward Draft Ready:</p>
                  <p className="text-[11px] leading-relaxed italic text-slate-700">for {selectedCustomer}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const score = customerStatsMap[selectedCustomer]?.totalSpend || 0;
                        handleShareReward(selectedCustomer, score);
                        setBonusFormOpen(false);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer text-[10px]"
                    >
                      <Share2 className="h-3 w-3" />
                      Send on WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setBonusFormOpen(false)}
                      className="bg-slate-200 text-slate-600 px-3 py-2 rounded-lg text-[10px]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {!bonusFormOpen && rankedCustomers.length > 0 && (
                <div className="p-3.5 bg-yellow-50 text-yellow-805 rounded-xl border border-yellow-100 text-xs leading-relaxed flex items-start gap-2">
                  <UserCheck className="h-4.5 w-4.5 text-yellow-600 shrink-0 mt-0.5" />
                  <span>
                    Oga, patronage leader *{rankedCustomers[0].name}* spends total of {formatNaira(rankedCustomers[0].totalSpend)}! Consider sending them prioritised premium delivery or custom gifts today!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
