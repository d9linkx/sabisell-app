import React, { useState } from 'react';
import { ShoppingCart, Phone, MapPin, Check, Plus, Minus, MessageSquare, ArrowLeft } from 'lucide-react';
import { Product, BusinessProfile } from '../types';

interface PublicCatalogProps {
  products: Product[];
  businessProfile: BusinessProfile;
  ownerPhone: string;
  onBackToApp?: () => void;
  isMerchantPreview?: boolean;
}

export default function PublicCatalog({ 
  products, 
  businessProfile, 
  ownerPhone, 
  onBackToApp,
  isMerchantPreview = false 
}: PublicCatalogProps) {
  // Client order state
  const [cart, setCart] = useState<{ [productId: string]: number }>({});
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  const activeProducts = products.filter(p => p.type === 'service' || p.quantity > 0);

  const addToCart = (id: string, maxQty: number, type?: string) => {
    setCart(prev => {
      const cur = prev[id] || 0;
      if (type !== 'service' && cur >= maxQty) return prev;
      return { ...prev, [id]: cur + 1 };
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const cur = prev[id] || 0;
      if (cur <= 1) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      };
      return { ...prev, [id]: cur - 1 };
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const match = products.find(p => p.id === id);
      const itemQty = Number(qty) || 0;
      return sum + (match ? match.sellingPrice * itemQty : 0);
    }, 0);
  };

  const cartItemCount = Object.values(cart).reduce<number>((a, b) => Number(a) + Number(b), 0);

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleSendOrderToWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItemCount === 0) return;

    // Build the beautiful structured order text for WhatsApp
    let orderText = `🛒 *NEW CATALOG ORDER - ${businessProfile.businessName}*\n`;
    orderText += `-----------------------------------------\n`;
    
    Object.entries(cart).forEach(([id, qty]) => {
      const match = products.find(p => p.id === id);
      if (match) {
        orderText += `▪️ *${qty}x* ${match.name} (~${formatNaira(match.sellingPrice)}~)\n`;
      }
    });

    orderText += `-----------------------------------------\n`;
    orderText += `💰 *Total Amount:* ${formatNaira(getCartTotal())}\n\n`;
    
    if (customerName.trim()) {
      orderText += `👤 *Customer Name:* ${customerName.trim()}\n`;
    }
    if (customerAddress.trim()) {
      orderText += `📍 *Delivery Address:* ${customerAddress.trim()}\n`;
    }

    orderText += `\n⚡ _Sent via Sabisell Web Catalog_`;

    // Direct WhatsApp Api Link
    const cleanPhone = ownerPhone.replace(/[^0-9]/g, '');
    // WhatsApp defaults (if cleanPhone is empty or short, we send without phone to allow general share)
    const waUrl = cleanPhone.length > 5 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(orderText)}`
      : `https://wa.me/?text=${encodeURIComponent(orderText)}`;

    window.open(waUrl, '_blank');
    setOrderSubmitted(true);
  };

  // Group products by category
  const categories = Array.from(new Set(activeProducts.map(p => p.category || 'General')));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans pb-32">
      {/* Top Banner Alert if preview */}
      {isMerchantPreview && (
        <div className="bg-rose-50 border-b border-rose-100 px-4 py-2 text-center flex items-center justify-between z-50">
          <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider">
            👀 LIVE PREVIEW: Customer Ordering storefront Experience
          </span>
          {onBackToApp && (
            <button 
              onClick={onBackToApp}
              className="text-[10px] font-bold text-rose-800 underline flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3" /> Back to Dashboard
            </button>
          )}
        </div>
      )}

      {/* Mini store header */}
      <div className="bg-gradient-to-br from-rose-500/10 to-pink-500/5 dark:from-rose-950/20 border-b border-slate-100 dark:border-zinc-900/60 p-6 md:p-10 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="mx-auto w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm border border-rose-400/20">
            {businessProfile.businessName ? businessProfile.businessName.charAt(0).toUpperCase() : 'S'}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-ash-100 tracking-tight">
            Welcome to {businessProfile.businessName || 'Sabisell Store'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {businessProfile.whatsappGreeting || 'Browse our items below and place your order instantly! We will reply via WhatsApp.'}
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-1.5 text-xs text-slate-400">
            {businessProfile.address && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                {businessProfile.address}
              </span>
            )}
            {ownerPhone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                {ownerPhone}
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto p-4 space-y-8 mt-4">
        {activeProducts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900/40 border border-slate-100 rounded-3xl p-6">
            <p className="text-slate-400 text-sm">No items are currently active or in-stock in this catalog.</p>
          </div>
        ) : (
          categories.map(cat => {
            const catProds = activeProducts.filter(p => (p.category || 'General') === cat);
            if (catProds.length === 0) return null;

            return (
              <div key={cat} className="space-y-3">
                <h2 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest pl-1">
                  📁 {cat}
                </h2>
                
                <div className="grid grid-cols-1 gap-2.5">
                  {catProds.map(p => {
                    const countInCart = cart[p.id] || 0;
                    return (
                      <div 
                        key={p.id} 
                        className="bg-white dark:bg-zinc-900 border border-slate-100/80 dark:border-zinc-800/60 rounded-2xl p-4 flex items-center justify-between group hover:border-rose-200/50 dark:hover:border-rose-900/10 transition-colors shadow-3xs"
                      >
                        <div className="space-y-1 pr-4">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-ash-100">
                            {p.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-rose-500 font-mono">
                              {formatNaira(p.sellingPrice)}
                            </span>
                            {p.type === 'service' ? (
                              <span className="text-[10px] bg-purple-50 dark:bg-purple-950/20 text-purple-600 px-1.5 py-0.5 rounded border border-purple-100">
                                Service
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">
                                {p.quantity} Left
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Order controllers */}
                        <div className="flex items-center gap-2.5">
                          {countInCart > 0 ? (
                            <div className="flex items-center bg-slate-100 dark:bg-zinc-800 rounded-xl p-1 animate-in fade-in zoom-in-95 duration-150">
                              <button 
                                onClick={() => removeFromCart(p.id)}
                                className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-slate-600 dark:text-slate-300 cursor-pointer"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="px-3 text-xs font-bold font-mono text-slate-900 dark:text-white">
                                {countInCart}
                              </span>
                              <button 
                                onClick={() => addToCart(p.id, p.quantity, p.type)}
                                className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-slate-600 dark:text-slate-300 cursor-pointer disabled:opacity-30"
                                disabled={p.type !== 'service' && countInCart >= p.quantity}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(p.id, p.quantity, p.type)}
                              className="bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 hover:text-rose-700 text-rose-600 dark:text-rose-400 font-semibold text-xs px-3.5 py-2 rounded-xl border border-rose-100 dark:border-rose-950/30 font-medium transition-colors cursor-pointer"
                            >
                              Add To Order
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Floating Sticky Customer Order Drawer */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-slate-100 dark:border-zinc-800/80 p-4 shadow-xl z-40 animate-slide-in">
          <form onSubmit={handleSendOrderToWhatsApp} className="max-w-2xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-3 font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-grow">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block pb-1">My Name</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name..." 
                  required
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-rose-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block pb-1">Delivery Address (Optional)</label>
                <input 
                  type="text" 
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Where should we deliver?" 
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-rose-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="shrink-0 flex items-center md:items-end gap-3 justify-between md:justify-end mt-2 md:mt-0 pt-2.5 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div className="text-left font-sans">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total Bill</span>
                <p className="text-lg font-bold text-slate-900 dark:text-white font-mono leading-none mt-1">
                  {formatNaira(getCartTotal())}
                </p>
                <span className="text-[10px] text-slate-400 block mt-0.5">{cartItemCount} items selected</span>
              </div>

              <button 
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 duration-200 transition-all cursor-pointer active:scale-97"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Submit Order via WhatsApp</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmation of submission overlay */}
      {orderSubmitted && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 text-center max-w-sm space-y-4 shadow-2xl border border-slate-100 dark:border-zinc-800">
            <div className="mx-auto w-12 h-12 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center border border-emerald-200">
              <Check className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Order Draft Redirected!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We have loaded your raw bill details into WhatsApp. Ensure you hit the "Send" button inside WhatsApp to finish placing your order!
            </p>
            <button 
              onClick={() => { setOrderSubmitted(false); setCart({}); }}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 px-6 rounded-xl cursor-pointer w-full"
            >
              Close & Browse Catalog Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
