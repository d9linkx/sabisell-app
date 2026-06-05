import React, { useState } from 'react';
import { SabisellLogo } from './SabisellLogo';
import { 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Smartphone, 
  Mic, 
  Sparkles, 
  Copy, 
  Check, 
  MessageSquare, 
  ArrowDownToLine, 
  Users, 
  Lock, 
  Star, 
  Database, 
  Zap, 
  Globe,
  Sun,
  Moon
} from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onEnterApp: () => void;
  theme?: string;
  setTheme?: (t: string) => void;
}

export default function LandingPage({ onEnterApp, theme, setTheme }: LandingPageProps) {
  // Simulator State (Section 4)
  const [simName, setSimName] = useState('Mama Tunde');
  const [simItem, setSimItem] = useState('2 Cartons of Spaghetti & Vegetable Oil');
  const [simTotal, setSimTotal] = useState(12500);
  const [simPaid, setSimPaid] = useState(4500);
  const [copied, setCopied] = useState(false);

  const simDebt = Math.max(0, simTotal - simPaid);
  const invoiceMessage = `Hello ${simName || 'Customer'}, here na your invoice from Sabisell:
Items: ${simItem || 'Goods purchased'}
Total Cost: ₦${Number(simTotal).toLocaleString()}
Amount Paid: ₦${Number(simPaid).toLocaleString()}
Balance Debt: ₦${Number(simDebt).toLocaleString()}

Please transfer directly to settle this book. Thank you for your business!`;

  const copyMessage = () => {
    navigator.clipboard.writeText(invoiceMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="landing-container" className="min-h-screen bg-ash-50 text-ash-900 font-sans font-light selection:bg-mint-200">
      
      {/* HEADER NAVIGATION */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-ash-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-mint-400 rounded-xl flex items-center justify-center shadow-xs">
            <SabisellLogo className="h-5 w-5 text-white" animate={true} />
          </div>
          <div>
            <span className="font-display font-semibold text-lg tracking-tight text-ash-900">Sabisell</span>
            <span className="text-[9px] text-ash-400 font-normal uppercase tracking-widest block font-sans">SME COMMAND CENTER</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-7 text-xs font-medium text-ash-500">
          <a href="#how-it-works" className="hover:text-mint-500 transition-colors">How It Works</a>
          <a href="#pain-points" className="hover:text-mint-500 transition-colors">The Solution</a>
          <a href="#features" className="hover:text-mint-500 transition-colors">Features</a>
          <a href="#simulator" className="hover:text-mint-500 transition-colors">Simulator</a>
          <a href="#testimonials" className="hover:text-mint-500 transition-colors">Success Stories</a>
          <a href="#security" className="hover:text-mint-500 transition-colors">Security</a>
        </div>
        <div className="flex items-center gap-3">
          {theme && setTheme && (
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2.5 rounded-xl border border-ash-200 hover:border-mint-400 text-ash-500 hover:text-mint-600 transition-all cursor-pointer bg-ash-fb shadow-3xs hover:scale-105 active:scale-95 flex items-center justify-center min-h-[44px]"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <Moon className="h-4.5 w-4.5" />
              ) : (
                <Sun className="h-4.5 w-4.5" />
              )}
            </button>
          )}
          <button 
            id="header-open-app-btn"
            onClick={onEnterApp}
            className="bg-mint-400 hover:bg-mint-500 text-white text-xs font-medium py-2.5 px-4.5 rounded-xl cursor-pointer shadow-xs active:scale-98 hover:scale-102 transition-all flex items-center justify-center gap-1.5 min-h-[44px]"
          >
            <span>Open App</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* SECTION 1: HERO & MARKET PRESENCE HEADLINE */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 md:pt-24 pb-14 sm:pb-24 px-4 sm:px-8 bg-gradient-to-b from-ash-50 via-ash-100/40 to-white dark:from-ash-950 dark:via-ash-900/40 dark:to-black text-center border-b border-ash-200/40 dark:border-ash-100/10">
        {/* Modern radial ambient lights & dotted layout grid for studio depth */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-45"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[650px] h-[350px] sm:h-[650px] bg-mint-200/15 dark:bg-mint-950/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-pink-100/10 dark:bg-pink-950/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 relative z-10">
          
          {/* Live Customer Traction Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-mint-50/95 dark:bg-mint-950/30 border border-mint-200/60 dark:border-mint-800/40 rounded-full text-[10.5px] sm:text-xs text-mint-750 dark:text-mint-300 font-semibold shadow-2xs max-w-full text-center"
          >
            <Sparkles className="h-3.5 w-3.5 text-mint-500 animate-pulse shrink-0" />
            <span className="truncate">Active with 15k+ sellers in 🇳🇬, 🇬🇭, 🇰🇪, 🇿🇦, 🇬🇧 & 🇺🇸</span>
          </motion.div>

          {/* Majestic Hero Headline (Fluid, clear wrapping on mobile) */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[1.85rem] sm:text-[3.5rem] md:text-[4.5rem] font-display font-light text-ash-950 dark:text-white tracking-tight leading-[1.05] sm:leading-[1.08] text-center"
          >
            <span className="block sm:inline">Sabi your sales.</span>{" "}
            <span className="block sm:inline">Track every debit.</span>{" "}
            <span className="font-semibold block sm:inline text-mint-400">Protect your money.</span>
          </motion.h1>

          {/* Friendly, accessible direct copy */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm md:text-base text-ash-550 dark:text-ash-450 max-w-2xl mx-auto font-light leading-relaxed px-1 sm:px-4"
          >
            If you run a shop, sell items, or manage a business, Sabisell is made directly for you. 
            Stop stressing over lost paper books or tricky addition. Write down your sales, watch your stock count itself, 
            and send cute WhatsApp payment reminders to clients in just one click.
          </motion.p>

          {/* Premium call to action buttons (Vertical stack on mobile, horizontal on desktop) */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 pt-4 max-w-xs sm:max-w-none mx-auto w-full sm:w-auto"
          >
            <button 
              id="hero-start-now-btn"
              onClick={onEnterApp}
              className="bg-mint-400 hover:bg-mint-500 text-white text-xs sm:text-sm py-4 px-9 rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-98 cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 font-bold min-h-[48px]"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4 text-white" />
            </button>
            <a 
              id="hero-try-demo-btn"
              href="#simulator" 
              className="bg-white hover:bg-ash-50 dark:bg-ash-900/50 dark:hover:bg-ash-800 text-ash-850 dark:text-ash-100 text-xs sm:text-sm py-4 px-9 rounded-2xl border border-ash-200 dark:border-ash-800 hover:border-mint-300 dark:hover:border-mint-700 shadow-3xs hover:scale-[1.02] active:scale-98 transition-all duration-200 flex items-center justify-center gap-2 font-semibold min-h-[48px] cursor-pointer"
            >
              <span>Try Sandbox Simulator</span>
            </a>
          </motion.div>

          {/* High-Fidelity Responsive Merchant Control Center Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.65 }}
            className="pt-10 max-w-5xl mx-auto"
          >
            <div className="relative mx-auto rounded-3xl border border-ash-200/80 dark:border-ash-800/60 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden bg-white/95 dark:bg-ash-950/80 p-2 sm:p-3.5 backdrop-blur-md">
              
              {/* Browser control window chrome bar */}
              <div className="flex items-center justify-between border-b border-ash-150/40 dark:border-ash-800/40 pb-3.5 px-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/80 shrink-0"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80 shrink-0"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-mint-400/80 shrink-0"></span>
                  <span className="text-[10px] text-ash-400/80 dark:text-ash-500 font-mono pl-1.5 truncate max-w-[120px] sm:max-w-none">https://sabisell-merchant-system</span>
                </div>
                <div className="flex items-center gap-1.5 bg-mint-50 dark:bg-mint-950/30 px-2 py-0.5 rounded-full text-[9px] font-mono text-mint-600 dark:text-mint-400 border border-mint-100 dark:border-mint-900/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-mint-500 animate-ping"></span>
                  <span>Cloud Database Connected</span>
                </div>
              </div>

              {/* Responsive Dashboard Contents */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-2 sm:p-4 text-left">
                
                {/* 1. Simulated Smartphone Interface Mock (5 column-scale) */}
                <div className="lg:col-span-5 bg-ash-fb/60 dark:bg-ash-900/20 rounded-2xl border border-ash-150 dark:border-ash-800/50 p-4.5 space-y-4">
                  
                  {/* Smartphone app header */}
                  <div className="flex items-center justify-between pb-3 border-b border-ash-200/50 dark:border-ash-800/50">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-mint-100 dark:bg-mint-950/50 text-mint-600 dark:text-mint-400 rounded-lg flex items-center justify-center text-xs font-bold">
                        B
                      </div>
                      <div>
                        <h4 className="text-[11.5px] font-semibold text-ash-900 dark:text-white">Balogun Mini-Mart 🏪</h4>
                        <p className="text-[9px] text-ash-400 dark:text-ash-550">Lagos Island, Nigeria</p>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 bg-mint-50 dark:bg-mint-950/30 border border-mint-200/40 text-[8px] font-mono text-mint-600 rounded uppercase tracking-wider">Mobile</span>
                  </div>

                  {/* Cash overview cards */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-white dark:bg-ash-950 px-3 py-2.5 rounded-xl border border-ash-250/20 dark:border-ash-800/40">
                      <span className="text-[8px] text-ash-400 dark:text-ash-500 uppercase font-mono tracking-wider block">Total Inflows</span>
                      <span className="text-sm font-semibold text-ash-900 dark:text-white font-mono">₦3,450,000</span>
                    </div>
                    <div className="bg-white dark:bg-ash-950 px-3 py-2.5 rounded-xl border border-ash-250/20 dark:border-ash-800/40">
                      <span className="text-[8px] text-ash-400 dark:text-ash-500 uppercase font-mono tracking-wider block">Active Debts</span>
                      <span className="text-sm font-semibold text-red-500 font-mono">₦420,000</span>
                    </div>
                  </div>

                  {/* Recent Activity entries */}
                  <div className="space-y-2">
                    <span className="text-[8.5px] font-semibold text-ash-400 dark:text-ash-500 tracking-wider uppercase block">Today s Trades</span>
                    
                    <div className="p-2.5 bg-white dark:bg-ash-950 rounded-xl border border-ash-250/10 dark:border-ash-800/30 flex items-center justify-between text-[11px]">
                      <div>
                        <p className="font-semibold text-ash-900 dark:text-white">Ankara Lace (4 Yards)</p>
                        <p className="text-[9px] text-ash-400 dark:text-ash-500">Buyer: Mrs. Janet Adebayo</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-ash-900 dark:text-white font-mono">₦54,050</p>
                        <span className="px-1.5 py-0.5 bg-mint-50 dark:bg-mint-950/40 text-mint-600 dark:text-mint-400 text-[8px] rounded font-medium">Fully Paid ✓</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white dark:bg-ash-950 rounded-xl border border-ash-250/10 dark:border-ash-800/30 flex items-center justify-between text-[11px]">
                      <div>
                        <p className="font-semibold text-ash-900 dark:text-white">Pro Cement (6 Bags)</p>
                        <p className="text-[9px] text-ash-400 dark:text-ash-500">Buyer: Tunde Alao</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-ash-900 dark:text-white font-mono">₦45,000</p>
                        <span className="px-1.5 py-0.5 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 text-[8px] rounded font-medium">₦15,000 Owed ⏱</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white dark:bg-ash-950 rounded-xl border border-ash-250/10 dark:border-ash-800/30 flex items-center justify-between text-[11px]">
                      <div>
                        <p className="font-semibold text-ash-900 dark:text-white">Wholesale Maize Bag</p>
                        <p className="text-[9px] text-ash-400 dark:text-ash-500">Buyer: Ibrahim Dele</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-ash-900 dark:text-white font-mono">₦28,000</p>
                        <span className="px-1.5 py-0.5 bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 text-[8px] rounded font-bold">Unpaid Credit 🔔</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 2. Interactive Power Tools Display Area (7 column-scale) */}
                <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
                  
                  {/* Direct feature demonstration: Voice controller log simulation */}
                  <div className="bg-ash-fb/30 dark:bg-ash-900/10 rounded-2xl border border-ash-200/60 dark:border-ash-800/40 p-4 space-y-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-500 flex items-center justify-center">
                        <Mic className="h-3.5 w-3.5" />
                      </div>
                      <h5 className="text-[11px] font-bold text-ash-900 dark:text-white uppercase tracking-wider">Vocal Ledger Engine Log</h5>
                    </div>
                    
                    <div className="bg-white dark:bg-ash-950 border border-ash-150 dark:border-ash-800/60 rounded-xl p-3 flex items-center justify-between gap-3 shadow-3xs">
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-semibold text-pink-500 uppercase tracking-widest font-mono block">Dynamic Voice Input</span>
                        <p className="text-[11.5px] text-ash-700 dark:text-ash-250 italic">"Sold Ankara fabric and six tubers of yam to Adebayo"</p>
                      </div>
                      <span className="bg-pink-50 dark:bg-pink-950/50 border border-pink-100 dark:border-pink-900/30 px-2 py-1 text-[8.5px] text-pink-600 dark:text-pink-400 rounded-lg animate-pulse shrink-0 font-medium">Analyzing...</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 text-[10.5px]">
                      <div className="bg-white/60 dark:bg-ash-950/40 p-2.5 rounded-lg border border-ash-150/40 text-left">
                        <span className="text-[8px] text-ash-400 uppercase font-mono block">IDENTIFIED ITEM</span>
                        <span className="font-semibold text-ash-850 dark:text-ash-100">Fabric & Yam</span>
                      </div>
                      <div className="bg-white/60 dark:bg-ash-950/40 p-2.5 rounded-lg border border-ash-150/40 text-left">
                        <span className="text-[8px] text-ash-400 uppercase font-mono block">LEDGER STATUS</span>
                        <span className="font-bold text-mint-600 dark:text-mint-450">Automatic Draft Readied ✓</span>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Automated Credit Notification Bubble */}
                  <div className="bg-[#e5ddd5] dark:bg-ash-900/30 rounded-2xl border border-ash-200/60 dark:border-ash-800/40 p-4 space-y-3.5 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5.5 h-5.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                          W
                        </div>
                        <h5 className="text-[11px] font-bold text-emerald-800 dark:text-emerald-450 uppercase tracking-wider">Polite Recovery Reminder</h5>
                      </div>
                      <span className="text-[9px] text-ash-500 font-mono">To: Janet Adebayo</span>
                    </div>

                    {/* Chat Bubble Layout with tailored green tail */}
                    <div className="relative ml-2 sm:ml-5 mr-10 bg-[#dcf8c6] dark:bg-emerald-950/70 p-3 rounded-xl border border-emerald-250/20 shadow-2xs text-[11px] text-emerald-950 dark:text-emerald-100">
                      <p className="leading-relaxed">
                        Hello Mrs. Adebayo, this is a friendly update from <strong>Balogun Mini-Mart</strong>. Friendly reminder of your balance of <strong>₦15,000</strong>. Tap to view your digital shop invoice here: <span className="text-emerald-600 underline cursor-pointer">sabisell.com/i/5xrt</span>. Thank you!
                      </p>
                      
                      {/* CSS Triangle bubble tail detail */}
                      <div className="absolute right-full top-3 w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] border-r-[#dcf8c6] dark:border-r-emerald-950/70 -mr-0.5"></div>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* EXPLANATORY FOCUS SECTIONS FOR MERCHANTS OF ALL SIZES */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 bg-white border-b border-ash-200/40">
        <div className="max-w-5xl mx-auto space-y-20">
          
          {/* 1. WHO IS SABISELL FOR? WITH IMAGE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[10px] font-semibold text-mint-600 tracking-wider uppercase bg-mint-50 px-2.5 py-1 rounded-full">WHO IS THIS FOR?</span>
              <h2 className="text-2xl sm:text-3xl font-display font-light text-ash-950 tracking-tight leading-tight max-w-[50vw] sm:max-w-none">
                Made for Sellers of <span className="font-semibold text-mint-500">Every Single Size</span> & Market
              </h2>
              <p className="text-xs sm:text-sm text-ash-500 leading-relaxed font-light">
                Whether you sell alone from a small desk at home, run a busy street stall in the local market, manage an elegant fashion boutique, or run big wholesale distribution warehouses, Sabisell is for you. We made it so simple that anyone can use it.
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <span className="text-[11px] font-medium text-ash-700 bg-ash-50 border border-ash-200/50 px-2.5 py-1 rounded-lg">🏪 Store & Kiosk Owners</span>
                <span className="text-[11px] font-medium text-ash-700 bg-ash-50 border border-ash-200/50 px-2.5 py-1 rounded-lg">👜 Fashion Brands & Boutiques</span>
                <span className="text-[11px] font-medium text-ash-700 bg-ash-50 border border-ash-200/50 px-2.5 py-1 rounded-lg">📦 Wholesalers & Suppliers</span>
                <span className="text-[11px] font-medium text-ash-700 bg-ash-50 border border-ash-200/50 px-2.5 py-1 rounded-lg">💻 Online Shops & Social Sellers</span>
              </div>
            </div>
            
            <div className="lg:col-span-4 relative group overflow-hidden rounded-2xl border border-ash-200 bg-ash-fb/30 flex items-center justify-center p-3 shadow-xs">
              <img 
                src="https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=800&q=80" 
                alt="Sabisell Global Merchants"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover rounded-xl shadow-xs group-hover:scale-[1.02] transition-transform duration-300"
              />
            </div>

            <div className="lg:col-span-3 space-y-4">
              <div className="p-4 rounded-xl border border-ash-150 bg-ash-fb/20 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-mint-50 text-mint-600 flex items-center justify-center shrink-0">
                  <Globe className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-semibold text-ash-900">Works Globally</h4>
                <p className="text-[10.5px] text-ash-500 leading-normal">
                  Sabisell adapts to any monetary system. It tracks $, £, €, ₵, KSh, or ₦ perfectly.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-ash-150 bg-ash-fb/20 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-mint-50 text-mint-600 flex items-center justify-center shrink-0">
                  <Smartphone className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-semibold text-ash-900">Zero Technical Stress</h4>
                <p className="text-[10.5px] text-ash-500 leading-normal">
                  If you can send text messages on WhatsApp, you already know how to use Sabisell.
                </p>
              </div>
            </div>
          </div>

          <hr className="border-ash-200/40" />

          {/* 2. WHY YOU NEED IT WITH IMAGE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-4 relative group overflow-hidden rounded-2xl border border-ash-200 bg-ash-fb/30 flex items-center justify-center p-3 shadow-xs order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80" 
                alt="Paper Ledger Failures vs Sabisell Order"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover rounded-xl shadow-xs group-hover:scale-[1.02] transition-transform duration-300"
              />
            </div>

            <div className="lg:col-span-5 order-3 lg:order-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4.5 rounded-2xl border border-ash-200 bg-ash-fb/30 space-y-2">
                <div className="text-red-500 font-bold text-base">01</div>
                <h4 className="text-xs font-semibold text-ash-900">Math Mistakes Eat Profit</h4>
                <p className="text-[11px] text-ash-500 leading-normal">
                  Writing lists and adding numbers in a hurry leads to bad addition.
                </p>
              </div>
              <div className="p-4.5 rounded-2xl border border-ash-200 bg-ash-fb/30 space-y-2">
                <div className="text-red-500 font-bold text-base">02</div>
                <h4 className="text-xs font-semibold text-ash-900">Lost and Damaged Books</h4>
                <p className="text-[11px] text-ash-500 leading-normal">
                  If the notebook gets wet, stained with oil, or lost, customer debt records disappear.
                </p>
              </div>
              <div className="p-4.5 rounded-2xl border border-ash-200 bg-ash-fb/30 space-y-2">
                <div className="text-red-500 font-bold text-base">03</div>
                <h4 className="text-xs font-semibold text-ash-900">Forgetful Customers</h4>
                <p className="text-[11px] text-ash-500 leading-normal">
                  Honest people genuinely forget they owe you credit balance. Keeping it in your head is too exhausting.
                </p>
              </div>
              <div className="p-4.5 rounded-2xl border border-ash-200 bg-ash-fb/30 space-y-2">
                <div className="text-red-500 font-bold text-base">04</div>
                <h4 className="text-xs font-semibold text-ash-900">No Idea of Shop Progress</h4>
                <p className="text-[11px] text-ash-500 leading-normal">
                  Without summing daily income, you can't tell if your shop is making steady progress.
                </p>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-4 order-1 lg:order-3">
              <span className="text-[10px] font-semibold text-mint-600 tracking-wider uppercase bg-mint-50 px-2.5 py-1 rounded-full">WHY DO YOU NEED IT?</span>
              <h2 className="text-2xl sm:text-3xl font-display font-light text-ash-950 tracking-tight leading-tight max-w-[50vw] sm:max-w-none">
                Stop Doing Things <span className="font-semibold text-red-500">The Hard Way</span>
              </h2>
              <p className="text-xs sm:text-sm text-ash-500 leading-relaxed font-light">
                Running a business is already hard work. You shouldn't spend your evenings stressing over bookkeeping mistakes. Sabisell solves the 4 biggest merchant headaches automatically.
              </p>
            </div>
          </div>

          <hr className="border-ash-200/40" />

          {/* 3. HOW IT WORKS */}
          <div className="space-y-10">
            <div className="text-left space-y-3.5 max-w-2xl">
              <span className="text-[10px] font-semibold text-mint-600 tracking-wider uppercase bg-mint-50 px-2.5 py-1 rounded-full">HOW DOES IT WORK?</span>
              <h2 className="text-2xl sm:text-3xl font-display font-light text-ash-950 tracking-tight leading-tight pt-1 max-w-[50vw] sm:max-w-none">
                From Sign-Up to Sales in <span className="font-semibold text-mint-500">3 Warm Steps</span>
              </h2>
              <p className="text-xs sm:text-sm text-ash-500 leading-relaxed font-light">
                We designed Sabisell to be incredibly fast. Here is how you use it every day:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6.5">
              <div className="bg-ash-fb/40 p-6 rounded-2xl border border-ash-200 relative group hover:border-mint-200 transition-all">
                <div className="w-9 h-9 bg-mint-450 text-white font-bold rounded-xl flex items-center justify-center text-sm shadow-xs mb-4">
                  1
                </div>
                <h3 className="text-sm font-semibold text-ash-900 mb-2">Create Your Account</h3>
                <p className="text-xs text-ash-550 leading-relaxed">
                  Open the app and register your store in under a minute. You can start testing for free immediately using our default cloud settings, or connect your own secure keys.
                </p>
              </div>

              <div className="bg-ash-fb/40 p-6 rounded-2xl border border-ash-200 relative group hover:border-mint-200 transition-all">
                <div className="w-9 h-9 bg-mint-450 text-white font-bold rounded-xl flex items-center justify-center text-sm shadow-xs mb-4">
                  2
                </div>
                <h3 className="text-sm font-semibold text-ash-900 mb-2">List Your Items</h3>
                <p className="text-xs text-ash-550 leading-relaxed">
                  Type in your products and how many units you have. Put the purchase price and your selling price. Don't worry—your buying costs are completely private and only seen by you!
                </p>
              </div>

              <div className="bg-ash-fb/40 p-6 rounded-2xl border border-ash-200 relative group hover:border-mint-200 transition-all">
                <div className="w-9 h-9 bg-mint-450 text-white font-bold rounded-xl flex items-center justify-center text-sm shadow-xs mb-4">
                  3
                </div>
                <h3 className="text-sm font-semibold text-ash-900 mb-2">Record & Remind</h3>
                <p className="text-xs text-ash-550 leading-relaxed">
                  When a customer makes a purchase, click "Record Sale". If they haven't paid in full, Sabisell prepares a polite WhatsApp reminder card, ready to send with their exact outstanding balance.
                </p>
              </div>
            </div>
          </div>

          <hr className="border-ash-200/40" />

          {/* 4. CHERISHED FEATURES WITH IMAGE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-4 space-y-6">
              <div className="space-y-3">
                <span className="text-[10px] font-semibold text-mint-600 tracking-wider uppercase bg-mint-50 px-2.5 py-1 rounded-full">FEATURES YOU'LL ENJOY</span>
                <h2 className="text-2xl sm:text-3xl font-display font-light text-ash-950 tracking-tight leading-tight max-w-[50vw] sm:max-w-none">
                  Built to Save You <span className="font-semibold text-mint-500">Time and Energy</span>
                </h2>
                <p className="text-xs sm:text-sm text-ash-500 font-light leading-relaxed">
                  These four smart business tools will completely change the way you run your retail business.
                </p>
              </div>
              <div className="relative group overflow-hidden rounded-2xl border border-ash-200 bg-ash-fb/30 flex items-center justify-center p-3 shadow-xs">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" 
                  alt="Sabisell Smart Features Mockup"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover rounded-xl shadow-xs group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-ash-fb/20 p-5 rounded-2xl border border-ash-200 flex flex-col justify-between hover:border-mint-200 transition-all">
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-mint-50 text-mint-600 flex items-center justify-center">
                    <Mic className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-xs font-semibold text-ash-900">Vocal Commerce Log</h3>
                  <p className="text-[11px] text-ash-500 leading-normal">
                    Tired of typing on small keyboards? Just tap the microphone button, tell the app what you sold in plain English, and see the system log your transaction instantly.
                  </p>
                </div>
                <span className="text-[10px] text-mint-600 font-mono mt-4 block">"🎙️ Sold 2 crates of mineral"</span>
              </div>

              <div className="bg-ash-fb/20 p-5 rounded-2xl border border-ash-200 flex flex-col justify-between hover:border-mint-200 transition-all">
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-mint-50 text-mint-600 flex items-center justify-center">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-xs font-semibold text-ash-900">Swift Stock Track</h3>
                  <p className="text-[11px] text-ash-500 leading-normal">
                    Never run dry or get caught off guard. Always know when a product's stock drops under 3 items, with distinct visual tags warning you to top up before it sells out.
                  </p>
                </div>
                <span className="text-[10px] text-red-500 font-semibold mt-4 block">⚠️ Urgent low-stock warnings</span>
              </div>

              <div className="bg-ash-fb/20 p-5 rounded-2xl border border-ash-200 flex flex-col justify-between hover:border-mint-200 transition-all">
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-mint-50 text-mint-600 flex items-center justify-center">
                    <MessageSquare className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-xs font-semibold text-ash-900">Polite Debts Recovery</h3>
                  <p className="text-[11px] text-ash-500 leading-normal">
                    No awkward phone calls chasing debts. Tap any customer's name to generate a polite, custom WhatsApp statement showing what they bought and what is owed.
                  </p>
                </div>
                <span className="text-[10px] text-ash-400 mt-4 block">✓ Direct one-tap messaging</span>
              </div>

              <div className="bg-ash-fb/20 p-5 rounded-2xl border border-ash-200 flex flex-col justify-between hover:border-mint-200 transition-all">
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-mint-50 text-mint-600 flex items-center justify-center">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-xs font-semibold text-ash-900">Secure Backup Safeguard</h3>
                  <p className="text-[11px] text-ash-550 leading-normal">
                    Everything you record is safely secured inside Appwrite's cloud server. If your device breaks or gets lost, just sign back in and your records are intact.
                  </p>
                </div>
                <span className="text-[10px] text-mint-600 mt-4 block">✓ Secured document partitions</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: OLD BOOK FAILURES VS MODERN SABISELL LEDGER */}
      <section id="pain-points" className="py-20 px-6 border-y border-ash-200/60 bg-white">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-left space-y-3.5 max-w-2xl">
            <span className="text-[10px] font-semibold text-mint-600 tracking-wider uppercase bg-mint-50 px-2.5 py-1 rounded-full">THE MODERN ADVANTAGE</span>
            <h2 className="text-2xl sm:text-3xl font-display font-light text-ash-950 tracking-tight leading-tight pt-1 max-w-[50vw] sm:max-w-none">
              Why Paper Ledger Books are Ruining Your Cashflow
            </h2>
            <p className="text-xs sm:text-sm text-ash-500 leading-relaxed font-light">
              Paper books can catch fire, get wet, or get lost in the shop. Take absolute command of your money.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {/* The Old Way */}
            <div className="bg-red-50/50 border border-red-200/60 p-6 sm:p-8 rounded-3xl space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="text-base font-medium text-ash-900">The Traditional Paper Notebook</h3>
              </div>
              <ul className="space-y-3 text-xs text-ash-650 leading-relaxed pl-1">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-semibold mt-0.5">✕</span>
                  <span>Missing customer sheets make tracking unpaid balances a daily headache.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-semibold mt-0.5">✕</span>
                  <span>Water spillages, grease marks, or insect damage can destroy entire records forever.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-semibold mt-0.5">✕</span>
                  <span>No auto-calculations: manual arithmetic causes costly arithmetic errors.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-semibold mt-0.5">✕</span>
                  <span>Awkward debt collection chases without clear documentation or pre-drafted texts.</span>
                </li>
              </ul>
            </div>

            {/* The Sabisell Way */}
            <div className="bg-mint-50/40 border border-mint-200/70 p-6 sm:p-8 rounded-3xl space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-mint-100 rounded-xl flex items-center justify-center text-mint-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-medium text-ash-900">Sabisell Secured Ledger</h3>
              </div>
              <ul className="space-y-3 text-xs text-ash-650 leading-relaxed pl-1">
                <li className="flex items-start gap-2">
                  <span className="text-mint-500 font-semibold mt-0.5">✓</span>
                  <span>Cloud Storage backing up database tables instantly using secure Appwrite.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-mint-500 font-semibold mt-0.5">✓</span>
                  <span>Continuous system auto-saves: access your trade logs from any device or telephone.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-mint-500 font-semibold mt-0.5">✓</span>
                  <span>Zero-error ledger calculations showing precise sales revenues & profit lines.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-mint-500 font-semibold mt-0.5">✓</span>
                  <span>Send direct WhatsApp invoices and reminder messages in a single tap.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURE BENTO SHOWCASE */}
      <section id="features" className="py-20 px-6 bg-ash-50">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-left space-y-3.5 max-w-2xl">
            <span className="text-[10px] font-semibold text-mint-600 tracking-wider uppercase bg-mint-50 px-2.5 py-1 rounded-full">CORE UTILITY</span>
            <h2 className="text-2xl sm:text-3xl font-display font-light text-ash-950 tracking-tight leading-tight pt-1 max-w-[50vw] sm:max-w-none">
              A Complete Command Center for SME Sales
            </h2>
            <p className="text-xs sm:text-sm text-ash-500 leading-relaxed font-light">
              Clean interfaces built to manage physical items, sales logs, client list logs, and vocal queries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento Box 1: Stock Counter */}
            <div className="bg-white p-6 rounded-3xl border border-ash-200 shadow-3xs flex flex-col justify-between hover:border-mint-200 transition-all">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-lg bg-mint-50 text-mint-600 flex items-center justify-center">
                  <Zap className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-medium text-ash-900">Swift Stock Track</h3>
                <p className="text-xs text-ash-500 leading-relaxed">
                  Avoid out-of-stock scenarios. Set buying prices, selling margins, and monitor low levels instantly with intuitive tables.
                </p>
              </div>
              <div className="h-2 bg-ash-100 rounded-full mt-6 overflow-hidden">
                <div className="w-4/5 h-full bg-mint-400 rounded-full"></div>
              </div>
            </div>

            {/* Bento Box 2: Voice Dictation */}
            <div className="bg-white p-6 rounded-3xl border border-ash-200 shadow-3xs flex flex-col justify-between hover:border-mint-200 transition-all">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-lg bg-mint-50 text-mint-600 flex items-center justify-center">
                  <Mic className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-medium text-ash-900">Vocal Commerce Log</h3>
                <p className="text-xs text-ash-500 leading-relaxed">
                  Wary of typing during a busy market day? Just hold the voice button, speak in Pidgin or English, and watch Sabisell index your sales records.
                </p>
              </div>
              <span className="text-[10px] text-mint-650 font-mono mt-6">🎙️ Speak "Sell 2 Indomie to Chidi"</span>
            </div>

            {/* Bento Box 3: WhatsApp Dispatch */}
            <div className="bg-white p-6 rounded-3xl border border-ash-200 shadow-3xs flex flex-col justify-between hover:border-mint-200 transition-all">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-lg bg-mint-50 text-mint-600 flex items-center justify-center">
                  <MessageSquare className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-medium text-ash-900">WhatsApp Ledger Invoicing</h3>
                <p className="text-xs text-ash-500 leading-relaxed">
                  Draft invoice letters with custom greetings, item logs, calculated totals, and balance debt statements ready to wire.
                </p>
              </div>
              <span className="text-[10px] text-ash-400 block mt-6">✓ Interactive Link Integration</span>
            </div>

            {/* Bento Box 4: Multi-User Cloud Architecture */}
            <div className="bg-white p-6 rounded-3xl border border-ash-200 shadow-3xs md:col-span-2 flex flex-col justify-between hover:border-mint-200 transition-all">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-mint-50 text-mint-600 flex items-center justify-center">
                    <Database className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-[10px] bg-mint-55 text-mint-700 font-semibold px-2 py-0.5 rounded-md">POWERED BY APPWRITE</span>
                </div>
                <h3 className="text-sm font-medium text-ash-900">Secure Database Isolation</h3>
                <p className="text-xs text-ash-550 leading-relaxed">
                  No overlapping transactions or shared data visibility. Your store's profiles, product records, client tabs, and cash inflow are completely isolated inside your private Appwrite space with strict secure key controls.
                </p>
              </div>
              <div className="flex gap-4 items-center mt-6 text-[10.5px] text-ash-400 font-mono border-t border-ash-100 pt-3">
                <span>✓ Isolated rows per userID</span>
                <span>✓ Appwrite Cloud Backup</span>
                <span>✓ Offline Local Caching</span>
              </div>
            </div>

            {/* Bento Box 5: Direct Remittance SMS */}
            <div className="bg-white p-6 rounded-3xl border border-ash-200 shadow-3xs flex flex-col justify-between hover:border-mint-200 transition-all">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-lg bg-mint-50 text-mint-600 flex items-center justify-center">
                  <Globe className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-medium text-ash-900">Alert Settlement Parsing</h3>
                <p className="text-xs text-ash-500 leading-relaxed">
                  Paste incoming standard bank credit alerts. Sabisell reads the SMS copy and automatically matches payments with current outstanding debts.
                </p>
              </div>
              <span className="text-[9px] bg-ash-100/50 p-1 border rounded text-ash-600 block truncate mt-6">"Cr. ₦20,000 Acct: ****"</span>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4: INTERACTIVE INVOICE AND DEBT DRAFT SIMULATOR */}
      <section id="simulator" className="py-20 px-6 bg-white border-y border-ash-200/60">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-left space-y-3.5 max-w-2xl">
            <span className="text-[10px] font-semibold text-mint-600 tracking-wider uppercase bg-mint-50 px-2.5 py-1 rounded-full">LIVE DEMONSTRATION</span>
            <h2 className="text-2xl sm:text-3xl font-display font-light text-ash-950 tracking-tight leading-tight pt-1 max-w-[50vw] sm:max-w-none">
              Test Sabisell Invoice Generator Instantly
            </h2>
            <p className="text-xs sm:text-sm text-ash-500 leading-relaxed font-light">
              Fill the mini form below. We will immediately draft the message template you would send to your customer's handset.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-4">
            
            {/* Input Column */}
            <div className="md:col-span-5 bg-ash-50 border border-ash-200 p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-semibold text-ash-900 uppercase tracking-wider block border-b border-ash-200 pb-2">Simulator Variables</h3>
              
              <div className="space-y-1">
                <label className="text-[10.5px] font-medium text-ash-650 block">Customer Name</label>
                <input 
                  type="text" 
                  value={simName} 
                  onChange={(e) => setSimName(e.target.value)}
                  placeholder="e.g. Alao Ibrahim" 
                  className="w-full bg-white border border-ash-200 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:border-mint-450 font-normal shadow-3xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] font-medium text-ash-650 block">Items Sold</label>
                <input 
                  type="text" 
                  value={simItem} 
                  onChange={(e) => setSimItem(e.target.value)}
                  placeholder="e.g. 5 Cartons of milk" 
                  className="w-full bg-white border border-ash-200 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:border-mint-450 font-normal shadow-3xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10.5px] font-medium text-ash-650 block">Total cost (₦)</label>
                  <input 
                    type="number" 
                    value={simTotal} 
                    onChange={(e) => setSimTotal(Number(e.target.value))}
                    className="w-full bg-white border border-ash-200 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:border-mint-450 font-normal shadow-3xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10.5px] font-medium text-ash-650 block">Paid (₦)</label>
                  <input 
                    type="number" 
                    value={simPaid} 
                    onChange={(e) => setSimPaid(Number(e.target.value))}
                    className="w-full bg-white border border-ash-200 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:border-mint-450 font-normal shadow-3xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center text-[10.5px] text-ash-500 font-mono">
                  <span>Balance Debt:</span>
                  <span className={`font-semibold ${simDebt > 0 ? 'text-red-600' : 'text-mint-600'}`}>
                    ₦{simDebt.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Generated WhatsApp Box Column */}
            <div className="md:col-span-7 space-y-3">
              <div className="bg-ash-950 p-4 rounded-t-2xl flex items-center justify-between text-white text-xs border-b border-ash-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-mint-400"></span>
                  <p className="font-mono text-[10.5px] text-ash-300">WhatsApp Notification Preview</p>
                </div>
                <button 
                  onClick={copyMessage}
                  className="bg-white/10 hover:bg-white/20 text-white text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all border border-white/10"
                >
                  {copied ? <Check className="h-3 w-3 text-mint-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? 'Copied Text!' : 'Copy Code'}</span>
                </button>
              </div>
              <div className="bg-ash-950 rounded-b-2xl p-5 text-ash-250 font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap shadow-inner min-h-[160px] border border-t-0 border-ash-850">
                {invoiceMessage}
              </div>
              <p className="text-[10px] text-ash-400 leading-normal pl-1">
                ℹ️ **WhatsApp API Bridge:** When using the actual Sabisell App inside your browser dashboard, clicking any generated ticket instantly routes the text directly to the customer's phone number number inside the WhatsApp application!
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 5: DIRECT ACTION STEP TIMELINE */}
      <section id="how-it-works" className="py-20 px-6 bg-ash-50">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-left space-y-3.5 max-w-2xl">
            <span className="text-[10px] font-semibold text-mint-600 tracking-wider uppercase bg-mint-50 px-2.5 py-1 rounded-full">TIMELINE FLOW</span>
            <h2 className="text-2xl sm:text-3xl font-display font-light text-ash-950 tracking-tight leading-tight pt-1 max-w-[50vw] sm:max-w-none">
              Get Started with Sabisell in 3 Simple Steps
            </h2>
            <p className="text-xs sm:text-sm text-ash-500 leading-relaxed font-light">
              Follow these standard milestones to start recording transactions in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-3xl border border-ash-200/80 relative space-y-4">
              <div className="absolute top-4 right-4 text-3xl font-display font-light text-ash-100">01</div>
              <div className="w-9 h-9 bg-mint-50 text-mint-600 rounded-xl flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-sm font-medium text-ash-900">Configure Onboarding Portal</h3>
              <p className="text-xs text-ash-550 leading-relaxed">
                Connect your unique Appwrite keys or make use of our default sandbox server options. Register with your trade email in seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-3xl border border-ash-200/80 relative space-y-4">
              <div className="absolute top-4 right-4 text-3xl font-display font-light text-ash-100">02</div>
              <div className="w-9 h-9 bg-mint-50 text-mint-600 rounded-xl flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-sm font-medium text-ash-900">Catalog Your Trade Items</h3>
              <p className="text-xs text-ash-550 leading-relaxed">
                Record the items in your shelf. Put their purchase cost prices and your normal marketplace tag prices.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-3xl border border-ash-200/80 relative space-y-4">
              <div className="absolute top-4 right-4 text-3xl font-display font-light text-ash-100">03</div>
              <div className="w-9 h-9 bg-mint-50 text-mint-600 rounded-xl flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-sm font-medium text-ash-900">Record Sales & Push Texts</h3>
              <p className="text-xs text-ash-550 leading-relaxed">
                Log a trade transaction. If there's any outstanding balance, click the invoice card to notify the client on WhatsApp.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 6: VERIFIED GLOBAL MERCHANT TESTIMONIAL GRID */}
      <section id="testimonials" className="py-20 px-6 bg-white border-y border-ash-200/60">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-left space-y-3.5 max-w-2xl">
            <span className="text-[10px] font-semibold text-mint-600 tracking-wider uppercase bg-mint-50 px-2.5 py-1 rounded-full">REAL WORLD TRUST</span>
            <h2 className="text-2xl sm:text-3xl font-display font-light text-ash-950 tracking-tight leading-tight pt-1 max-w-[50vw] sm:max-w-none">
              Loved by Sellers <span className="font-semibold text-mint-500 font-sans">Around the Globe</span>
            </h2>
            <p className="text-xs sm:text-sm text-ash-500 leading-relaxed font-light">
              Read how store owners and online sellers across different countries safeguard their daily cashflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1 - Nigeria */}
            <div className="bg-ash-50/55 p-6 rounded-3xl border border-ash-200 hover:border-mint-200 transition-colors">
              <div className="flex items-center gap-1 text-yellow-400 mb-3.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
              </div>
              <p className="text-xs text-ash-650 italic leading-relaxed mb-6 font-light">
                "Since I started using Sabisell to track foodstuffs in Balogun market, I no longer lose money on paper calculations. My debts are recorded automatically, and customer reminders go straight to their phone."
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-mint-405 text-white font-semibold flex items-center justify-center text-xs">
                  MN
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-ash-900">Malaika Nnewi</h4>
                  <p className="text-[10px] text-ash-400">Foodstuffs Retailer, Lagos 🇳🇬</p>
                </div>
              </div>
            </div>

            {/* Card 2 - Ghana */}
            <div className="bg-ash-50/55 p-6 rounded-3xl border border-ash-200 hover:border-mint-200 transition-colors">
              <div className="flex items-center gap-1 text-yellow-400 mb-3.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
              </div>
              <p className="text-xs text-ash-650 italic leading-relaxed mb-6 font-light">
                "This tool makes debt collection very comfortable. I just tap Kofi's name in my registry, and Sabisell drafts the exact invoice balance message in clean English. Sending it on WhatsApp is so quiet and polite!"
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-mint-405 text-white font-semibold flex items-center justify-center text-xs">
                  KM
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-ash-900">Kofi Mensah</h4>
                  <p className="text-[10px] text-ash-400">Clothing Boutique, Accra 🇬🇭</p>
                </div>
              </div>
            </div>

            {/* Card 3 - Kenya */}
            <div className="bg-ash-50/55 p-6 rounded-3xl border border-ash-200 hover:border-mint-200 transition-colors">
              <div className="flex items-center gap-1 text-yellow-400 mb-3.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
              </div>
              <p className="text-xs text-ash-650 italic leading-relaxed mb-6 font-light">
                "The stock notification system is fantastic. When my bags of maize fall below 3, a red alert flashes on my screen. I can order more stock before the shelf runs completely dry."
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-mint-405 text-white font-semibold flex items-center justify-center text-xs">
                  AK
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-ash-900">Amina Kiprop</h4>
                  <p className="text-[10px] text-ash-400">Wholesale Grocer, Nairobi 🇰🇪</p>
                </div>
              </div>
            </div>

            {/* Card 4 - South Africa */}
            <div className="bg-ash-50/55 p-6 rounded-3xl border border-ash-200 hover:border-mint-200 transition-colors">
              <div className="flex items-center gap-1 text-yellow-400 mb-3.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
              </div>
              <p className="text-xs text-ash-650 italic leading-relaxed mb-6 font-light">
                "Appwrite cloud backup is super secure. My smartphone fell in town last week, but none of my shop books were lost! I logged back in on my home computer and all my client sales loaded instantly."
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-mint-405 text-white font-semibold flex items-center justify-center text-xs">
                  LD
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-ash-900">Lerato Dube</h4>
                  <p className="text-[10px] text-ash-400">Hardware Accessories, Johannesburg 🇿🇦</p>
                </div>
              </div>
            </div>

            {/* Card 5 - United Kingdom */}
            <div className="bg-ash-50/55 p-6 rounded-3xl border border-ash-200 hover:border-mint-200 transition-colors">
              <div className="flex items-center gap-1 text-yellow-400 mb-3.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
              </div>
              <p className="text-xs text-ash-650 italic leading-relaxed mb-6 font-light">
                "Sabisell is incredibly fast and intuitive. I run an organic farm shop and usually hate complex accounting apps. This is the first app I have ever used that feels simple, light, and focused."
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-mint-405 text-white font-semibold flex items-center justify-center text-xs">
                  JH
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-ash-900">John Henderson</h4>
                  <p className="text-[10px] text-ash-400">Organic Farm Store, Birmingham 🇬🇧</p>
                </div>
              </div>
            </div>

            {/* Card 6 - United States */}
            <div className="bg-ash-50/55 p-6 rounded-3xl border border-ash-200 hover:border-mint-200 transition-colors">
              <div className="flex items-center gap-1 text-yellow-400 mb-3.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
              </div>
              <p className="text-xs text-ash-650 italic leading-relaxed mb-6 font-light">
                "I make handmade jewelry and sell to customers across social media. Sabisell makes tracking my inventory, calculate custom margins, and managing part-payments effortless and extremely organized."
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-mint-405 text-white font-semibold flex items-center justify-center text-xs">
                  SJ
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-ash-900">Sarah Jenkins</h4>
                  <p className="text-[10px] text-ash-400">Artisan Crafts Seller, Dallas 🇺🇸</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 7: BULLETPROOF DATABASE & CLOUD SECURITY ARCHITECTURE */}
      <section id="security" className="py-20 px-6 bg-ash-50">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-left space-y-3.5 max-w-2xl">
            <span className="text-[10px] font-semibold text-mint-600 tracking-wider uppercase bg-mint-50 px-2.5 py-1 rounded-full">TECHNICAL FORTRESS</span>
            <h2 className="text-2xl sm:text-3xl font-display font-light text-ash-950 tracking-tight leading-tight pt-1 max-w-[50vw] sm:max-w-none">
              Enterprise Grade Protection for SME Data
            </h2>
            <p className="text-xs sm:text-sm text-ash-500 leading-relaxed font-light">
              Sabisell leverages standardized encryption and isolated tenant rows.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative group overflow-hidden rounded-2xl border border-ash-200 bg-white flex items-center justify-center p-6 shadow-xs">
              <img 
                src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80" 
                alt="Sabisell High-Fidelity Cyber Security Protocol"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover rounded-xl shadow-xs group-hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
            
            <div className="flex flex-col gap-6">
              {/* Protocol 1 */}
              <div className="bg-white p-5 rounded-2xl border border-ash-200 space-y-2.5 shadow-3xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-mint-50 text-mint-600 flex items-center justify-center shrink-0">
                    <Lock className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-semibold text-ash-900">User Data Enclaves</h3>
                </div>
                <p className="text-[11px] text-ash-500 leading-relaxed pl-11">
                  Appwrite's user document partitions guarantee that database indexes are tightly bound to user IDs. Nobody else sees your ledger rows.
                </p>
              </div>

              {/* Protocol 2 */}
              <div className="bg-white p-5 rounded-2xl border border-ash-200 space-y-2.5 shadow-3xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-mint-50 text-mint-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-semibold text-ash-900">Strict Auth Protocol</h3>
                </div>
                <p className="text-[11px] text-ash-500 leading-relaxed pl-11">
                  All platform write queries pass through Appwrite Auth gateways. Password strings are encrypted with advanced argon2 hash salts on server files.
                </p>
              </div>

              {/* Protocol 3 */}
              <div className="bg-white p-5 rounded-2xl border border-ash-200 space-y-2.5 shadow-3xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-mint-50 text-mint-600 flex items-center justify-center shrink-0">
                    <Globe className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-semibold text-ash-900">Auto Backups</h3>
                </div>
                <p className="text-[11px] text-ash-500 leading-relaxed pl-11">
                  Database registers are constantly cached and backed up in real-time. If you damage your device, logging back in instantly recovers everything.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: ONBOARDING CALL TO ACTION (CTA) & DYNAMIC FOOTER CARD */}
      <section className="py-20 px-6 bg-white border-t border-ash-200/60">
        <div className="max-w-4xl mx-auto space-y-16">
          
          {/* Main CTA Card */}
          <div className="bg-white dark:bg-ash-950 rounded-[2.5rem] p-8 sm:p-14 md:p-16 text-left text-ash-950 dark:text-white relative overflow-hidden shadow-2xl border border-ash-200 dark:border-ash-800">
            {/* Ambient Background glows */}
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#1e293b_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-25"></div>
            <div className="absolute -top-12 -right-12 w-72 h-72 bg-mint-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-7">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-ash-50 dark:bg-ash-900 border border-ash-150 dark:border-ash-800 rounded-full text-[10px] sm:text-xs text-mint-600 dark:text-mint-300 font-semibold shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-mint-400 animate-pulse"></span>
                  <span>NO CREDIT CARD • INSTANT CLOUD ACCESS</span>
                </div>
                
                <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-display font-light text-ash-950 dark:text-white tracking-tight leading-[1.12] max-w-[50vw] sm:max-w-none">
                  Settle outstanding debits. <br />
                  <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-mint-500 via-mint-400 to-emerald-400 dark:from-mint-300 dark:via-mint-400 dark:to-emerald-400 font-sans">Control your shelves like a Pro.</span>
                </h2>
                
                <p className="text-xs sm:text-sm text-ash-500 dark:text-ash-400 leading-relaxed font-light">
                  Join thousands of modern merchants recording their daily shop books inside the cloud. Try the pidgin-enabled web ledger program today.
                </p>

                {/* SME Value Proposition bullets */}
                <ul className="space-y-3.5 text-xs text-ash-600 dark:text-ash-300 pl-0.5 pt-1">
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-mint-50 dark:bg-mint-950 border border-mint-250 dark:border-mint-500/30 text-mint-600 dark:text-mint-400 rounded-lg flex items-center justify-center shrink-0">
                      ✓
                    </div>
                    <span><strong>Zero Setup Fees</strong> &mdash; Create items and start logging in under 45 seconds</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-mint-50 dark:bg-mint-950 border border-mint-250 dark:border-mint-500/30 text-mint-600 dark:text-mint-400 rounded-lg flex items-center justify-center shrink-0">
                      ✓
                    </div>
                    <span><strong>100% Data Protection</strong> &mdash; Isolated secure keys keep your customer tabs private</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-mint-50 dark:bg-mint-950 border border-mint-250 dark:border-mint-500/30 text-mint-600 dark:text-mint-400 rounded-lg flex items-center justify-center shrink-0">
                      ✓
                    </div>
                    <span><strong>Auto SMS Generation</strong> &mdash; Friendly WhatsApp reminder letters in a single click</span>
                  </li>
                </ul>
                
                <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <button 
                    id="bottom-get-started-btn"
                    onClick={onEnterApp}
                    className="bg-mint-400 hover:bg-mint-500 text-white text-xs sm:text-sm font-semibold py-4 px-9 rounded-2xl shadow-xl hover:shadow-mint-500/10 cursor-pointer transition-all hover:scale-102 active:scale-98 flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <span>Launch Free App</span>
                    <ArrowRight className="h-4 w-4 text-white" />
                  </button>
                  <span className="text-[10px] text-ash-400 dark:text-ash-450 font-sans text-center sm:text-left leading-tight py-1">
                    ⚡ 15.2k+ active partners today &bull; Appwrite cloud verified
                  </span>
                </div>
              </div>

              {/* High-fidelity Mockup with floating browser bar */}
              <div className="lg:col-span-5 relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-mint-500 via-emerald-500 to-pink-500 rounded-3xl opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
                <div className="relative rounded-2xl border border-ash-200 dark:border-ash-800 bg-ash-50/50 dark:bg-ash-900/40 p-2 sm:p-3 backdrop-blur-md shadow-2xl">
                  {/* Miniature window decoration */}
                  <div className="flex items-center gap-1.5 pb-2.5 px-1 border-b border-ash-150 dark:border-ash-800/60 mb-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 opacity-60"></span>
                    <span className="w-2 h-2 rounded-full bg-yellow-400 opacity-60"></span>
                    <span className="w-2 h-2 rounded-full bg-mint-400 opacity-60"></span>
                  </div>
                  <img 
                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80" 
                    alt="Sabisell SME Command Center Mockup"
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-cover rounded-xl shadow-xs group-hover:scale-[1.015] transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Area with links & copyright */}
          <div className="pt-12 border-t border-ash-150 space-y-8 text-[11px] text-ash-400">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-ash-950 font-sans uppercase tracking-wider">Product Sitemaps</h4>
                <ul className="space-y-2">
                  <li><a href="#landing-container" className="hover:text-mint-600 transition-colors">Hero Overview</a></li>
                  <li><a href="#how-it-works" className="hover:text-mint-600 transition-colors">Market Flow</a></li>
                  <li><a href="#features" className="hover:text-mint-600 transition-colors">Ledger Attributes</a></li>
                  <li><a href="#simulator" className="hover:text-mint-600 transition-colors">Test Simulator</a></li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-ash-950 font-sans uppercase tracking-wider">Appwrite SDKs</h4>
                <ul className="space-y-2">
                  <li><span className="text-ash-400 block font-light font-mono">Appwrite Client Auth</span></li>
                  <li><span className="text-ash-400 block font-light font-mono">Isolated DB Collection</span></li>
                  <li><span className="text-ash-400 block font-light font-mono">Real-time DB Channels</span></li>
                  <li><span className="text-ash-400 block font-light font-mono">TLS Encryption Keys</span></li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-ash-950 font-sans uppercase tracking-wider">Legals & Disclosures</h4>
                <ul className="space-y-2">
                  <li><span className="hover:text-mint-610 cursor-pointer block">Terms of Service</span></li>
                  <li><span className="hover:text-mint-610 cursor-pointer block">Privacy Policy</span></li>
                  <li><span className="hover:text-mint-610 cursor-pointer block">Merchant Code of Conduct</span></li>
                  <li><span className="hover:text-mint-610 cursor-pointer block">NDPR Data Compliance</span></li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-ash-950 font-sans uppercase tracking-wider">Nigeria Retail Hub</h4>
                <p className="text-xs font-light leading-relaxed text-ash-500 font-sans">
                  Sabisell Technologies Ltd.<br />
                  Balogun SME Circle, Lagos.<br />
                  Email: help@sabisell.com
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-ash-100 flex flex-col sm:flex-row items-center justify-between text-center gap-4 text-ash-450">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-mint-400 rounded-md flex items-center justify-center text-white scale-90">
                  <SabisellLogo className="h-3 w-3 text-white" />
                </div>
                <span className="font-sans font-normal text-[11px] text-ash-800">Sabisell Ledger Terminal &copy; 2026</span>
              </div>
              <p className="font-light font-sans text-[10px]">
                Made with passion for Nigerian retail store operators. Appwrite deployment verified.
              </p>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
