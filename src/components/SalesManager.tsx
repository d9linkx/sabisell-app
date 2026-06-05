import React, { useState } from 'react';
import { 
  ShoppingCart, 
  User, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  Plus, 
  AlertCircle,
  TrendingUp,
  CreditCard,
  Check,
  PhoneCall,
  Trash,
  ChevronDown
} from 'lucide-react';
import { Product, Sale, BusinessProfile, isOrganizationCategory, getOrganizationTerminology } from '../types';
import { CustomAlertModal, CustomConfirmModal, CustomPromptModal } from './Modal';

interface SalesManagerProps {
  products: Product[];
  sales: Sale[];
  onAddSale: (sale: Omit<Sale, 'id' | 'timestamp'> & { timestamp?: string }) => void;
  onUpdateSale: (id: string, updated: Partial<Sale>) => void;
  onDeleteSale: (id: string) => void;
  businessProfile?: BusinessProfile;
}

export default function SalesManager({ products, sales, onAddSale, onUpdateSale, onDeleteSale, businessProfile }: SalesManagerProps) {
  const isOrg = businessProfile ? isOrganizationCategory(businessProfile.category) : false;
  const terms = getOrganizationTerminology(businessProfile?.category || '', isOrg);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [saleDate, setSaleDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // Custom Modal States
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'warning' | 'error' | 'info'>('info');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMsg, setConfirmMsg] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  const [promptOpen, setPromptOpen] = useState(false);
  const [promptTitle, setPromptTitle] = useState('');
  const [promptMsg, setPromptMsg] = useState('');
  const [promptValue, setPromptValue] = useState('');
  const [promptAction, setPromptAction] = useState<((val: string) => void) | null>(null);

  const [productDropdownOpen, setProductDropdownOpen] = useState(false);

  // Selected product details
  const activeProduct = products.find(p => p.id === selectedProductId);

  // Form calculations
  const unitPrice = activeProduct ? activeProduct.sellingPrice : 0;
  const quantityNum = Number(quantity) || 1;
  const totalAmount = unitPrice * quantityNum;
  const amountPaidNum = Number(amountPaid) || 0;
  const balanceDebt = Math.max(0, totalAmount - amountPaidNum);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !activeProduct || quantityNum <= 0) return;

    if (activeProduct.type !== 'service' && quantityNum > activeProduct.quantity) {
      setAlertTitle(isOrg ? 'Insufficient Resources' : 'Insufficient Stock');
      setAlertMsg(isOrg 
        ? `Coordinator, registry only has ${activeProduct.quantity} units remaining! Reduce your requested quantity.`
        : `Oga, stock only has ${activeProduct.quantity} units remaining! Reduce your order quantity.`);
      setAlertType('warning');
      setAlertOpen(true);
      return;
    }

    const paymentStatus = balanceDebt === 0 
      ? 'PAID' 
      : amountPaidNum > 0 ? 'PARTIAL' : 'UNPAID';

    onAddSale({
      productId: selectedProductId,
      productName: activeProduct.name,
      quantity: quantityNum,
      unitPrice,
      totalAmount,
      amountPaid: amountPaidNum,
      balanceDebt,
      customerName: customerName.trim() || 'Walk-in Customer',
      paymentStatus,
      timestamp: saleDate ? new Date(saleDate).toISOString() : undefined
    });

    // Reset fields
    setSelectedProductId('');
    setQuantity('1');
    setCustomerName('');
    setCustomerPhone('');
    setAmountPaid('');
  };

  const handleClearDebt = (sale: Sale, paymentAmount: number) => {
    const newPaid = sale.amountPaid + paymentAmount;
    const newDebt = Math.max(0, sale.totalAmount - newPaid);
    const newStatus = newDebt === 0 ? 'PAID' : 'PARTIAL';
    
    onUpdateSale(sale.id, {
      amountPaid: newPaid,
      balanceDebt: newDebt,
      paymentStatus: newStatus
    });
  };

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Generate WhatsApp Invoice
  const generateWhatsAppLink = (sale: Sale) => {
    const cleanedPhone = customerPhone.replace(/\s+/g, '').replace(/^\+/, '');
    // Support Nigerian number conversions (e.g. 08123... to 2348123...)
    let parsedPhone = cleanedPhone;
    if (cleanedPhone.startsWith('0')) {
      parsedPhone = '234' + cleanedPhone.slice(1);
    }

    const businessTitle = businessProfile?.businessName ? `${businessProfile.businessName} Reminder` : "Sabisell Reminder";
    const greeting = `${businessProfile?.whatsappGreeting || "Hello, well done! Here na Sabisell Invoice for the standard goods wey you carry:"} ${sale.customerName}`;
    const itemDetails = `• ${sale.quantity}x ${sale.productName} for ${formatNaira(sale.totalAmount)}`;
    const paymentReport = `You pay: ${formatNaira(sale.amountPaid)}\n*Outstanding balance remaining: ${formatNaira(sale.balanceDebt)}*`;
    const politeSignoff = businessProfile?.whatsappReminderSuffix || `Please, fit negotiate or pay directly into my bank account. Thank you for your business!`;

    const invoiceText = `${greeting}\n\n${itemDetails}\n\n${paymentReport}\n\n${politeSignoff}`;
    
    return `https://wa.me/${parsedPhone}?text=${encodeURIComponent(invoiceText)}`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Record Sales Form */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-display font-bold text-slate-900 animate-none">
              {isOrg ? `${terms.sellItem}` : "Record Instantly"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Select Product */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {isOrg ? `Select Registered ${terms.stockItem}` : "Select Stock Product"}
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProductDropdownOpen(!productDropdownOpen)}
                  className="w-full flex items-center justify-between bg-slate-50 border border-slate-100 hover:border-slate-200 focus:bg-white text-xs px-4 py-2.5 rounded-xl focus:outline-none transition-all cursor-pointer text-left select-none text-slate-800 font-sans"
                >
                  <span className="truncate">
                    {activeProduct 
                      ? `${activeProduct.type === 'service' ? '💼 [Service] ' : ''}${activeProduct.name} ${activeProduct.type === 'service' ? `(Unlimited)` : `(${activeProduct.quantity} left)`} - ${formatNaira(activeProduct.sellingPrice)}`
                      : (isOrg ? `-- Choose Registered ${terms.stockItem} --` : '-- Choose Stock Item --')}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-1" />
                </button>
                
                {productDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setProductDropdownOpen(false)} />
                    <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl border border-slate-200 shadow-xl p-1 z-50 max-h-60 overflow-y-auto text-xs font-sans">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProductId('');
                          setAmountPaid('');
                          setProductDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer ${selectedProductId === '' ? 'bg-green-50/50 text-green-700 font-semibold' : 'text-slate-700'}`}
                      >
                        {isOrg ? `-- Choose Registered ${terms.stockItem} --` : '-- Choose Stock Item --'}
                      </button>
                      {products.map(p => {
                        const isService = p.type === 'service';
                        const isDisabled = !isService && p.quantity <= 0;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              setSelectedProductId(p.id);
                              setAmountPaid('');
                              setProductDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg disabled:opacity-45 transition-colors cursor-pointer ${isDisabled ? 'bg-slate-100/50 text-slate-400' : 'hover:bg-slate-50'} ${selectedProductId === p.id ? 'bg-green-50/50 text-green-700 font-semibold border-l-2 border-green-500' : 'text-slate-700'}`}
                          >
                            {isService ? '💼 [Service] ' : ''}{p.name} {isService ? `(Unlimited)` : `(${p.quantity} left)`} - {formatNaira(p.sellingPrice)}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Sale Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {isOrg ? "Registration Record Date" : "Sale Date"}
              </label>
              <input
                type="date"
                required
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 focus:border-green-500 focus:bg-white text-sm px-4 py-2.5 rounded-xl focus:outline-none"
              />
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {isOrg ? "Enrollment / Assessment Quantity" : "Purchase Quantity"}
              </label>
              <input
                type="number"
                required
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 focus:border-green-500 focus:bg-white text-sm px-4 py-2.5 rounded-xl focus:outline-none"
              />
            </div>

            {/* Customer Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {isOrg ? `${terms.customer} Name` : "Customer Name"}
              </label>
              <input
                type="text"
                placeholder={isOrg ? `e.g. Registered ${terms.customer}` : "Mama Chioma, Amaka, Baba Tunde"}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 focus:border-green-500 focus:bg-white text-sm px-4 py-2.5 rounded-xl focus:outline-none"
              />
            </div>

            {/* Customer Number (WhatsApp) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {isOrg ? `${terms.customer} WhatsApp Number` : "Customer WhatsApp Number"}
              </label>
              <input
                type="tel"
                placeholder="e.g. 08031234567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 focus:border-green-500 focus:bg-white text-sm px-4 py-2.5 rounded-xl focus:outline-none"
              />
              <p className="text-[10px] text-gray-400">
                {isOrg 
                  ? "Used for automated WhatsApp slips and repayment reminders."
                  : "Used for automated WhatsApp invoices/payment reminders."}
              </p>
            </div>

            {/* Amount Paid instantly */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {isOrg ? "Amount Paid Now / Deposit (₦)" : "Amount Paid Instantly (Naira ₦)"}
              </label>
              <input
                type="number"
                min="0"
                placeholder={isOrg ? "Deposit pay amount" : "How much deposit they pay"}
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 focus:border-green-500 focus:bg-white text-sm px-4 py-2.5 rounded-xl focus:outline-none"
              />
            </div>

            {/* Transaction Review */}
            {activeProduct && (
              <div className="p-4 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100 font-sans">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>{isOrg ? "Unit Value / Fee Rate:" : "Unit Selling Price:"}</span>
                  <span className="font-semibold">{formatNaira(unitPrice)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>{isOrg ? "Total Amount Required:" : "Total Due Price:"}</span>
                  <span className="font-semibold">{formatNaira(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-red-650 border-t border-slate-200/50 pt-1.5">
                  <span className="font-semibold">{isOrg ? `Outstanding Balance (${terms.debt}):` : "Debtor Balance:"}</span>
                  <span className="font-bold font-mono">{formatNaira(balanceDebt)}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedProductId}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-display font-semibold py-3 px-4 rounded-xl text-center text-xs flex items-center justify-center gap-1 shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              {isOrg ? `Save ${terms.sale}` : "Save Sales Transaction"}
            </button>
          </form>
        </div>

        {/* Ledger logs & active debt accounts */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6 font-sans">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-display font-bold text-slate-900">
                {isOrg ? `Recent Activity Logs & ${terms.sales}` : "Recent Sales Ledgers"}
              </h2>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-semibold">
              {sales.length} Logs recorded
            </span>
          </div>

          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
            {sales.length > 0 ? (
              sales.slice().reverse().map(sale => {
                const hasDebt = sale.balanceDebt > 0;
                return (
                  <div key={sale.id} className="p-4 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white hover:border-slate-200 hover:shadow-sm transition-all">
                    {/* Customer & Product details */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <h4 className="font-display font-semibold text-slate-900">{sale.customerName}</h4>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          sale.paymentStatus === 'PAID' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : sale.paymentStatus === 'PARTIAL' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {sale.paymentStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {isOrg ? "Registered" : "Bought"}: <span className="font-medium text-slate-800">{sale.quantity}x {sale.productName}</span> on {new Date(sale.timestamp).toLocaleDateString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>Total: <strong className="text-slate-800 font-mono">{formatNaira(sale.totalAmount)}</strong></span>
                        <span>Paid: <strong className="text-slate-800 font-mono">{formatNaira(sale.amountPaid)}</strong></span>
                      </div>
                    </div>

                    {/* Actions and details */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      {/* Remainder Debt or cleared status */}
                      <div className="text-left md:text-right">
                        {hasDebt ? (
                          <>
                            <p className="text-[10px] text-red-500 font-semibold uppercase">{isOrg ? "Owed Balance" : "Owes Balance"}</p>
                            <p className="font-mono font-bold text-red-600 text-sm">{formatNaira(sale.balanceDebt)}</p>
                          </>
                        ) : (
                          <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl text-xs font-semibold">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Cleared
                          </div>
                        )}
                      </div>

                      {/* Interactive Clear Debt and Reminders */}
                      <div className="flex items-center gap-2">
                        {hasDebt && (
                          <button
                            type="button"
                            onClick={() => {
                              setPromptTitle(`Update ${terms.debt}`);
                              setPromptMsg(`Amount outstanding: ${formatNaira(sale.balanceDebt)}. Enter repayment amount paid by ${sale.customerName} (Naira ₦):`);
                              setPromptValue(sale.balanceDebt.toString());
                              setPromptAction(() => (val: string) => {
                                const payNum = Number(val);
                                if (!isNaN(payNum) && payNum > 0) {
                                  handleClearDebt(sale, payNum);
                                }
                                setPromptOpen(false);
                              });
                              setPromptOpen(true);
                            }}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-750 font-display font-bold text-[11px] py-1.5 px-3 rounded-lg border border-emerald-200 cursor-pointer"
                          >
                            Update Pay
                          </button>
                        )}
                        
                        {customerPhone && hasDebt && (
                          <a
                            href={generateWhatsAppLink(sale)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-50 hover:bg-green-50 text-slate-600 hover:text-green-700 border border-slate-100 p-1.5 rounded-lg transition-all"
                            title="Send WhatsApp Debt Reminder"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </a>
                        )}

                        {/* Beautiful custom Delete button */}
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmTitle(`Delete ${terms.sale} Record`);
                            setConfirmMsg(`Are you sure you want to permanently delete this transaction for "${sale.customerName}" (${formatNaira(sale.totalAmount)})? This action cannot be undone.`);
                            setConfirmAction(() => () => {
                              onDeleteSale(sale.id);
                              setConfirmOpen(false);
                            });
                            setConfirmOpen(true);
                          }}
                          className="bg-red-50 hover:bg-red-105 text-red-655 border border-red-100 p-1.5 rounded-lg transition-all cursor-pointer"
                          title={`Delete ${terms.sale} Record`}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-slate-50 border border-slate-100 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2">
                <ShoppingCart className="h-8 w-8 text-gray-300" />
                <p className="text-xs text-gray-400">No trading logs on record. Write your first above.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Universal Popups & Modals */}
      <CustomAlertModal
        isOpen={alertOpen}
        title={alertTitle}
        message={alertMsg}
        type={alertType}
        onClose={() => setAlertOpen(false)}
      />

      <CustomConfirmModal
        isOpen={confirmOpen}
        title={confirmTitle}
        message={confirmMsg}
        confirmText="Yes, delete record"
        isDanger={true}
        onConfirm={() => {
          if (confirmAction) confirmAction();
        }}
        onCancel={() => setConfirmOpen(false)}
      />

      <CustomPromptModal
        isOpen={promptOpen}
        title={promptTitle}
        message={promptMsg}
        defaultValue={promptValue}
        confirmText="Confirm repayment"
        inputType="number"
        onConfirm={(val) => {
          if (promptAction) promptAction(val);
        }}
        onCancel={() => {
          setPromptOpen(false);
        }}
      />
    </div>
  );
}
