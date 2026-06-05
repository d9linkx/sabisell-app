import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SabisellLogo } from './SabisellLogo';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  Award,
  BookOpen,
  Sparkles,
  Loader2,
  AlertCircle,
  Receipt,
  Plus,
  Trash,
  ChevronDown,
  Filter,
  Calendar,
  RotateCcw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Product, Sale, Expense, BusinessProfile, isOrganizationCategory } from '../types';
import { CustomConfirmModal } from './Modal';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  expenses?: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id' | 'timestamp'>) => void;
  onDeleteExpense: (id: string) => void;
  onNavigate: (tab: string) => void;
  businessProfile?: BusinessProfile;
}

export default function Dashboard({ 
  products, 
  sales, 
  expenses = [], 
  onAddExpense, 
  onDeleteExpense, 
  onNavigate,
  businessProfile
}: DashboardProps) {
  const isOrg = businessProfile ? isOrganizationCategory(businessProfile.category) : false;
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportData, setReportData] = useState<any | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  // Custom Modal States
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMsg, setConfirmMsg] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  // Add Expense form States
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
  const [expDescription, setExpDescription] = useState('');
  const [expCategory, setExpCategory] = useState('Transport');
  const [expAmount, setExpAmount] = useState('');
  const [expProdId, setExpProdId] = useState('');

  // Filter States
  const [timeframe, setTimeframe] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [eventType, setEventType] = useState<'all' | 'sales' | 'expenses'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFiltersMenu, setShowFiltersMenu] = useState(false);
  
  // Custom dropdown states
  const [dropdownTimeframeOpen, setDropdownTimeframeOpen] = useState(false);
  const [dropdownEventTypeOpen, setDropdownEventTypeOpen] = useState(false);
  const [dropdownCategoryOpen, setDropdownCategoryOpen] = useState(false);
  const [dropdownExpCategoryOpen, setDropdownExpCategoryOpen] = useState(false);
  const [dropdownExpProdOpen, setDropdownExpProdOpen] = useState(false);

  // Dynamically extract categories from all products
  const productCategories = Array.from(new Set(products.map(p => p.category || 'General')));

  // Filter products by category if specified
  const filteredProducts = products.filter(p => {
    if (selectedCategory && selectedCategory !== 'all') {
      return (p.category || 'General').toLowerCase() === selectedCategory.toLowerCase();
    }
    return true;
  });

  // Filter sales
  const filteredSales = sales.filter(s => {
    // 1. Timeframe / Date cycle
    const saleDate = new Date(s.timestamp);
    const saleTime = saleDate.getTime();
    const now = new Date();

    if (timeframe === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const todayEnd = todayStart + 24 * 60 * 60 * 1000;
      if (saleTime < todayStart || saleTime >= todayEnd) return false;
    } else if (timeframe === 'week') {
      const oneWeekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      if (saleTime < oneWeekAgo) return false;
    } else if (timeframe === 'month') {
      const oneMonthAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
      if (saleTime < oneMonthAgo) return false;
    } else if (timeframe === 'custom') {
      if (startDate) {
        const start = new Date(startDate).getTime();
        if (saleTime < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000;
        if (saleTime >= end) return false;
      }
    }

    // 2. Type
    if (eventType === 'expenses') return false;

    // 3. Category matching
    if (selectedCategory && selectedCategory !== 'all') {
      const prod = products.find(p => p.id === s.productId || p.name === s.productName);
      const cat = prod ? (prod.category || 'General') : 'General';
      if (cat.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    }

    return true;
  });

  // Filter expenses
  const filteredExpenses = expenses.filter(e => {
    // 1. Timeframe / Date cycle
    const expDate = new Date(e.timestamp);
    const expTime = expDate.getTime();
    const now = new Date();

    if (timeframe === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const todayEnd = todayStart + 24 * 60 * 60 * 1000;
      if (expTime < todayStart || expTime >= todayEnd) return false;
    } else if (timeframe === 'week') {
      const oneWeekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      if (expTime < oneWeekAgo) return false;
    } else if (timeframe === 'month') {
      const oneMonthAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
      if (expTime < oneMonthAgo) return false;
    } else if (timeframe === 'custom') {
      if (startDate) {
        const start = new Date(startDate).getTime();
        if (expTime < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000;
        if (expTime >= end) return false;
      }
    }

    // 2. Type
    if (eventType === 'sales') return false;

    // 3. Category matching
    if (selectedCategory && selectedCategory !== 'all') {
      const expCatMatch = e.category.toLowerCase() === selectedCategory.toLowerCase();
      const prod = products.find(p => p.id === e.associatedProductId);
      const prodCatMatch = prod ? (prod.category || 'General').toLowerCase() === selectedCategory.toLowerCase() : false;
      if (!expCatMatch && !prodCatMatch) return false;
    }

    return true;
  });

  // Financial aggregates calculated on filtered elements!
  const totalSalesVal = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalReceivedVal = filteredSales.reduce((sum, s) => sum + s.amountPaid, 0);
  const totalDebtVal = filteredSales.reduce((sum, s) => sum + s.balanceDebt, 0);
  const totalInventoryCost = filteredProducts.reduce((sum, p) => sum + (p.costPrice * p.quantity), 0);
  const totalInventoryValue = filteredProducts.reduce((sum, p) => sum + (p.sellingPrice * p.quantity), 0);
  const expectedProfit = totalInventoryValue - totalInventoryCost;

  // Running Operational Expense & Business Capital Aggregates
  const totalExpensesVal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCapitalVal = totalInventoryCost + totalExpensesVal;

  // Accurate Profit & Loss Calculations (subtracting COGS and OPEX)
  const totalCostOfGoodsSold = filteredSales.reduce((sum, s) => {
    const prod = products.find(p => p.id === s.productId || p.name === s.productName);
    const itemCost = prod ? prod.costPrice : s.unitPrice * 0.7; // default to 20% to 30% standard margin
    return sum + (itemCost * s.quantity);
  }, 0);

  const netProfitVal = totalSalesVal - totalCostOfGoodsSold - totalExpensesVal;

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDescription || !expAmount) return;
    onAddExpense({
      description: expDescription.trim(),
      amount: Number(expAmount) || 0,
      category: expCategory,
      associatedProductId: expProdId || undefined
    });
    setExpDescription('');
    setExpCategory('Transport');
    setExpAmount('');
    setExpProdId('');
    setAddExpenseModalOpen(false);
  };

  // Group sales for charts (e.g. by date / day of week)
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const chartData = [
    { name: 'Mon', Sales: 0, Profit: 0 },
    { name: 'Tue', Sales: 0, Profit: 0 },
    { name: 'Wed', Sales: 0, Profit: 0 },
    { name: 'Thu', Sales: 0, Profit: 0 },
    { name: 'Fri', Sales: 0, Profit: 0 },
    { name: 'Sat', Sales: 0, Profit: 0 },
    { name: 'Sun', Sales: 0, Profit: 0 },
  ];

  filteredSales.forEach(sale => {
    try {
      const date = new Date(sale.timestamp);
      const dayIndex = date.getDay(); // 0-6 (Sun-Sat)
      const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // map Mon=0, Sun=6
      if (adjustedIndex >= 0 && adjustedIndex < 7) {
        chartData[adjustedIndex].Sales += sale.totalAmount;
        // Cost calculations:
        const prod = products.find(p => p.id === sale.productId || p.name === sale.productName);
        const cost = prod ? prod.costPrice * sale.quantity : sale.totalAmount * 0.8; // default to 20% margin
        chartData[adjustedIndex].Profit += (sale.totalAmount - cost);
      }
    } catch (e) {
      // safe fallback
    }
  });

  // Calculate top moving items based on filtered data
  const productSalesMap: { [key: string]: number } = {};
  filteredSales.forEach(s => {
    productSalesMap[s.productName] = (productSalesMap[s.productName] || 0) + s.quantity;
  });
  const sortedSales = Object.entries(productSalesMap).sort((a, b) => b[1] - a[1]);
  const primaryMovingProduct = sortedSales.length > 0 ? sortedSales[0][0] : 'None';

  // 1. Calculate category distribution for Pie Chart (Capital investment share per Category)
  const categoryStatsMap: { [key: string]: { value: number; count: number; cost: number } } = {};
  products.forEach(p => {
    const cat = p.category || 'Others';
    if (!categoryStatsMap[cat]) {
      categoryStatsMap[cat] = { value: 0, count: 0, cost: 0 };
    }
    categoryStatsMap[cat].value += p.sellingPrice * p.quantity;
    categoryStatsMap[cat].cost += p.costPrice * p.quantity;
    categoryStatsMap[cat].count += p.quantity;
  });

  const pieData = Object.entries(categoryStatsMap).map(([name, stats]) => ({
    name,
    value: stats.cost, // capital locked up in NGN Naira
    qty: stats.count,
    potentialRevenue: stats.value
  })).filter(d => d.value > 0);

  const defaultPieData = [
    { name: 'Provisions & FMCG', value: 145000, qty: 320, potentialRevenue: 195000 },
    { name: 'Drinks & Beverages', value: 85000, qty: 180, potentialRevenue: 125000 },
    { name: 'Building Materials', value: 310000, qty: 45, potentialRevenue: 390000 },
    { name: 'Fabrics & Clothes', value: 165000, qty: 35, potentialRevenue: 240000 },
    { name: 'Grains & Foodstuffs', value: 120000, qty: 110, potentialRevenue: 160000 }
  ];

  const activePieData = pieData.length > 0 ? pieData : defaultPieData;

  const PIE_COLORS = ['#10b981', '#0ea5e9', '#3b82f6', '#f59e0b', '#6366f1', '#8b5cf6', '#ec4899', '#64748b'];

  // 2. Calculate Top Stock Quantities in Shop Shelf (Bar Chart)
  const topProductsBarData = [...products]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map(p => ({
      name: p.name.length > 12 ? p.name.substring(0, 10) + '..' : p.name,
      fullName: p.name,
      'Stock Level (Units)': p.quantity,
      'Capital Value (₦)': p.costPrice * p.quantity
    }));

  const defaultBarData = [
    { name: 'Peak Milk Can', 'Stock Level (Units)': 120, 'Capital Value (₦)': 36000 },
    { name: 'Indomie Ctn', 'Stock Level (Units)': 85, 'Capital Value (₦)': 51000 },
    { name: 'Milo 500g', 'Stock Level (Units)': 65, 'Capital Value (₦)': 45000 },
    { name: 'Sardine Can', 'Stock Level (Units)': 55, 'Capital Value (₦)': 16500 },
    { name: 'Dangote Sugar', 'Stock Level (Units)': 40, 'Capital Value (₦)': 24000 }
  ];

  const activeBarData = topProductsBarData.length > 0 ? topProductsBarData : defaultBarData;

  // Calculate slow-moving inventory items with zero sales in the last 60 days
  const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;
  const slowMovingProducts = products.filter(p => {
    if (p.type === 'service' || p.quantity <= 0) return false;
    const hasSaleInLast60Days = sales.some(s => {
      const isProductMatch = s.productId === p.id || s.productName.toLowerCase() === p.name.toLowerCase();
      if (!isProductMatch) return false;
      const saleTime = new Date(s.timestamp).getTime();
      return saleTime > sixtyDaysAgo;
    });
    return !hasSaleInLast60Days;
  }).map(p => {
    const capitalLockedUp = p.costPrice * p.quantity;
    return { ...p, capitalLockedUp };
  }).sort((a, b) => b.capitalLockedUp - a.capitalLockedUp);

  const slowMovingAlertsToShow = slowMovingProducts.slice(0, 3);

  // Format currency helpers (Naira ₦)
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleGenerateReport = async () => {
    setLoadingReport(true);
    setReportError(null);
    try {
      const res = await fetch('/api/generate-weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventory: filteredProducts, sales: filteredSales, customerPayments: [] }),
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        throw new Error(data.error || 'Could not compile AI analysis. Please verify your GEMINI_API_KEY is active.');
      }

      setReportData(data);
    } catch (err: any) {
      setReportError(err.message || 'Error occurred while talking with Gemini Advisor.');
    } finally {
      setLoadingReport(false);
    }
  };  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in font-sans font-light">
      {/* Dynamic Jumbotron Header in Beautiful Classy Pink and Ash with refined accents */}
      <div className="bg-gradient-to-br from-rose-50/70 via-white to-pink-50/50 dark:from-pink-950/15 dark:via-ash-fb dark:to-pink-950/5 rounded-2xl p-5 sm:p-8 relative overflow-hidden border border-pink-200/50 dark:border-pink-900/20 shadow-sm">
        {/* Subtle decorative glow element in background */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-pink-100/30 dark:bg-pink-950/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="h-64 w-64 text-pink-400 dark:text-pink-900 rotate-12 animate-pulse" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-pink-50/80 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 font-semibold text-[10px] sm:text-xs px-3.5 py-1.5 rounded-full border border-pink-200/50 dark:border-pink-850/30">
            <SabisellLogo className="h-3.5 w-3.5 text-pink-500 animate-pulse" />
            {isOrg ? "Sabisell Organization Dashboard" : "Sabisell SME Command Center Dashboard"}
          </div>
          <h1 className="text-xl sm:text-3xl md:text-4xl font-display font-semibold text-ash-900 tracking-tight leading-tight">
            {isOrg ? (
              <>
                Manage Your Money, Stock, <br className="hidden sm:inline" /> and <span className="text-pink-600 dark:text-pink-400 font-bold">Daily Activities</span>
              </>
            ) : (
              <>
                Seamless Market Trading <br className="hidden sm:inline" /> & <span className="text-pink-600 dark:text-pink-400 font-bold">Smart SME Accounting</span>
              </>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-ash-500 leading-relaxed font-light">
            {isOrg 
              ? "Track income, expenses, stock, payments, and member contributions. Use voice commands and get smart business insights from AI."
              : "Track daily inventory stock, log customer debts, parse voice commands, and brainstorm on margins with your AI advisor. Everything you need to grow your small business in Nigeria."}
          </p>
          <div className="flex flex-wrap gap-2.5 sm:gap-4 pt-1.5">
            <button 
              onClick={() => onNavigate('voice')}
              className="bg-mint-400 hover:bg-mint-500 text-white font-medium px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-97 transition-all cursor-pointer duration-200"
            >
              <span>🎤</span>
              {isOrg ? "Use Voice Command" : "Use Voice Commands"}
            </button>
            <button 
              onClick={() => onNavigate('sales')}
              className="bg-ash-100 hover:bg-ash-200 text-ash-700 font-normal px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 border border-ash-200/30 shadow-xs transition-all active:scale-97 cursor-pointer duration-200"
            >
              <span>➕</span>
              {isOrg ? "Record Income / Payment" : "Log New Sale"}
            </button>
          </div>
        </div>
      </div>

      {/* Mini Inline Filters Bar - Elegant, compact, mobile-friendly */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-ash-200 shadow-xs relative">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-mint-50 flex items-center justify-center shrink-0">
            <Filter className="h-4 w-4 text-mint-500" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold text-ash-800 font-display truncate">Store Filters</h4>
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-ash-400 font-light mt-0.5">
              <span>{filteredSales.length} sales</span>
              <span>•</span>
              <span>{filteredExpenses.length} expenses</span>
            </div>
          </div>
        </div>

        {/* Filter buttons and actions container */}
        <div className="flex items-center gap-1.5 shrink-0 relative">
          {/* Active indicator dot */}
          {(timeframe !== 'all' || eventType !== 'all' || selectedCategory !== 'all') && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-mint-500"></span>
            </span>
          )}

          {/* Quick reset button if active */}
          {(timeframe !== 'all' || eventType !== 'all' || selectedCategory !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setTimeframe('all');
                setStartDate('');
                setEndDate('');
                setEventType('all');
                setSelectedCategory('all');
              }}
              title="Reset all filters"
              className="text-[11px] hover:bg-slate-100 text-ash-500 hover:text-ash-800 font-medium px-2 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer border border-slate-200 bg-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          {/* Elegant trigger button with active state styling */}
          <button
            type="button"
            onClick={() => setShowFiltersMenu(!showFiltersMenu)}
            className={`text-xs px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl flex items-center gap-1.5 border transition-all cursor-pointer select-none ${
              showFiltersMenu 
                ? 'bg-ash-900 border-ash-900 text-white shadow-xs' 
                : 'bg-white hover:bg-ash-fb text-ash-700 border-ash-200 hover:text-slate-900'
            }`}
          >
            <Filter className="h-3.5 w-3.5 shrink-0 text-current" />
            <span className="font-medium text-[11px] sm:text-xs">
              {isOrg ? "Filter Records" : "Filter Ledger"}
            </span>
            <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${showFiltersMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Card Popover */}
          {showFiltersMenu && (
            <>
              {/* Overlay background panel to register dismiss clicks */}
              <div 
                className="fixed inset-0 z-40 bg-transparent cursor-default" 
                onClick={() => setShowFiltersMenu(false)} 
              />
              
              <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2.5rem)] sm:w-80 bg-white rounded-2xl border border-ash-200 shadow-xl p-4 sm:p-5 z-50 animate-fade-in space-y-4">
                <div className="flex items-center justify-between border-b border-ash-100 pb-2">
                  <span className="text-xs font-semibold text-slate-800 font-display">Manage Filters</span>
                  <button 
                    type="button"
                    onClick={() => setShowFiltersMenu(false)}
                    className="text-[10px] text-mint-600 hover:text-mint-700 font-bold uppercase tracking-wider"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Timeframe Select */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-ash-400 uppercase tracking-wider">Trading Range</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setDropdownTimeframeOpen(!dropdownTimeframeOpen)}
                        className="w-full text-xs bg-ash-fb hover:bg-ash-100/50 text-ash-800 rounded-xl px-3 py-2 border border-ash-200 focus:outline-none focus:border-mint-400 transition-colors font-sans text-left flex items-center justify-between cursor-pointer select-none"
                      >
                        <span>
                          {{
                            all: 'All-Time Statistics',
                            today: 'Today only',
                            week: 'This week (7 Days)',
                            month: 'This month (30 Days)',
                            custom: 'Custom interval...'
                          }[timeframe]}
                        </span>
                        <ChevronDown className="h-3 w-3 text-ash-400 shrink-0" />
                      </button>

                      {dropdownTimeframeOpen && (
                        <>
                          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setDropdownTimeframeOpen(false)} />
                          <div className="absolute left-0 top-full mt-1 w-full bg-white rounded-xl border border-ash-200 shadow-xl p-1 z-50 max-h-60 overflow-y-auto text-xs animate-fade-in font-sans">
                            {[
                              { value: 'all', label: 'All-Time Statistics' },
                              { value: 'today', label: 'Today only' },
                              { value: 'week', label: 'This week (7 Days)' },
                              { value: 'month', label: 'This month (30 Days)' },
                              { value: 'custom', label: 'Custom interval...' }
                            ].map(opt => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  setTimeframe(opt.value as any);
                                  setDropdownTimeframeOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-ash-50 transition-colors cursor-pointer ${timeframe === opt.value ? 'bg-mint-50/50 text-mint-600 font-semibold' : 'text-ash-700'}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Event Type Select */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-ash-400 uppercase tracking-wider">Bookkeeping Types</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setDropdownEventTypeOpen(!dropdownEventTypeOpen)}
                        className="w-full text-xs bg-ash-fb hover:bg-ash-100/50 text-ash-800 rounded-xl px-3 py-2 border border-ash-200 focus:outline-none focus:border-mint-400 transition-colors font-sans text-left flex items-center justify-between cursor-pointer select-none"
                      >
                        <span>
                          {{
                            all: 'Sales & Expenses combined',
                            sales: 'Sales Registries only',
                            expenses: 'Expenses only'
                          }[eventType]}
                        </span>
                        <ChevronDown className="h-3 w-3 text-ash-400 shrink-0" />
                      </button>

                      {dropdownEventTypeOpen && (
                        <>
                          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setDropdownEventTypeOpen(false)} />
                          <div className="absolute left-0 top-full mt-1 w-full bg-white rounded-xl border border-ash-200 shadow-xl p-1 z-50 max-h-60 overflow-y-auto text-xs animate-fade-in font-sans">
                            {[
                              { value: 'all', label: 'Sales & Expenses combined' },
                              { value: 'sales', label: 'Sales Registries only' },
                              { value: 'expenses', label: 'Expenses only' }
                            ].map(opt => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  setEventType(opt.value as any);
                                  setDropdownEventTypeOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-ash-50 transition-colors cursor-pointer ${eventType === opt.value ? 'bg-mint-50/50 text-mint-600 font-semibold' : 'text-ash-700'}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Stock Category matching */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-ash-400 uppercase tracking-wider">Catalog Grains & Services</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setDropdownCategoryOpen(!dropdownCategoryOpen)}
                        className="w-full text-xs bg-ash-fb hover:bg-ash-100/50 text-ash-800 rounded-xl px-3 py-2 border border-ash-200 focus:outline-none focus:border-mint-400 transition-colors font-sans text-left flex items-center justify-between cursor-pointer select-none"
                      >
                        <span>
                          {selectedCategory === 'all' ? 'All Store Categories' : selectedCategory}
                        </span>
                        <ChevronDown className="h-3 w-3 text-ash-400 shrink-0" />
                      </button>

                      {dropdownCategoryOpen && (
                        <>
                          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setDropdownCategoryOpen(false)} />
                          <div className="absolute left-0 top-full mt-1 w-full bg-white rounded-xl border border-ash-200 shadow-xl p-1 z-50 max-h-60 overflow-y-auto text-xs animate-fade-in font-sans">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCategory('all');
                                setDropdownCategoryOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg hover:bg-ash-50 transition-colors cursor-pointer ${selectedCategory === 'all' ? 'bg-mint-50/50 text-mint-600 font-semibold' : 'text-ash-700'}`}
                            >
                              All Store Categories
                            </button>
                            {productCategories.map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                  setSelectedCategory(cat);
                                  setDropdownCategoryOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-ash-50 transition-colors cursor-pointer ${selectedCategory === cat ? 'bg-mint-50/50 text-mint-600 font-semibold border-l-2 border-mint-400' : 'text-ash-700'}`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Custom inline calendar picks */}
                  {timeframe === 'custom' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-3 bg-ash-fb border border-ash-150 rounded-xl space-y-2 mt-2"
                    >
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-ash-500 uppercase tracking-wider flex items-center gap-1">
                          <Calendar className="h-2.5 w-2.5 text-ash-450" />
                          <span>Start Date</span>
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full text-xs bg-white text-ash-800 rounded-lg px-2 py-1 border border-ash-200 focus:outline-none focus:border-mint-400 transition-colors font-sans"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-ash-500 uppercase tracking-wider flex items-center gap-1">
                          <Calendar className="h-2.5 w-2.5 text-ash-455" />
                          <span>End Date</span>
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full text-xs bg-white text-ash-800 rounded-lg px-2 py-1 border border-ash-200 focus:outline-none focus:border-mint-400 transition-colors font-sans"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Sub-actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-ash-100">
                  <button
                    type="button"
                    onClick={() => {
                      setTimeframe('all');
                      setStartDate('');
                      setEndDate('');
                      setEventType('all');
                      setSelectedCategory('all');
                    }}
                    className="flex-1 text-[10px] sm:text-xs font-semibold text-slate-500 hover:text-slate-850 py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  >
                    Reset All
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFiltersMenu(false)}
                    className="flex-1 text-[10px] sm:text-xs font-semibold text-white py-2 bg-mint-600 hover:bg-mint-500 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Aggregate Financial Performance Cards with mint highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 font-sans">
        <div className="bg-white rounded-2xl p-5 border border-ash-200 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-ash-400 text-xs font-normal uppercase tracking-wider">
              {isOrg ? "Total Money Received" : "Total Trading Sales"}
            </span>
            <div className="bg-mint-50 text-mint-600 p-2 rounded-xl border border-mint-100">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-display font-normal text-ash-900 tracking-tight">
              {formatNaira(totalSalesVal)}
            </h3>
            <p className="text-[10px] text-ash-400 mt-1 font-light animate-none">
              {isOrg ? "All payments and contributions received." : "Total revenue recorded"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-ash-200 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-ash-400 text-xs font-normal uppercase tracking-wider">
              {isOrg ? "Confirmed Payments" : "Cash Collected"}
            </span>
            <div className="bg-ash-50 text-ash-700 p-2 rounded-xl border border-ash-100">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-display font-light text-ash-900 tracking-tight">
              {formatNaira(totalReceivedVal)}
            </h3>
            <p className="text-[10px] text-ash-400 mt-1 font-light animate-none">
              {isOrg ? "Payments successfully received." : "Cash paid in hand / bank"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-ash-200 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-ash-400 text-xs font-normal uppercase tracking-wider">
              {isOrg ? "Outstanding Payments" : "Outstanding Debts"}
            </span>
            <div className="bg-red-50 text-red-600 p-2 rounded-xl border border-red-100">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-display font-normal text-red-650 tracking-tight">
              {formatNaira(totalDebtVal)}
            </h3>
            <p className="text-[10px] text-red-500 font-light mt-1 animate-none">
              {isOrg ? (totalDebtVal > 0 ? 'Follow up on payments!' : 'Nobody owes you money.') : (totalDebtVal > 0 ? 'Remind your debtors!' : 'All clear!')}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-ash-200 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-ash-400 text-xs font-normal uppercase tracking-wider">
              {isOrg ? "Total Business Value" : "Total Stock Value"}
            </span>
            <div className="bg-mint-50 text-mint-600 p-2 rounded-xl border border-mint-100">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-display font-light text-ash-900 tracking-tight">
              {formatNaira(totalInventoryValue)}
            </h3>
            <p className="text-[10px] text-mint-600 font-normal mt-1 animate-none">
              {isOrg ? "Estimated value of your stock and cash." : `Margin expectation: ${formatNaira(expectedProfit)}`}
            </p>
          </div>
        </div>
      </div>

      {/* Slow-moving Stock Alerts Highlighting (No sales in 60-90 days, cash flow lock up warning) */}
      {slowMovingProducts.length > 0 && (
        <div className="bg-gradient-to-r from-red-50/70 via-pink-50/55 to-amber-50/30 dark:from-red-950/20 dark:via-pink-950/15 dark:to-zinc-950 border border-red-200/90 dark:border-red-500/20 rounded-2xl p-4 sm:p-5 shadow-3xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in font-sans">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="bg-red-500/10 text-red-600 dark:text-red-400 p-2.5 rounded-xl shrink-0 mt-0.5 border border-red-500/15 animate-pulse">
              <span className="text-lg">⚠️</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-red-950 dark:text-red-350 flex items-center gap-1.5 leading-snug">
                <span>Slow-Moving Product Alerts (Locked Up Capital!)</span>
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping hidden sm:inline"></span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed font-light">
                The Sabi ledger reports slow performance on these offerings over the last 60 days. Money dey tied up inside, Oga! Consider running promotions, clearance sales, or discounts to free up your business cash flow.
              </p>
              
              <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {slowMovingAlertsToShow.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-zinc-900 border border-red-100/70 dark:border-red-900/10 rounded-xl p-3 flex flex-col justify-between shadow-3xs hover:border-red-300 dark:hover:border-red-500/30 transition-all">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate" title={item.name}>
                          {item.name}
                        </span>
                        <span className="text-[10px] bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-md font-bold font-mono">
                          {item.quantity} units left
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-405 mt-1">
                        Category: {item.category || 'General'}
                      </p>
                    </div>
                    
                    <div className="mt-3.5 pt-2 border-t border-dashed border-red-100/50 dark:border-red-900/10 flex items-baseline justify-between gap-1.5">
                      <span className="text-[9px] text-red-650/80 font-bold uppercase tracking-wider">Locked Money:</span>
                      <span className="text-xs font-extrabold text-red-650 dark:text-red-400 font-mono font-bold">
                        {formatNaira(item.capitalLockedUp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => onNavigate('inventory')}
            className="w-full md:w-auto shrink-0 bg-red-650 hover:bg-red-550 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer whitespace-nowrap text-center"
          >
            Run Clearance Offer 🎯
          </button>
        </div>
      )}

      {/* Dynamic P&L & SME Capital Ledger Sheet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 font-sans">
        {/* SME Capital Card */}
        <div className="space-y-3 flex flex-col justify-between">
          <h2 className="text-xs sm:text-sm font-normal text-ash-505 uppercase tracking-wider">
            {isOrg ? "Money Invested in the Business" : "Working Capital Breakdown"}
          </h2>
          <div className="bg-white rounded-2xl p-5 border border-ash-200 shadow-xs relative overflow-hidden flex flex-col justify-between flex-grow">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-ash-50">
                <span className="text-ash-400 text-xs font-normal uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-mint-500" />
                  {isOrg ? "Business Investment" : "SME Working Operational Capital"}
                </span>
                <span className="text-[10px] bg-mint-50 text-mint-750 px-2.5 py-1 rounded-full border border-mint-100 font-semibold uppercase font-mono">
                  {isOrg ? "Investment" : "Total Asset Root"}
                </span>
              </div>
              
              <div className="py-2">
                <span className="text-xl sm:text-2xl font-display font-normal text-ash-900 tracking-tight">
                  {formatNaira(totalCapitalVal)}
                </span>
                <p className="text-[10px] text-ash-400 mt-1 font-light block animate-none">
                  {isOrg 
                    ? "The total money currently tied up in stock, supplies, and business operations."
                    : "Aggregated working capital investment bound to shop stock and outflows at any given time."}
                </p>
              </div>

              <div className="space-y-2 border-t border-ash-100 pt-3 mt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-ash-500 font-light">
                    {isOrg ? "Money spent on stock:" : "Inventory stock cost value:"}
                  </span>
                  <span className="font-semibold text-ash-800 font-mono">{formatNaira(totalInventoryCost)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-ash-500 font-light">
                    {isOrg ? "Running expenses:" : "Operating business expenses (OPEX):"}
                  </span>
                  <span className="font-semibold text-ash-800 font-mono">{formatNaira(totalExpensesVal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real Business Profit Loss Tracker */}
        <div className="space-y-3 flex flex-col justify-between">
          <h2 className="text-xs sm:text-sm font-normal text-ash-505 uppercase tracking-wider">
            {isOrg ? "Profit & Loss" : "Performance Tracker"}
          </h2>
          <div className="bg-white rounded-2xl p-5 border border-ash-200 shadow-xs relative overflow-hidden flex flex-col justify-between flex-grow">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-ash-50">
                <span className="text-ash-400 text-xs font-normal uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  {isOrg ? "Current Profit" : "Active Accounting Profit/Loss (P&L)"}
                </span>
                <span className={`text-[10px] px-2.5 py-1 rounded-full border border-slate-200/50 font-semibold uppercase font-mono ${netProfitVal >= 0 ? 'bg-emerald-50 text-emerald-755 border-emerald-100' : 'bg-red-50 text-red-755 border-red-100'}`}>
                  {isOrg ? (netProfitVal >= 0 ? 'SURPLUS' : 'DEFICIT') : (netProfitVal >= 0 ? 'NET GAIN' : 'NET LOSS')}
                </span>
              </div>

              <div className="py-2">
                <span className={`text-xl sm:text-2xl font-display font-normal tracking-tight ${netProfitVal >= 0 ? 'text-emerald-600' : 'text-red-650'}`}>
                  {formatNaira(netProfitVal)}
                </span>
                <p className="text-[10px] text-ash-400 mt-1 font-light block animate-none">
                  {isOrg 
                    ? "A simple view of how your business is performing after expenses."
                    : "True profit subtracting cost of goods sold and overall running opex expenses."}
                </p>
              </div>

              <div className="space-y-2 border-t border-ash-100 pt-3 mt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-ash-500 font-light">{isOrg ? "Money received:" : "Total Sales Revenues:"}</span>
                  <span className="font-semibold text-emerald-600 font-mono">+{formatNaira(totalSalesVal)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-ash-505 font-light">{isOrg ? "Stock costs:" : "Cost of items sold (COGS):"}</span>
                  <span className="font-semibold text-ash-800 font-mono">-{formatNaira(totalCostOfGoodsSold)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-red-500">
                  <span className="font-light">{isOrg ? "Running expenses:" : "Running Opex expenses:"}</span>
                  <span className="font-bold font-mono">-{formatNaira(totalExpensesVal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Running Costs and Capital Expense Manager Section */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-ash-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-ash-100 pb-3 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-mint-50 rounded-lg flex items-center justify-center">
              <Receipt className="h-4.5 w-4.5 text-mint-500" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-ash-800 text-sm">
                {isOrg ? "Expenses" : "Operating Expenses & Opex Ledger"}
              </h3>
              <p className="text-[10px] text-ash-400">
                {isOrg ? "Record transport, rent, electricity, salaries, feeding costs, and other daily expenses." : "Record transport costs, feed/poultry inputs, rent, utility light, and salary."}
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setAddExpenseModalOpen(true)}
            className="self-start sm:self-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-3xs transition-transform hover:-translate-y-0.5"
          >
            {isOrg ? "➕" : <Plus className="h-4 w-4" />}
            {isOrg ? "Add Expense" : "Record Running Expense"}
          </button>
        </div>

        {/* Expenses List */}
        <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2.5 font-sans">
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map(exp => {
              const matchedProduct = products.find(p => p.id === exp.associatedProductId);
              return (
                <div key={exp.id} className="p-3 bg-ash-fb hover:bg-white border border-ash-150 rounded-xl flex items-center justify-between gap-4 transition-all hover:shadow-2xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-ash-800">{exp.description}</span>
                      <span className="text-[9px] bg-slate-100 text-slate-705 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                        {exp.category}
                      </span>
                      {matchedProduct && (
                        <span className="text-[9px] bg-mint-50 text-mint-705 border border-mint-200/35 px-2 py-0.5 rounded-full font-semibold">
                          Linked: {matchedProduct.name}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-ash-400 font-light">
                      Logged on {new Date(exp.timestamp).toLocaleDateString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-red-650 text-xs sm:text-sm">
                      -{formatNaira(exp.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmTitle('Delete Running Expense');
                        setConfirmMsg(`Are you sure you want to delete "${exp.description}" (-${formatNaira(exp.amount)})? This recalculates operating opex and capital immediately.`);
                        setConfirmAction(() => () => {
                          onDeleteExpense(exp.id);
                          setConfirmOpen(false);
                        });
                        setConfirmOpen(true);
                      }}
                      className="text-ash-400 hover:text-red-650 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 bg-ash-55 border border-ash-150 border-dashed rounded-xl flex flex-col items-center justify-center gap-1.5">
              <Receipt className="h-6 w-6 text-ash-300" />
              <p className="text-[11px] text-ash-400">
                {isOrg ? "No expenses recorded yet." : "No operational expenses logged yet. Tap button above to record transport, feed, rent, light etc."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Charts & Realtime Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Sales and Profits chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 border border-ash-200 shadow-xs flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-sm font-display font-normal text-ash-800 uppercase tracking-tight">
                {isOrg ? "Weekly Sales & Profit" : "Weekly Trading Trend"}
              </h2>
              <p className="text-xs text-ash-400 font-light">
                {isOrg ? "See how much you sold and how much profit you made this week." : "Track current week's sales volume vs. computed profit margins"}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-light">
              <div className="flex items-center gap-1.5 text-ash-700">
                <span className="w-2.5 h-2.5 rounded-full bg-mint-400 inline-block"></span>
                Sales
              </div>
              <div className="flex items-center gap-1.5 text-ash-700">
                <span className="w-2.5 h-2.5 rounded-full bg-ash-400 inline-block"></span>
                Profit
              </div>
            </div>
          </div>
          
          <motion.div 
            className="h-64 sm:h-72 w-full"
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1ad3a6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#1ad3a6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#687076" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#687076" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8eaeb" />
                <XAxis dataKey="name" stroke="#889096" fontSize={11} tickLine={false} />
                <YAxis stroke="#889096" fontSize={11} tickFormatter={(val) => `₦${val/1000}k`} tickLine={false} />
                <Tooltip 
                  formatter={(value: any) => [formatNaira(value), '']}
                  contentStyle={{ border: '1px solid #e8eaeb', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="Sales" stroke="#1ad3a6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="Profit" stroke="#687076" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Top Product and Core stats column */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-ash-200 shadow-xs flex flex-col justify-between gap-6">
          <div>
            <h2 className="text-xs font-normal text-ash-400 uppercase tracking-wider mb-4">
              {isOrg ? "Stock Overview" : "Stock Velocity & Highlights"}
            </h2>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="p-3.5 bg-ash-50 rounded-xl flex items-center gap-3 border border-ash-100/50">
                <div className="bg-white p-2 rounded-lg shadow-2xs border border-ash-100">
                  <Package className="h-4 w-4 text-mint-500" />
                </div>
                <div>
                  <p className="text-[9px] text-ash-400 uppercase tracking-wider">
                    {isOrg ? "Best-Selling Product" : "Fastest Moving Product"}
                  </p>
                  <h4 className="font-normal text-xs sm:text-sm text-ash-900 truncate max-w-[180px]">{primaryMovingProduct}</h4>
                </div>
              </div>

              <div className="p-3.5 bg-ash-50 rounded-xl flex items-center gap-3 border border-ash-100/50">
                <div className="bg-white p-2 rounded-lg shadow-2xs border border-ash-100">
                  <TrendingUp className="h-4 w-4 text-mint-500" />
                </div>
                <div>
                  <p className="text-[9px] text-ash-400 uppercase tracking-wider">
                    {isOrg ? "Items in Stock" : "Available Stock Count"}
                  </p>
                  <h4 className="font-normal text-xs sm:text-sm text-ash-900">
                    {products.reduce((acc, p) => acc + p.quantity, 0)} {isOrg ? "items currently available" : "Units in store"}
                  </h4>
                </div>
              </div>

              <div className="p-3.5 bg-ash-50 rounded-xl flex items-center gap-3 border border-ash-100/50">
                <div className="bg-white p-2 rounded-lg shadow-2xs border border-ash-100">
                  <Users className="h-4 w-4 text-ash-600" />
                </div>
                <div>
                  <p className="text-[9px] text-ash-400 uppercase tracking-wider">
                    {isOrg ? "Customers Owing" : "Outstanding Debtors"}
                  </p>
                  <h4 className="font-normal text-xs sm:text-sm text-ash-900">
                    {sales.filter(s => s.balanceDebt > 0).length} {isOrg ? "customers owe payments" : "Customers owe balance"}
                  </h4>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Auxiliary Strategic SME Reports (Categorical Allocation & Physical Shelf Stocks) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Capital Investment (Pie Chart) */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-ash-200 shadow-xs flex flex-col">
          <div className="mb-4">
            <h2 className="text-sm font-display font-semibold text-ash-800 uppercase tracking-tight">
              {isOrg ? "Stock Categories" : "Category Distribution Share"}
            </h2>
            <p className="text-xs text-ash-400 font-light">
              {isOrg ? "See how your products are divided across different categories." : "Capital investment weight (value of stock at cost price) across store categories"}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center flex-1">
            <motion.div 
              className="sm:col-span-7 h-56 w-full relative"
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    formatter={(value: any, name: string, props: any) => {
                      return [formatNaira(Number(value)), `Cost Cap (Qty: ${props.payload.qty || 0})`];
                    }}
                    contentStyle={{ border: '1px solid #e8eaeb', borderRadius: '12px', fontSize: '11px', fontFamily: 'sans-serif' }}
                  />
                  <Pie
                    data={activePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {activePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Label for total cost value */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Total Bound</span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  {formatNaira(activePieData.reduce((acc, curr) => acc + curr.value, 0))}
                </span>
              </div>
            </motion.div>

            <div className="sm:col-span-5 space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {activePieData.map((entry, index) => {
                const total = activePieData.reduce((acc, curr) => acc + curr.value, 0);
                const percent = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                return (
                  <div key={entry.name} className="flex items-center justify-between text-xs border-b border-slate-50 pb-1.5 last:border-0 last:pb-0 select-none">
                    <div className="flex items-center gap-2 min-w-0">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                      />
                      <span className="text-slate-600 truncate font-light" title={entry.name}>
                        {entry.name}
                      </span>
                    </div>
                    <div className="text-right shrink-0 pl-1.5">
                      <span className="font-semibold text-slate-800 font-mono text-[11px]">
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top 5 Stock Levels in Shop Shelf (Bar Chart) */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-ash-200 shadow-xs flex flex-col font-sans">
          <div className="mb-4">
            <h2 className="text-sm font-display font-semibold text-ash-800 uppercase tracking-tight">
              {isOrg ? "Highest Stock Items" : "Top Stock Levels"}
            </h2>
            <p className="text-xs text-ash-400 font-light">
              {isOrg ? "Products with the largest quantities currently available." : "Inventory count of highest stocked item lines in physical shelf spaces"}
            </p>
          </div>
          
          <motion.div 
            className="h-56 w-full flex-1"
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1], delay: 0.25 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeBarData} margin={{ top: 10, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.85}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8eaeb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#889096" 
                  fontSize={10} 
                  tickLine={false}
                  fontWeight={500}
                />
                <YAxis 
                  stroke="#889096" 
                  fontSize={10} 
                  tickLine={false} 
                  fontWeight={500}
                />
                <Tooltip 
                  formatter={(value: any, name: string, props: any) => {
                    const capital = props.payload['Capital Value (₦)'] || props.payload['Capital Locked (₦)'];
                    return [`${value} Units`, `Capital Locked: ${formatNaira(capital)}`];
                  }}
                  contentStyle={{ border: '1px solid #e8eaeb', borderRadius: '12px', fontSize: '11px' }}
                />
                <Bar 
                  dataKey="Stock Level (Units)" 
                  fill="url(#barGradient)" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>

      {/* Automated Weekly Business Insights Report Panel in Professional Polish Theme */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-ash-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xs sm:text-sm font-normal text-ash-505 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5 text-mint-500" />
              {isOrg ? "AI Business Report" : "Automated Business Report (AI-Powered)"}
            </h2>
            <p className="text-xs text-ash-400 mt-1 font-light">
              {isOrg ? "Get simple business advice and performance summaries based on your records." : "Analyze profit matrices and margin optimization suggestions tailored for local trade."}
            </p>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={loadingReport}
            className="bg-mint-400 hover:bg-mint-500 text-white text-xs font-normal py-2 sm:py-2.5 px-4 sm:px-5 rounded-xl flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer transition-colors"
          >
            {loadingReport ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white/80" />
                {isOrg ? "Creating Report..." : "Consulting Advisor..."}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-white" />
                {isOrg ? "Generate Report" : "Compile Business Report"}
              </>
            )}
          </button>
        </div>

        {reportError && (
          <div className="p-4 bg-red-400/10 text-red-700 text-xs rounded-xl flex items-center gap-2 mb-4 border border-red-200/50 font-normal">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
            <span>{reportError}</span>
          </div>
        )}

        {reportData ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Overview Section */}
            <div className="lg:col-span-8 bg-ash-50 rounded-2xl p-4 sm:p-6 border border-ash-200 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="font-normal text-[10px] uppercase tracking-wider text-mint-750 bg-mint-50 px-2.5 py-1.5 rounded-lg inline-block mb-2">
                    {isOrg ? "Simple Business Summary" : "Weekly Executive Summary"}
                  </span>
                  <p className="text-xs sm:text-sm font-light leading-relaxed text-ash-800">{reportData.executiveOverview}</p>
                </div>
                <div className="pt-4 border-t border-ash-200">
                  <span className="font-normal text-[10px] uppercase tracking-wider text-mint-750 bg-mint-50 px-2.5 py-1.5 rounded-lg inline-block mb-2">
                    {isOrg ? "Sales & Profits Advice" : "Profit Margins Breakdown"}
                  </span>
                  <p className="text-xs sm:text-sm font-light leading-relaxed text-ash-605">{reportData.profitMarginAnalysis}</p>
                </div>
              </div>
            </div>

            {/* AI Guru Suggestion Styled directly from the theme template */}
            <div className="lg:col-span-4 bg-ash-800 text-white rounded-2xl p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-mint-400 rounded-lg">
                    <Sparkles className="h-3.5 w-3.5 text-white animate-pulse" />
                  </div>
                  <h3 className="text-[10px] font-normal uppercase tracking-widest text-mint-200">
                    {isOrg ? "Sabi AI Advice" : "AI Guru Suggestion"}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm font-light leading-relaxed italic text-ash-100">
                  "{reportData.estimatedWeeklyTrend || 'Profit margins are stable. Consolidate your WhatsApp marketing strategies to drive more provisions sales.'}"
                </p>
              </div>

              <div className="relative z-10 pt-6">
                <button 
                  onClick={() => onNavigate('chat')} 
                  className="text-xs bg-white text-ash-800 hover:bg-ash-50 font-normal px-4 py-2.5 rounded-xl w-full text-center transition-colors cursor-pointer"
                >
                  Explore Strategy with AI
                </button>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full pointer-events-none"></div>
            </div>

            {/* Strategies Checklist */}
            <div className="lg:col-span-12 p-4 sm:p-6 bg-ash-50 rounded-2xl border border-ash-200">
              <span className="font-normal text-[10px] uppercase tracking-wider text-mint-750 bg-mint-50 px-2.5 py-1.5 rounded-lg inline-block mb-4">
                {isOrg ? "Easy Tips To Grow" : "Core Recommendations"}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reportData.marginOptimizations?.map((strategy: string, idx: number) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-ash-200 flex gap-3">
                    <span className="bg-mint-450 text-white font-mono font-medium text-[10px] w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-ash-700 leading-relaxed font-light">{strategy}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-ash-fb border border-ash-200 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2">
            <BookOpen className="h-6 w-6 text-ash-300" />
            <p className="text-xs text-ash-400 font-light">No report generated for this week's data. Tap the compile button to consult Gemini.</p>
          </div>
        )}
      </div>

      {/* Dynamic Pop-Sheet Add Expense Modal */}
      {addExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ash-950/45 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-ash-200 overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-5 border-b border-ash-105 bg-ash-50 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-ash-800 uppercase tracking-wide">Record Running Expense</h3>
                <p className="text-[10px] text-ash-400">Add operational costs to adjust capital and profit accuracy.</p>
              </div>
              <button
                type="button"
                onClick={() => setAddExpenseModalOpen(false)}
                className="text-ash-400 hover:text-ash-700 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ash-100 transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} className="p-5 space-y-4 font-sans">
              {/* Description Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-ash-500 uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chicken Feed purchase, Transport to purchase, Shop light..."
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  className="w-full bg-ash-fb focus:bg-white text-xs border border-ash-200 focus:border-mint-400 rounded-xl p-3 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800"
                />
              </div>

              {/* Amount Inputs */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-ash-500 uppercase tracking-wider">Amount (Naira ₦)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="2500"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="w-full bg-ash-fb focus:bg-white text-xs border border-ash-200 focus:border-mint-400 rounded-xl p-3 focus:outline-none transition-all font-mono placeholder:text-slate-400 text-slate-800"
                />
              </div>

              {/* Category Dropdown */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-ash-500 uppercase tracking-wider">Category</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownExpCategoryOpen(!dropdownExpCategoryOpen)}
                    className="w-full flex items-center justify-between bg-ash-fb hover:bg-ash-100/50 text-xs border border-ash-200 focus:border-mint-400 rounded-xl p-3 focus:outline-none transition-all cursor-pointer text-slate-800 font-semibold text-left select-none"
                  >
                    <span>
                      {{
                        'Transport': 'Transport / Logistics',
                        'Supplies/Feed': 'Supplies & Chicken Feed',
                        'Utilities': 'Utilities & Electricity',
                        'Rent/Space': 'Rent & Shop Space',
                        'Salary': 'Salary & Labor',
                        'Other': 'Other Expenses'
                      }[expCategory] || expCategory}
                    </span>
                    <ChevronDown className="h-4 w-4 text-ash-400 shrink-0 ml-1" />
                  </button>

                  {dropdownExpCategoryOpen && (
                    <>
                      <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setDropdownExpCategoryOpen(false)} />
                      <div className="absolute left-0 top-full mt-1 w-full bg-white rounded-xl border border-ash-200 shadow-xl p-1 z-50 max-h-60 overflow-y-auto text-xs font-sans">
                        {[
                          { value: 'Transport', label: 'Transport / Logistics' },
                          { value: 'Supplies/Feed', label: 'Supplies & Chicken Feed' },
                          { value: 'Utilities', label: 'Utilities & Electricity' },
                          { value: 'Rent/Space', label: 'Rent & Shop Space' },
                          { value: 'Salary', label: 'Salary & Labor' },
                          { value: 'Other', label: 'Other Expenses' }
                        ].map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setExpCategory(opt.value);
                              setDropdownExpCategoryOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg hover:bg-ash-50 transition-colors cursor-pointer ${expCategory === opt.value ? 'bg-mint-50/50 text-mint-600 font-semibold' : 'text-ash-700'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Associated Product Link Optional Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-ash-500 uppercase tracking-wider">Link to Inventory Item (Optional)</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownExpProdOpen(!dropdownExpProdOpen)}
                    className="w-full flex items-center justify-between bg-ash-fb hover:bg-ash-100/50 text-xs border border-ash-200 focus:border-mint-400 rounded-xl p-3 focus:outline-none transition-all cursor-pointer text-slate-800 text-left select-none"
                  >
                    <span>
                      {products.find(p => p.id === expProdId) 
                        ? `${products.find(p => p.id === expProdId)?.name} (Stock: ${products.find(p => p.id === expProdId)?.quantity})`
                        : '-- No linked stock item --'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-ash-400 shrink-0 ml-1" />
                  </button>

                  {dropdownExpProdOpen && (
                    <>
                      <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setDropdownExpProdOpen(false)} />
                      <div className="absolute left-0 top-full mt-1 w-full bg-white rounded-xl border border-ash-200 shadow-xl p-1 z-50 max-h-60 overflow-y-auto text-xs font-sans">
                        <button
                          type="button"
                          onClick={() => {
                            setExpProdId('');
                            setDropdownExpProdOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg hover:bg-ash-50 transition-colors cursor-pointer ${expProdId === '' ? 'bg-mint-50/50 text-mint-600 font-semibold' : 'text-ash-700'}`}
                        >
                          -- No linked stock item --
                        </button>
                        {products.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setExpProdId(p.id);
                              setDropdownExpProdOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg hover:bg-ash-50 transition-colors cursor-pointer ${expProdId === p.id ? 'bg-mint-50/50 text-mint-600 font-semibold border-l-2 border-mint-450' : 'text-ash-700'}`}
                          >
                            {p.name} (Stock: {p.quantity})
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAddExpenseModalOpen(false)}
                  className="w-1/2 border border-ash-200 hover:bg-ash-100 text-ash-700 font-semibold text-xs py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-3 rounded-xl transition-colors shadow-2xs cursor-pointer"
                >
                  Save Outflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern Confirmation Modal overlay */}
      <CustomConfirmModal
        isOpen={confirmOpen}
        title={confirmTitle}
        message={confirmMsg}
        confirmText="Yes, delete opex"
        cancelText="No, keep it"
        isDanger={true}
        onConfirm={() => {
          if (confirmAction) confirmAction();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
