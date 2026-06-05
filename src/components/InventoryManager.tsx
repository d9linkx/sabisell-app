import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Package, 
  Briefcase,
  AlertTriangle, 
  Edit2, 
  Trash2, 
  Check, 
  X,
  PlusCircle,
  FolderOpen,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  History,
  TrendingUp,
  LineChart as LucideLineChart,
  ChevronDown,
  Share2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Product, PriceHistory, BusinessProfile, isOrganizationCategory, getOrganizationTerminology } from '../types';
import { CustomConfirmModal } from './Modal';

interface InventoryManagerProps {
  products: Product[];
  priceHistory?: PriceHistory[];
  onAddProduct: (prod: Omit<Product, 'id' | 'lastUpdated'> & { lastUpdated?: string }) => void;
  onUpdateProduct: (id: string, updated: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  businessProfile?: BusinessProfile;
  onNavigate?: (tab: string) => void;
}

export default function InventoryManager({ 
  products, 
  priceHistory = [], 
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct, 
  businessProfile,
  onNavigate
}: InventoryManagerProps) {
  const isOrg = businessProfile ? isOrganizationCategory(businessProfile.category) : false;
  const terms = getOrganizationTerminology(businessProfile?.category || '', isOrg);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // WhatsApp Share State
  const [shareOpen, setShareOpen] = useState(false);
  const [shareType, setShareType] = useState<'all' | 'category' | 'single'>('all');
  const [shareCategory, setShareCategory] = useState('All');
  const [shareProduct, setShareProduct] = useState<Product | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Sorting state
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'sellingPrice' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: 'name' | 'quantity' | 'sellingPrice') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Confirmation modal states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMsg, setConfirmMsg] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  const criticalProducts = products.filter(p => (!p.type || p.type !== 'service') && p.quantity < 3);
  const activeCriticalAlerts = criticalProducts.filter(p => !dismissedAlerts.includes(p.id));
  
  // New item form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [sortByDropdownOpen, setSortByDropdownOpen] = useState(false);
  const [offeringType, setOfferingType] = useState<'product' | 'service'>('product');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Provisions');
  const [quantity, setQuantity] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [createdDate, setCreatedDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState('');
  const [editCost, setEditCost] = useState('');
  const [editSell, setEditSell] = useState('');

  // Selected product state for details and price history chart modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = [
    'All', 
    'Provisions', 
    'Building Materials', 
    'Fabrics', 
    'Grains & Foodstuffs', 
    'Drinks & Beverages', 
    'Electronics', 
    'Salon & Beauty', 
    'Labor & Repairs', 
    'Consultation & Tuition', 
    'Others', 
    'Others (Service)'
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || (offeringType === 'product' && !quantity) || !costPrice || !sellingPrice) return;

    onAddProduct({
      name: name.trim(),
      category,
      quantity: offeringType === 'service' ? 0 : Number(quantity),
      costPrice: Number(costPrice),
      sellingPrice: Number(sellingPrice),
      lastUpdated: createdDate ? new Date(createdDate).toISOString() : undefined,
      type: offeringType
    });

    // Reset fields
    setName('');
    setCategory(offeringType === 'service' ? 'Consultation & Tuition' : 'Provisions');
    setQuantity('');
    setCostPrice('');
    setSellingPrice('');
    setShowAddForm(false);
  };

  const startInlineEdit = (p: Product) => {
    setEditingId(p.id);
    setEditQty(p.quantity.toString());
    setEditCost(p.costPrice.toString());
    setEditSell(p.sellingPrice.toString());
  };

  const saveInlineEdit = (id: string) => {
    onUpdateProduct(id, {
      quantity: Number(editQty),
      costPrice: Number(editCost),
      sellingPrice: Number(editSell),
      lastUpdated: new Date().toISOString()
    });
    setEditingId(null);
  };

  const cancelInlineEdit = () => {
    setEditingId(null);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    setConfirmTitle(`Delete ${terms.stockItem}`);
    setConfirmMsg(`Are you sure you want to permanently delete/remove "${name}" from your active records? This action cannot be undone.`);
    setConfirmAction(() => () => {
      onDeleteProduct(id);
      setConfirmOpen(false);
    });
    setConfirmOpen(true);
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortBy) return 0;
    
    const valA = a[sortBy];
    const valB = b[sortBy];
    
    if (typeof valA === 'string') {
      return sortOrder === 'asc' 
        ? valA.localeCompare(valB as string) 
        : (valB as string).localeCompare(valA);
    }
    
    // Numeric sort
    return sortOrder === 'asc' 
      ? (valA as number) - (valB as number) 
      : (valB as number) - (valA as number);
  });

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Floating Notification Toasts for Critical Low Stock Items (< 3) */}
      {activeCriticalAlerts.length > 0 && (
        <div className="fixed bottom-24 right-4 sm:bottom-auto sm:top-20 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
          {activeCriticalAlerts.map(p => (
            <div 
              key={p.id} 
              id={`critical-toast-${p.id}`}
              className="pointer-events-auto bg-white/95 dark:bg-black/95 backdrop-blur-md text-slate-800 dark:text-ash-900 border border-red-200/90 dark:border-red-500/30 shadow-[0_12px_40px_rgba(239,68,68,0.16)] dark:shadow-[0_12px_40px_rgba(239,68,68,0.25)] rounded-2xl p-4 flex items-start gap-3.5 animate-fade-in relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
              <div className="bg-red-50 dark:bg-red-950/50 p-1.5 rounded-xl text-red-600 dark:text-red-400 shrink-0">
                <AlertTriangle className="h-5 w-5 animate-bounce" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[10px] text-red-600 dark:text-red-400 uppercase tracking-widest">
                    {isOrg ? `Low ${terms.stockItem} Warning!` : "Critical Low Stock!"}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                </div>
                <p className="text-xs text-slate-900 dark:text-white font-bold mt-1.5 leading-snug">
                  {p.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-ash-400 mt-1 leading-relaxed">
                  Remaining amount: <strong className="text-red-600 dark:text-red-400 font-bold">{p.quantity} units / limit left</strong>. Abeg, update or add more soon to avoid running out!
                </p>
              </div>
              <button 
                onClick={() => setDismissedAlerts(prev => [...prev, p.id])} 
                className="text-slate-400 hover:text-slate-600 dark:text-ash-400 dark:hover:text-ash-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-ash-100/15 transition-colors shrink-0"
                title="Dismiss Alert"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">
            {isOrg ? terms.stocks : "Current Stock Inventory"}
          </h1>
          <p className="text-xs text-gray-500">
            {isOrg 
              ? `Add or manage your ${terms.stocks.toLowerCase()}. Warnings for low levels appear automatically.`
              : "Add or manage your market stock. Low stock warnings appear automatically."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => { setShareOpen(true); setShareType('all'); }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-97 duration-200 cursor-pointer transition-all shrink-0"
          >
            <Share2 className="h-4 w-4" />
            <span>WhatsApp Status Catalog</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-mint-400 hover:bg-mint-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-97 duration-200 cursor-pointer transition-all shrink-0"
          >
            {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showAddForm 
              ? 'Close Form' 
              : `Add / Register New ${terms.stockItem}`}
          </button>
        </div>
      </div>

      {/* Add new stock form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end animate-fade-in">
          
          {/* Segmented offering type selector */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              {isOrg ? "Type of Resource / Program" : "Type of Offering"}
            </label>
            <div className="bg-slate-50 border border-slate-100 p-1.5 rounded-2xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => { setOfferingType('product'); setCategory('Provisions'); }}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                  offeringType === 'product'
                    ? 'bg-white text-slate-950 shadow-sm border border-slate-100/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Package className="h-4 w-4 shrink-0 text-green-600" />
                {isOrg ? "📦 Physical Goods / supplies" : "📦 Physical Goods / Trade Stock"}
              </button>
              <button
                type="button"
                onClick={() => { setOfferingType('service'); setCategory('Consultation & Tuition'); }}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                  offeringType === 'service'
                    ? 'bg-white text-slate-950 shadow-sm border border-slate-100/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Briefcase className="h-4 w-4 shrink-0 text-emerald-500" />
                {isOrg ? "💼 Service Programs / Events" : "💼 Billable Service / Labor Tariff"}
              </button>
            </div>
          </div>

          <div className="sm:col-span-2 md:col-span-3 lg:col-span-2 space-y-2">
            <label className="text-xs font-semibold text-slate-700">
              {offeringType === 'service' 
                ? (isOrg ? 'Service or Program Name' : 'Service Description / Name') 
                : `${terms.stockItem} Name / Description`}
            </label>
            <input
              type="text"
              required
              placeholder={offeringType === 'service' 
                ? (isOrg ? "e.g. Class Tuition, Baptism Ceremony, Community Outreach Fee" : "e.g. Hair Braiding Session, Generator Maintenance Service") 
                : (isOrg ? "e.g. Course Textbooks, Holy Water, School Uniforms, Utility Grains" : "e.g. Dangote Cement, Peak Milk Premium")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 focus:border-green-500 focus:bg-white text-sm px-4 py-2.5 rounded-xl focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">
              {isOrg ? "Resource Category" : "Market Category"}
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="w-full flex items-center justify-between bg-slate-50 border border-slate-100 hover:border-slate-200 focus:bg-white text-xs px-4 py-2.5 rounded-xl focus:outline-none transition-all cursor-pointer text-left select-none text-slate-800"
              >
                <span>{category}</span>
                <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-1" />
              </button>
              
              {categoryDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setCategoryDropdownOpen(false)} />
                  <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl border border-slate-200 shadow-xl p-1 z-50 max-h-60 overflow-y-auto text-xs font-sans">
                    {categories.filter(c => c !== 'All').map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setCategory(cat);
                          setCategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer ${category === cat ? 'bg-green-50/50 text-green-700 font-semibold border-l-2 border-green-500' : 'text-slate-700'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">
              {offeringType === 'service' 
                ? (isOrg ? 'Availability Level' : 'Operating Stock') 
                : 'Available Level / Registry Limit'}
            </label>
            <input
              type={offeringType === 'service' ? 'text' : 'number'}
              required={offeringType !== 'service'}
              disabled={offeringType === 'service'}
              min="0"
              placeholder={offeringType === 'service' ? (isOrg ? '∞ (Continuous Operation)' : '∞ (SLA Enabled)') : 'Total Units'}
              value={offeringType === 'service' ? (isOrg ? '∞ (Service / Program)' : '∞ (Service / Labor)') : quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 disabled:opacity-75 focus:border-green-500 focus:bg-white text-sm px-4 py-2.5 rounded-xl focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">
              {offeringType === 'service' 
                ? 'Operational Base Overhead (₦)' 
                : `${terms.costPrice} (Naira ₦)`}
            </label>
            <input
              type="number"
              required
              min="0"
              placeholder={offeringType === 'service' ? (isOrg ? "e.g. Program overhead cost limit" : "e.g. Overhead margin limit") : (isOrg ? "Cost of acquiring item" : "How much you buy am")}
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 focus:border-green-500 focus:bg-white text-sm px-4 py-2.5 rounded-xl focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">
              {offeringType === 'service' 
                ? 'Participant Contribution / Fee (₦)' 
                : `${terms.sellingPrice} (Naira ₦)`}
            </label>
            <input
              type="number"
              required
              min="0"
              placeholder={offeringType === 'service' ? (isOrg ? "e.g. Suggested collection fee" : "e.g. Booking or hourly fee") : (isOrg ? "Assessment value or contribution" : "How much you dey sell")}
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 focus:border-green-500 focus:bg-white text-sm px-4 py-2.5 rounded-xl focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Registered Date</label>
            <input
              type="date"
              required
              value={createdDate}
              onChange={(e) => setCreatedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 focus:border-green-500 focus:bg-white text-sm px-4 py-2.5 rounded-xl focus:outline-none"
            />
          </div>

          <div className="sm:col-span-1 md:col-span-1 lg:col-span-1 py-1">
            <button
              type="submit"
              className="w-full bg-mint-400 hover:bg-mint-500 text-white font-medium text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-97 duration-200 transition-all cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              {isOrg ? "Save Resource Offering" : "Save Item Offering"}
            </button>
          </div>
        </form>
      )}

      {/* Filter and search bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={isOrg ? `Search ${terms.stocks.toLowerCase()}...` : "Search stock..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 focus:border-green-500 focus:bg-white text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none"
            />
          </div>

          {/* Sort Selector Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0 font-sans">
            <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider hidden sm:inline">Sort by:</span>
            <div className="relative w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setSortByDropdownOpen(!sortByDropdownOpen)}
                className="w-full sm:w-auto bg-slate-50 border border-slate-100 hover:bg-slate-200/50 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none text-slate-700 font-semibold cursor-pointer flex items-center justify-between gap-1 select-none"
              >
                <span>
                  {{
                    '': 'Default (None)',
                    'name-asc': 'Name (A to Z)',
                    'name-desc': 'Name (Z to A)',
                    'quantity-desc': isOrg ? 'Quantity (High to Low)' : 'Quantity (High to Low)',
                    'quantity-asc': isOrg ? 'Quantity (Low to High)' : 'Quantity (Low to High)',
                    'sellingPrice-desc': isOrg ? 'Value / Fee (High to Low)' : 'Selling Price (High to Low)',
                    'sellingPrice-asc': isOrg ? 'Value / Fee (Low to High)' : 'Selling Price (Low to High)'
                  }[sortBy ? `${sortBy}-${sortOrder}` : ''] || 'Default (None)'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              </button>
              
              {sortByDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setSortByDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-full sm:w-48 bg-white rounded-xl border border-slate-200 shadow-xl p-1 z-50 max-h-60 overflow-y-auto text-xs font-sans">
                    {[
                      { value: '', label: 'Default (None)' },
                      { value: 'name-asc', label: 'Name (A to Z)' },
                      { value: 'name-desc', label: 'Name (Z to A)' },
                      { value: 'quantity-desc', label: 'Quantity (High to Low)' },
                      { value: 'quantity-asc', label: 'Quantity (Low to High)' },
                      { value: 'sellingPrice-desc', label: isOrg ? 'Value / Fee (High to Low)' : 'Selling Price (High to Low)' },
                      { value: 'sellingPrice-asc', label: isOrg ? 'Value / Fee (Low to High)' : 'Selling Price (Low to High)' }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          if (!opt.value) {
                            setSortBy(null);
                          } else {
                            const [field, order] = opt.value.split('-');
                            setSortBy(field as any);
                            setSortOrder(order as any);
                          }
                          setSortByDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer ${
                          (sortBy ? `${sortBy}-${sortOrder}` : '') === opt.value 
                            ? 'bg-green-50/50 text-green-700 font-semibold border-l-2 border-green-500' 
                            : 'text-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Categories pill selector */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
          {selectedCategory !== 'All' && (
            <button
              type="button"
              onClick={() => { setShareOpen(true); setShareType('category'); setShareCategory(selectedCategory); }}
              className="text-[11px] bg-emerald-50/90 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
              title={`Share all ${selectedCategory} products directly to WhatsApp`}
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share {selectedCategory} Catalog 💬</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid inventory / Stock table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {sortedProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 font-semibold uppercase tracking-wider select-none">
                  {/* Name column */}
                  <th 
                    onClick={() => handleSort('name')}
                    className="p-4 pl-6 cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{isOrg ? terms.stockItem : "Stock Item"}</span>
                      <span className="shrink-0">
                        {sortBy === 'name' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-green-600" /> : <ArrowDown className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </span>
                    </div>
                  </th>
                  
                  {/* Category */}
                  <th className="p-4 animate-none">Category</th>
                  
                  {/* Quantity column */}
                  <th 
                    onClick={() => handleSort('quantity')}
                    className="p-4 cursor-pointer hover:bg-slate-100 transition-colors group text-center"
                  >
                    <div className="flex items-center justify-center gap-1.5 mx-auto font-semibold uppercase tracking-wider">
                      <span>{isOrg ? "Quantity Level" : "Remaining Quantity"}</span>
                      <span className="shrink-0">
                        {sortBy === 'quantity' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-green-600" /> : <ArrowDown className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </span>
                    </div>
                  </th>
                  
                  {/* Cost Price */}
                  <th className="p-4 text-right">{isOrg ? terms.costPrice : "Cost Price"}</th>
                  
                  {/* Selling Price column */}
                  <th 
                    onClick={() => handleSort('sellingPrice')}
                    className="p-4 cursor-pointer hover:bg-slate-100 transition-colors group text-right"
                  >
                    <div className="flex items-center justify-end gap-1.5 ml-auto font-semibold uppercase tracking-wider">
                      <span>{isOrg ? terms.sellingPrice : "Selling Price"}</span>
                      <span className="shrink-0">
                        {sortBy === 'sellingPrice' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-green-600" /> : <ArrowDown className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </span>
                    </div>
                  </th>
                  
                  <th className="p-4 text-right">{isOrg ? "Net Surplus Potential" : "Expected Margin / Gain"}</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sortedProducts.map(p => {
                  const isCritical = (!p.type || p.type !== 'service') && p.quantity < 3;
                  const isLowAlert = (!p.type || p.type !== 'service') && p.quantity >= 3 && p.quantity < 5;
                  const isLowAny = (!p.type || p.type !== 'service') && p.quantity < 5;
                  const totalProfitPotential = p.type === 'service' ? (p.sellingPrice - p.costPrice) : ((p.sellingPrice - p.costPrice) * p.quantity);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-all text-slate-700">
                      {/* Name */}
                      <td className="p-4 pl-6 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          {p.type === 'service' ? (
                            <Briefcase className="h-4.5 w-4.5 p-0.5 rounded bg-purple-50 text-purple-600 border border-purple-150/40 shrink-0" />
                          ) : (
                            <Package className={`h-4.5 w-4.5 p-0.5 rounded ${
                              isCritical 
                                ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 animate-pulse border border-red-200/50 dark:border-red-500/30' 
                                : isLowAlert 
                                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' 
                                  : 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400'
                            }`} />
                          )}
                          <div>
                            <span 
                              onClick={() => setSelectedProduct(p)}
                              className="block hover:underline hover:text-green-600 cursor-pointer text-slate-900 font-bold transition-colors"
                              title="Click for Price History Chart & Details"
                            >
                              {p.name}
                            </span>
                            {p.type === 'service' && (
                              <span className="inline-flex items-center bg-purple-50 text-purple-700 text-[9px] px-1.5 py-0.5 rounded border border-purple-200/50 font-semibold mt-0.5 uppercase tracking-wider animate-none">
                                {isOrg ? "💼 Provided Service / Program" : "💼 Billable Service Unit"}
                              </span>
                            )}
                            {isCritical && p.type !== 'service' && (
                              <span className="inline-flex items-center gap-0.5 bg-red-50 text-red-600 dark:bg-red-950 text-[10px] px-1.5 py-0.5 rounded-full font-bold mt-0.5 border border-red-200 dark:border-red-500/30 animate-pulse">
                                <AlertTriangle className="h-3 w-3 text-red-500 dark:text-red-400" />
                                Critical: {p.quantity} Left!
                              </span>
                            )}
                            {isLowAlert && p.type !== 'service' && (
                              <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/40 text-[10px] px-1.5 py-0.5 rounded font-bold mt-0.5">
                                <AlertTriangle className="h-3 w-3 text-amber-500" />
                                {isOrg ? "Refill Alert!" : "Restock Alert!"}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">
                          {p.category || 'Provisions'}
                        </span>
                      </td>

                      {/* Remaining Qty */}
                      <td className="p-4 text-center">
                        {editingId === p.id ? (
                          p.type === 'service' ? (
                            <span className="text-slate-400 text-xs italic font-semibold font-sans">Unlimited</span>
                          ) : (
                            <input
                             type="number"
                             value={editQty}
                             onChange={(e) => setEditQty(e.target.value)}
                             className="w-16 bg-white border border-slate-200 text-center py-1 rounded focus:outline-none font-bold"
                           />
                          )
                        ) : (
                          p.type === 'service' ? (
                            <span className="text-emerald-600 font-semibold bg-emerald-50 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-sans select-none">
                              ∞ Continuous
                            </span>
                          ) : (
                            <span className={`font-mono text-sm font-bold ${
                              isCritical 
                                ? 'text-red-600 dark:text-red-400' 
                                : isLowAlert 
                                  ? 'text-amber-600 dark:text-amber-450' 
                                  : 'text-slate-950 dark:text-ash-900'
                            }`}>
                              {p.quantity} Units
                            </span>
                          )
                        )}
                      </td>

                      {/* Cost */}
                      <td className="p-4 text-right font-mono">
                        {editingId === p.id ? (
                          <input
                            type="number"
                            value={editCost}
                            onChange={(e) => setEditCost(e.target.value)}
                            className="w-20 bg-white border border-slate-200 text-right py-1 px-1.5 rounded focus:outline-none"
                          />
                        ) : (
                          formatNaira(p.costPrice)
                        )}
                        {p.type === 'service' && <span className="block text-[9px] text-slate-400 font-sans mt-0.5">(Overhead)</span>}
                      </td>

                      {/* Selling */}
                      <td className="p-4 text-right font-mono">
                        {editingId === p.id ? (
                          <input
                            type="number"
                            value={editSell}
                            onChange={(e) => setEditSell(e.target.value)}
                            className="w-20 bg-white border border-slate-200 text-right py-1 px-1.5 rounded focus:outline-none"
                          />
                        ) : (
                          formatNaira(p.sellingPrice)
                        )}
                        {p.type === 'service' && <span className="block text-[9px] text-purple-600 font-sans mt-0.5">(Tariff)</span>}
                      </td>

                      {/* Margin */}
                      <td className="p-4 text-right font-semibold text-emerald-700 font-mono">
                        {formatNaira(totalProfitPotential)}
                        {p.type === 'service' && <span className="block text-[9px] text-slate-400 font-sans mt-0.5 font-normal">(Per Invoice)</span>}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        {editingId === p.id ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => saveInlineEdit(p.id)}
                              className="bg-green-600 hover:bg-green-700 text-white p-1 rounded shadow-sm"
                              title="Save Changes"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={cancelInlineEdit}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-1 rounded"
                              title="Cancel"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => { setShareOpen(true); setShareType('single'); setShareProduct(p); }}
                              className="text-slate-400 hover:text-emerald-600 p-1 rounded hover:bg-emerald-50 transition-colors"
                              title="Share on WhatsApp / Catalog Promo"
                            >
                              <Share2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedProduct(p)}
                              className="text-slate-400 hover:text-emerald-600 p-1 rounded hover:bg-slate-100 transition-colors"
                              title="Price History Details Chart"
                            >
                              <LucideLineChart className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => startInlineEdit(p)}
                              className="text-slate-400 hover:text-green-600 p-1 rounded hover:bg-slate-100 transition-colors"
                              title="Edit Stack"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 flex flex-col items-center justify-center gap-2">
            <FolderOpen className="h-8 w-8 text-gray-300" />
            <p className="text-xs text-gray-400 mt-2">No matching inventory items found.</p>
          </div>
        )}
      </div>

      {/* Modern Confirmation Modal overlay */}
      <CustomConfirmModal
        isOpen={confirmOpen}
        title={confirmTitle}
        message={confirmMsg}
        confirmText="Yes, delete item"
        cancelText="No, keep it"
        isDanger={true}
        onConfirm={() => {
          if (confirmAction) confirmAction();
        }}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Modern WhatsApp Status Catalog Share Modal */}
      {shareOpen && (() => {
        const generateShareContent = () => {
          let text = `🛍️ *${businessProfile?.businessName || 'Our Store'} Catalog*\n`;
          text += `Explore our latest price list & reply to place orders directly!\n`;
          text += `=========================\n\n`;

          if (shareType === 'single' && shareProduct) {
            text = `🌟 *EXCLUSIVE DEAL - ${businessProfile?.businessName || 'Our Store'}* 🌟\n\n`;
            text += `📦 *${shareProduct.name}*\n`;
            text += `🏷️ *Category:* ${shareProduct.category || 'General'}\n`;
            text += `💰 *Promo Price:* ${formatNaira(shareProduct.sellingPrice)}\n`;
            if (shareProduct.type !== 'service') {
              text += `🔥 _In Stock: Only ${shareProduct.quantity} units left!_\n`;
            }
            text += `\n📲 _Tap the link below or reply to order instantly on WhatsApp!_`;
          } else {
            const targetCategory = shareType === 'category' ? shareCategory : 'All';
            const prodList = products.filter(p => targetCategory === 'All' || p.category === targetCategory);
            
            const catsInList = Array.from(new Set(prodList.map(p => p.category || 'General')));
            
            catsInList.forEach(cat => {
              const catProds = prodList.filter(p => (p.category || 'General') === cat);
              if (catProds.length > 0) {
                text += `📂 *CATEGORY: ${cat.toUpperCase()}*\n`;
                catProds.forEach(p => {
                  text += `▪️ ${p.name} — *${formatNaira(p.sellingPrice)}*\n`;
                });
                text += `\n`;
              }
            });
          }

          text += `📍 *Store Location:* ${businessProfile?.address || 'Nigeria'}\n`;
          text += `📞 *Send orders directly via call/message!*`;
          
          const url = `${window.location.origin}${window.location.pathname}?catalog=true&store=${encodeURIComponent(businessProfile?.businessName || 'Sabisell')}`;
          return { text, url };
        };

        const { text, url } = generateShareContent();
        const fullMessage = `${text}\n\n🌐 View our Live Web Catalogue:\n${url}`;

        const handleCopyText = () => {
          navigator.clipboard.writeText(fullMessage);
          setCopyFeedback(true);
          setTimeout(() => setCopyFeedback(false), 2000);
        };

        const handleCopyLink = () => {
          navigator.clipboard.writeText(url);
          setCopyFeedback(true);
          setTimeout(() => setCopyFeedback(false), 2000);
        };

        const handleShareWhatsApp = () => {
          const waUrl = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;
          window.open(waUrl, '_blank');
        };

        return (
          <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
            <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl border border-slate-100 animate-slide-up flex flex-col max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 select-none">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl leading-none">💬</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">Generate WhatsApp Promotion</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Broadcast interactive menu list directly</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShareOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Segmented Selection Type */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Broadcasting Scope</label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-50 border border-slate-100 p-1 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => { setShareType('all'); }}
                      className={`text-[11px] font-semibold py-2 rounded-xl transition-all cursor-pointer ${shareType === 'all' ? 'bg-white text-emerald-700 shadow-3xs' : 'text-slate-600 hover:bg-white/50'}`}
                    >
                      Entire Store
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShareType('category'); setShareCategory(selectedCategory === 'All' ? 'Provisions' : selectedCategory); }}
                      className={`text-[11px] font-semibold py-2 rounded-xl transition-all cursor-pointer ${shareType === 'category' ? 'bg-white text-emerald-700 shadow-3xs' : 'text-slate-600 hover:bg-white/50'}`}
                    >
                      Category
                    </button>
                    <button
                      type="button"
                      onClick={() => { 
                        setShareType('single'); 
                        if (!shareProduct && products.length > 0) setShareProduct(products[0]); 
                      }}
                      className={`text-[11px] font-semibold py-2 rounded-xl transition-all cursor-pointer ${shareType === 'single' ? 'bg-white text-emerald-700 shadow-3xs' : 'text-slate-600 hover:bg-white/50'}`}
                    >
                      Single Product
                    </button>
                  </div>
                </div>

                {/* Conditional fields based on type */}
                {shareType === 'category' && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Choose Category</label>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 border border-slate-105 rounded-xl">
                      {categories.filter(c => c !== 'All').map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setShareCategory(cat)}
                          className={`text-[10px] font-medium px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all ${shareCategory === cat ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {shareType === 'single' && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Choose Product</label>
                    <select
                      value={shareProduct?.id || ''}
                      onChange={(e) => {
                        const pm = products.find(p => p.id === e.target.value);
                        if (pm) setShareProduct(pm);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({formatNaira(p.sellingPrice)})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Live Preview Text Block */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold text-slate-400">WhatsApp Broadcast Post Preview</label>
                    {copyFeedback && (
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 animate-ping font-semibold leading-none">
                        Copied! ✅
                      </span>
                    )}
                  </div>
                  <div className="bg-slate-950 text-slate-350 p-4 rounded-2xl text-[10px] font-mono whitespace-pre-wrap max-h-44 overflow-y-auto leading-relaxed border border-slate-900 select-all selection:bg-emerald-800">
                    {text}
                    {`\n\n🌐 View our Live Web Catalogue:\n${url}`}
                  </div>
                </div>

                {/* Simulated catalog link preview bar */}
                <div className="p-3 bg-rose-50 border border-rose-100/50 rounded-2xl flex items-center justify-between gap-1.5 select-none animate-none">
                  <div className="min-w-0">
                    <span className="text-[8px] font-bold text-rose-500 uppercase block tracking-wider leading-none">Interactive Storefront Route</span>
                    <span className="text-[10px] font-semibold text-rose-700 truncate block mt-1 pr-1">sabisell.online?catalog=true</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                        setShareOpen(false);
                        if (onNavigate) {
                          onNavigate('public-catalog');
                        } else {
                          window.history.pushState({}, '', `?catalog=true&store=${encodeURIComponent(businessProfile?.businessName || 'Sabisell')}`);
                          window.location.reload();
                        }
                    }}
                    className="shrink-0 text-[10px] font-bold text-rose-800 hover:text-rose-900 underline flex items-center gap-1 cursor-pointer"
                  >
                    🚀 App Live Test
                  </button>
                </div>

                {/* Operations CTAs */}
                <div className="flex items-center gap-2 pt-1 font-sans">
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl cursor-pointer select-none transition-colors"
                  >
                    Copy Text Block
                  </button>
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-97 hover:scale-101"
                  >
                    <span>💬</span>
                    <span>Share to WhatsApp</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Selected Product Price History Details Overlay Panel */}
      {selectedProduct && (() => {
        // Find matching history
        const matchedHistory = priceHistory.filter(h => h.productId === selectedProduct.id);
        const sortedHist = [...matchedHistory].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        // Gather statistics
        const currentCost = selectedProduct.costPrice;
        const currentSell = selectedProduct.sellingPrice;
        const markup = currentSell - currentCost;
        const marginPercentage = currentCost > 0 ? Math.round((markup / currentCost) * 100) : 0;
        const inventoryStockValue = selectedProduct.quantity * currentCost;
        const inventoryExpectedRevenue = selectedProduct.quantity * currentSell;

        // Generate data for Recharts
        const getChartDataPoints = () => {
          if (sortedHist.length >= 2) {
            return sortedHist.map((h) => {
              const d = new Date(h.timestamp);
              return {
                name: d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }),
                'Cost Price': h.costPrice,
                'Selling Price': h.sellingPrice,
                rawDate: d
              };
            });
          }

          // Visual Extrapolation fallback if there are not enough historical data points
          const baseC = currentCost;
          const baseS = currentSell;
          return [
            {
              name: 'May 10 (Setup)',
              'Cost Price': Math.round(baseC * 0.90),
              'Selling Price': Math.round(baseS * 0.92),
            },
            {
              name: 'May 17 (Restock)',
              'Cost Price': Math.round(baseC * 0.95),
              'Selling Price': Math.round(baseS * 0.96),
            },
            {
              name: 'May 24 (Match Block)',
              'Cost Price': Math.round(baseC * 1.02),
              'Selling Price': Math.round(baseS * 0.98),
            },
            {
              name: 'Current Setting',
              'Cost Price': baseC,
              'Selling Price': baseS,
            }
          ];
        };

        const chartData = getChartDataPoints();

        return (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl cursor-default p-6 w-full max-w-2xl shadow-xl border border-slate-100/90 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="bg-green-50 text-green-700 p-2.5 rounded-2xl border border-green-100">
                    <History className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 leading-snug">
                      {isOrg ? "Value & Asset Assessment Analysis" : "Price Trend Analysis"}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium animate-none">
                      {isOrg 
                        ? `Coordinator, view details for "${selectedProduct.name}"`
                        : `Oga, view details for "${selectedProduct.name}"`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  title="Close Pane"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Quick statistics widgets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 select-none font-sans">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {isOrg ? "Stock Cost Price" : "Buying/Cost price"}
                  </span>
                  <p className="text-base font-bold text-slate-800 font-mono mt-1">{formatNaira(currentCost)}</p>
                  <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                    {isOrg ? `Total Cost of Stock: ${formatNaira(inventoryStockValue)}` : `Asset Value: ${formatNaira(inventoryStockValue)}`}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {isOrg ? "Stock Selling Price" : "Retail/Selling Price"}
                  </span>
                  <p className="text-base font-bold text-green-700 font-mono mt-1">{formatNaira(currentSell)}</p>
                  <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                    {isOrg ? `Total Selling Value: ${formatNaira(inventoryExpectedRevenue)}` : `Yield Value: ${formatNaira(inventoryExpectedRevenue)}`}
                  </span>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3.5">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
                    {isOrg ? "Surplus Target" : "Net Margin Target"}
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <p className="text-base font-extrabold text-emerald-800 font-mono">+{marginPercentage}%</p>
                    <span className="text-xs text-emerald-600 font-bold font-mono">({formatNaira(markup)})</span>
                  </div>
                  <span className="text-[10px] text-emerald-600/70 font-bold block mt-0.5">
                    {isOrg ? "Expected asset surplus markup" : "Expected profit markup"}
                  </span>
                </div>
              </div>

              {/* Line Chart */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                    Price Changes Timeline Graph
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                    {sortedHist.length >= 2 ? 'Real logs' : 'Extrapolated estimate'}
                  </span>
                </div>

                <div className="w-full h-64 bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} 
                        stroke="#cbd5e1"
                      />
                      <YAxis 
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 650 }} 
                        stroke="#cbd5e1"
                        tickFormatter={(v) => `₦${v}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          fontSize: '11px',
                          fontFamily: 'monospace'
                        }}
                        formatter={(value) => [formatNaira(Number(value)), '']}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '5px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Cost Price" 
                        stroke="#64748b" 
                        strokeWidth={2.5} 
                        activeDot={{ r: 6 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Selling Price" 
                        stroke="#10b981" 
                        strokeWidth={2.5} 
                        activeDot={{ r: 6 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Price Timeline Activity Log list */}
              <div>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-3 uppercase tracking-wide">
                  Historical Log Timeline list
                </span>

                {sortedHist.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-2xl divide-y divide-slate-50">
                    {sortedHist.map((log, i) => {
                      const prevLog = i > 0 ? sortedHist[i - 1] : null;
                      const costDiff = prevLog ? log.costPrice - prevLog.costPrice : 0;
                      const sellDiff = prevLog ? log.sellingPrice - prevLog.sellingPrice : 0;

                      return (
                        <div key={log.id} className="p-3 hover:bg-slate-50/50 transition-colors flex items-center justify-between text-xs text-slate-700">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                              #{i + 1}
                            </span>
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800">
                                Price Configuration Record
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {new Date(log.timestamp).toLocaleDateString('en-NG', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right font-mono text-[11px] grid grid-cols-2 gap-x-4">
                            <div>
                              <span className="block text-slate-400 font-bold text-[9px] uppercase tracking-wider">Cost</span>
                              <span className="font-semibold">{formatNaira(log.costPrice)}</span>
                              {costDiff !== 0 && (
                                <span className={`block text-[9px] font-bold ${costDiff > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                  {costDiff > 0 ? `▲ +${costDiff}` : `▼ ${costDiff}`}
                                </span>
                              )}
                            </div>
                            <div>
                              <span className="block text-slate-400 font-bold text-[9px] uppercase tracking-wider">Selling</span>
                              <span className="font-semibold text-green-700">{formatNaira(log.sellingPrice)}</span>
                              {sellDiff !== 0 && (
                                <span className={`block text-[9px] font-bold ${sellDiff > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                  {sellDiff > 0 ? `▲ +${sellDiff}` : `▼ ${sellDiff}`}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100 flex flex-col items-center gap-1.5 py-8">
                    <History className="h-6 w-6 text-slate-350" />
                    <p className="text-[11px] text-slate-400 font-medium max-w-sm">
                      {isOrg 
                        ? "Coordinator, no value logs recorded for this item yet. Modify the stocking values inline to register official history points!"
                        : "Oga, no manual pricing logs recorded for this item yet. Modify the stocking prices inline to register official history points!"}
                    </p>
                  </div>
                )}
              </div>
              
            </div>
          </div>
        );
      })()}
    </div>
  );
}
