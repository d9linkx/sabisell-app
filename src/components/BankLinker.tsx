import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Copy, 
  CheckCircle, 
  Plus, 
  Loader2, 
  Sparkles, 
  FileText, 
  MessageSquare,
  AlertCircle,
  Share2,
  Trash2,
  Check,
  ShieldCheck,
  CreditCard,
  Send,
  ArrowRight,
  Edit2
} from 'lucide-react';
import { Sale, BusinessProfile } from '../types';

interface BankLinkerProps {
  sales: Sale[];
  onUpdateSale: (id: string, updated: Partial<Sale>) => void;
  onApplyParsedRepayment: (repaymentResult: { amount: number; senderName: string; bankName: string }) => void;
  businessProfile?: BusinessProfile;
}

interface BusinessBankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
}

interface DirectPaymentRecord {
  id: string;
  customerName: string;
  amount: number;
  saleId: string | null;
  receivingBank: string;
  referenceNotes: string;
  timestamp: string;
}

export default function BankLinker({ sales, onUpdateSale, onApplyParsedRepayment, businessProfile }: BankLinkerProps) {
  const [bankAccounts, setBankAccounts] = useState<BusinessBankAccount[]>([]);
  const [paymentRecords, setPaymentRecords] = useState<DirectPaymentRecord[]>([]);
  
  // Create Direct Account Form States
  const [newBankName, setNewBankName] = useState('');
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newAccName, setNewAccName] = useState('');
  const [showConfigForm, setShowConfigForm] = useState(false);

  // Record manual direct payment states
  const [selectedSaleId, setSelectedSaleId] = useState('');
  const [customCustomerName, setCustomCustomerName] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedBankId, setSelectedBankId] = useState('');
  const [referenceNotes, setReferenceNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Copied alert SMS parser State
  const [smsText, setSmsText] = useState('');
  const [parsingSms, setParsingSms] = useState(false);
  const [parsedSmsResult, setParsedSmsResult] = useState<any | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const [copiedAccountId, setCopiedAccountId] = useState<string | null>(null);

  // Outstanding Debtors List
  const debtors = sales.filter(s => s.balanceDebt > 0);

  useEffect(() => {
    // 1. Initial Default Business Accounts Config (persisted to localStorage)
    const savedAccounts = localStorage.getItem('oga_business_accounts');
    if (savedAccounts) {
      setBankAccounts(JSON.parse(savedAccounts));
    } else {
      const defaultAccounts: BusinessBankAccount[] = [
        { id: 'acc-1', bankName: 'Access Bank', accountNumber: '0088912871', accountName: 'Sabisell Retail Direct', isDefault: true },
        { id: 'acc-2', bankName: 'Zenith Bank', accountNumber: '1019283741', accountName: 'Sabisell SME Operations', isDefault: false }
      ];
      setBankAccounts(defaultAccounts);
      localStorage.setItem('oga_business_accounts', JSON.stringify(defaultAccounts));
    }

    // 2. Direct payment records logs
    const savedRecords = localStorage.getItem('oga_direct_payment_records');
    if (savedRecords) {
      setPaymentRecords(JSON.parse(savedRecords));
    } else {
      const sampleRecords: DirectPaymentRecord[] = [
        {
          id: 'pay-rec-1',
          customerName: 'Baba Tunde',
          amount: 45000,
          saleId: null,
          receivingBank: 'Access Bank (0088912871)',
          referenceNotes: 'Paid cash transfer for yesterday goods delivery',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        }
      ];
      setPaymentRecords(sampleRecords);
      localStorage.setItem('oga_direct_payment_records', JSON.stringify(sampleRecords));
    }
  }, []);

  // Sync outstanding debtor dropdown values
  useEffect(() => {
    if (selectedSaleId) {
      const match = sales.find(s => s.id === selectedSaleId);
      if (match) {
        setCustomCustomerName(match.customerName);
        setPaymentAmount(match.balanceDebt.toString());
      }
    } else {
      setCustomCustomerName('');
      setPaymentAmount('');
    }
  }, [selectedSaleId, sales]);

  const saveAccountsToStorage = (updated: BusinessBankAccount[]) => {
    setBankAccounts(updated);
    localStorage.setItem('oga_business_accounts', JSON.stringify(updated));
  };

  const saveRecordsToStorage = (updated: DirectPaymentRecord[]) => {
    setPaymentRecords(updated);
    localStorage.setItem('oga_direct_payment_records', JSON.stringify(updated));
  };

  // Add customized business checkout bank account
  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName || !newAccNumber || !newAccName) {
      alert("Please fill all details to save bank account.");
      return;
    }

    const newAcc: BusinessBankAccount = {
      id: 'acc-' + Date.now(),
      bankName: newBankName,
      accountNumber: newAccNumber.trim(),
      accountName: newAccName,
      isDefault: bankAccounts.length === 0
    };

    const updated = [...bankAccounts, newAcc];
    saveAccountsToStorage(updated);
    
    setNewBankName('');
    setNewAccNumber('');
    setNewAccName('');
    setShowConfigForm(false);
    alert("New Business Bank Account saved for direct payments!");
  };

  const handleDeleteAccount = (id: string) => {
    if (window.confirm("Are you sure you want to remove this bank account?")) {
      const filtered = bankAccounts.filter(a => a.id !== id);
      saveAccountsToStorage(filtered);
    }
  };

  // Record a Customer's Direct Bank Transfer Payment against their profile
  const handlePostDirectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = Number(paymentAmount);
    if (!customCustomerName || isNaN(amountVal) || amountVal <= 0) {
      alert("Please specify a valid customer name and payment amount.");
      return;
    }

    const selectedBank = bankAccounts.find(b => b.id === selectedBankId);
    const destinationText = selectedBank 
      ? `${selectedBank.bankName} (${selectedBank.accountNumber})`
      : 'Direct Business Bank Transfer';

    setIsRecording(true);

    setTimeout(() => {
      // 1. Create payment log
      const newPayment: DirectPaymentRecord = {
        id: 'pay-rec-' + Date.now(),
        customerName: customCustomerName,
        amount: amountVal,
        saleId: selectedSaleId || null,
        receivingBank: destinationText,
        referenceNotes: referenceNotes || 'Manual direct bank receipt confirmation',
        timestamp: new Date().toISOString()
      };

      const updatedRecs = [newPayment, ...paymentRecords];
      saveRecordsToStorage(updatedRecs);

      // 2. Update matching sale debt in main App state
      if (selectedSaleId) {
        const saleMatch = sales.find(s => s.id === selectedSaleId);
        if (saleMatch) {
          const newPaid = saleMatch.amountPaid + amountVal;
          const newDebt = Math.max(0, saleMatch.totalAmount - newPaid);
          onUpdateSale(selectedSaleId, {
            amountPaid: newPaid,
            balanceDebt: newDebt,
            paymentStatus: newDebt === 0 ? 'PAID' : 'PARTIAL'
          });
        }
      } else {
        // Fallback: match first customer with matching name
        const match = sales.find(s => s.customerName.toLowerCase().includes(customCustomerName.toLowerCase()) && s.balanceDebt > 0);
        if (match) {
          const newPaid = match.amountPaid + amountVal;
          const newDebt = Math.max(0, match.totalAmount - newPaid);
          onUpdateSale(match.id, {
            amountPaid: newPaid,
            balanceDebt: newDebt,
            paymentStatus: newDebt === 0 ? 'PAID' : 'PARTIAL'
          });
        }
      }

      // Reset Form fields
      setIsRecording(false);
      setSelectedSaleId('');
      setCustomCustomerName('');
      setPaymentAmount('');
      setSelectedBankId('');
      setReferenceNotes('');
      alert(`Hurray! Registered customer payment of ₦${amountVal.toLocaleString()} directly from ${customCustomerName}. Debt Ledger updated!`);
    }, 800);
  };

  // Copy bank payment coordinates
  const handleCopyAccountDetails = (acc: BusinessBankAccount) => {
    const textToCopy = `Account Name: ${acc.accountName}\nBank: ${acc.bankName}\nAccount Number: ${acc.accountNumber}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedAccountId(acc.id);
    setTimeout(() => setCopiedAccountId(null), 2000);
  };

  // Parse SMS text alerts
  const handleParseSmsAlert = async () => {
    if (!smsText.trim()) return;
    setParsingSms(true);
    setParseError(null);
    setParsedSmsResult(null);

    try {
      const res = await fetch('/api/bank/parse-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertText: smsText.trim() }),
      });

      if (!res.ok) {
        throw new Error('Gemini API credit alert parsing failed. Check network link.');
      }

      const data = await res.json();
      setParsedSmsResult(data);
    } catch (err: any) {
      setParseError(err.message || 'Error occurred during AI analysis of credit notification.');
    } finally {
      setParsingSms(false);
    }
  };

  // Apply parsed credit alert to settle debtor profile
  const applySmsRepayment = () => {
    if (!parsedSmsResult) return;
    onApplyParsedRepayment({
      amount: parsedSmsResult.amount,
      senderName: parsedSmsResult.senderName || 'Anonymous Payer',
      bankName: parsedSmsResult.bankName || 'Direct Transfer Account'
    });

    // Also write a payment log
    const newPayment: DirectPaymentRecord = {
      id: 'pay-rec-' + Date.now(),
      customerName: parsedSmsResult.senderName || 'Anonymous Payer',
      amount: parsedSmsResult.amount,
      saleId: null,
      receivingBank: parsedSmsResult.bankName || 'Direct bank transfer',
      referenceNotes: `Auto deconstructed credit notification alert: "${parsedSmsResult.desc || 'No description provided'}"`,
      timestamp: new Date().toISOString()
    };
    saveRecordsToStorage([newPayment, ...paymentRecords]);

    setSmsText('');
    setParsedSmsResult(null);
    alert(`Success! ₦${parsedSmsResult.amount.toLocaleString()} posted and matched to business credit accounts.`);
  };

  const copySmsSample = () => {
    const sample = 'Credit Alert: Acct: 501***892 Amt: NGN 15,000.00 Desc: Transfer from AMAKA OKAFOR via Access Bank App. Date: 2026-05-25';
    setSmsText(sample);
  };

  const getWhatsAppShareText = (acc: BusinessBankAccount, outstandingDebt?: number, customerName?: string) => {
    const greeting = businessProfile?.whatsappGreeting 
      ? businessProfile.whatsappGreeting.replace('invoice', 'bank details') 
      : `Hello${customerName ? ' ' + customerName : ''}, well done!`;
    const signoff = businessProfile?.whatsappReminderSuffix || `Send me your transfer screenshot once done. Thanks for your patronage!`;
    const detailMsg = `${greeting}\n\nAbeg, here are the business bank accounts to transfer directly for pending trade deliveries${outstandingDebt ? ` of *₦${outstandingDebt.toLocaleString()}*` : ''}:\n\n🏦 *${acc.bankName}*\n🔢 Account No: *${acc.accountNumber}*\n👤 Name: *${acc.accountName}*\n\n${signoff}`;
    return `https://wa.me/?text=${encodeURIComponent(detailMsg)}`;
  };

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans font-light">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-display font-light text-ash-900 tracking-tight">Direct Bank Accounts & Settle</h1>
        <p className="text-xs text-ash-500 font-light">
          The buyer pays directly to the business bank account. Share bank details, log manual transfer outcomes, or parse credit cash alerts instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Business Bank Accounts & Payment Logger */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          
          {/* Business Accounts List */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-ash-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-normal text-ash-800 text-sm flex items-center gap-2">
                <Building2 className="h-4.5 w-4.5 text-mint-500" />
                Active Business Bank Accounts
              </h3>
              <button
                onClick={() => setShowConfigForm(!showConfigForm)}
                className="text-xs text-mint-600 font-normal hover:underline flex items-center gap-1 cursor-pointer"
              >
                {showConfigForm ? 'Cancel' : '+ Add Account'}
              </button>
            </div>

            {/* Config account form */}
            {showConfigForm && (
              <form onSubmit={handleAddAccount} className="p-4 bg-ash-50 border border-ash-200 rounded-2xl space-y-3 animate-slide-up">
                <h4 className="text-xs font-normal text-ash-800">Add New Business Account</h4>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-normal text-ash-400">Bank Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Zenith Bank, GTBank, Kuda"
                    required
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    className="w-full bg-white border border-ash-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-normal text-ash-400">Account Number</label>
                    <input
                      type="text"
                      placeholder="10 Digits"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      required
                      value={newAccNumber}
                      onChange={(e) => setNewAccNumber(e.target.value)}
                      className="w-full bg-white border border-ash-200 text-xs px-3 py-2 rounded-xl focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-normal text-ash-400">Account Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Kola Traders"
                      required
                      value={newAccName}
                      onChange={(e) => setNewAccName(e.target.value)}
                      className="w-full bg-white border border-ash-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-mint-400 hover:bg-mint-500 text-white font-normal py-2 px-3 rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Save Business Bank Account
                </button>
              </form>
            )}

            <div className="space-y-3">
              {bankAccounts.length > 0 ? (
                bankAccounts.map(acc => (
                  <div key={acc.id} className="p-4 bg-ash-50 border border-ash-200 rounded-2xl flex flex-col justify-between gap-3 relative hover:border-mint-200 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between font-sans">
                        <span className="font-normal text-sm text-ash-800">{acc.bankName}</span>
                        {acc.isDefault && (
                          <span className="bg-mint-50 text-mint-700 text-[9px] font-normal px-1.5 py-0.5 rounded-lg border border-mint-200/40">Default</span>
                        )}
                      </div>
                      <p className="font-mono text-mint-600 font-normal text-base tracking-widest">{acc.accountNumber}</p>
                      <p className="text-ash-500 text-xs font-light">{acc.accountName}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-ash-200/50">
                      <button
                        onClick={() => handleCopyAccountDetails(acc)}
                        className="bg-white hover:bg-ash-100 text-ash-750 border border-ash-200 rounded-xl py-1 px-2.5 text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        {copiedAccountId === acc.id ? (
                          <>
                            <Check className="h-3 w-3 text-mint-500" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 text-ash-400" />
                            Copy info
                          </>
                        )}
                      </button>
                      <a
                        href={getWhatsAppShareText(acc)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-mint-50 hover:bg-mint-100/50 text-mint-750 border border-mint-200/50 rounded-xl py-1 px-2.5 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <MessageSquare className="h-3 w-3 text-mint-500" />
                        Send details
                      </a>
                      
                      {bankAccounts.length > 1 && (
                        <button
                          onClick={() => handleDeleteAccount(acc.id)}
                          className="ml-auto text-ash-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-ash-400 text-xs border border-dashed border-ash-200 rounded-2xl">
                  No accounts stored. Add one above!
                </div>
              )}
            </div>
          </div>

          {/* Settle Manual Form */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-ash-200 shadow-xs space-y-4">
            <h3 className="font-display font-normal text-ash-800 text-sm flex items-center gap-2">
              <CheckCircle className="h-4.5 w-4.5 text-mint-500" />
              Settle outstanding Customer Debt
            </h3>
            
            <form onSubmit={handlePostDirectPayment} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-normal text-ash-600 block">Select Open Customer Debt</label>
                <select
                  value={selectedSaleId}
                  onChange={(e) => setSelectedSaleId(e.target.value)}
                  className="w-full bg-ash-50 border border-ash-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none"
                >
                  <option value="">-- Choose Debtor Customer --</option>
                  {debtors.map(sale => (
                    <option key={sale.id} value={sale.id}>
                      {sale.customerName} (owes {formatNaira(sale.balanceDebt)}) - {sale.productName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-normal text-ash-600 block">Customer / Payer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Amaka Okafor, Mama Tunde"
                  required
                  value={customCustomerName}
                  onChange={(e) => setCustomCustomerName(e.target.value)}
                  className="w-full bg-ash-50 border border-ash-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-normal text-ash-600 block">Amount Received (₦)</label>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full bg-ash-50 border border-ash-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none font-mono font-normal"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-normal text-ash-600 block">Receiving Account</label>
                  <select
                    value={selectedBankId}
                    onChange={(e) => setSelectedBankId(e.target.value)}
                    required
                    className="w-full bg-ash-50 border border-ash-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none font-normal"
                  >
                    <option value="">-- Choose Bank Received --</option>
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} ({b.accountNumber.slice(-4)})
                      </option>
                    ))}
                    <option value="other">Other Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-normal text-ash-600 block">Reference Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Sent proof transfer, Zenith mobile app"
                  value={referenceNotes}
                  onChange={(e) => setReferenceNotes(e.target.value)}
                  className="w-full bg-ash-50 border border-ash-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isRecording}
                className="w-full bg-mint-400 hover:bg-mint-500 disabled:opacity-50 text-white font-normal py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
              >
                {isRecording ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Log Direct Payment & Update Ledger
              </button>
            </form>
          </div>
          </div>
        {/* Right Column: AI Alert Parser & Payment Logs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Credit Alert SMS AI Parser */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-ash-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-normal text-ash-800 text-sm flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-mint-500" />
                  AI Credit alert SMS deconstructor
                </h3>
                <p className="text-xs text-ash-400 mt-1 font-light">Settle debts instantly by parsing credit alerts sent to your phone!</p>
              </div>
              <button 
                type="button"
                onClick={copySmsSample}
                className="text-xs text-mint-600 font-normal hover:underline flex items-center gap-1 cursor-pointer bg-ash-105 hover:bg-ash-200 shadow-2xs px-2.5 py-1.5 rounded-xl self-start sm:self-auto"
              >
                <Copy className="h-3.5 w-3.5" />
                Paste sample alert
              </button>
            </div>

            <div className="space-y-3">
              <textarea
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder="Paste mobile cash credit alert body text, USSD notification, or credit notification receipts copied from bank SMS inboxes here..."
                className="w-full bg-ash-50 border border-ash-200 focus:bg-white focus:border-mint-400 text-xs p-3.5 rounded-xl min-h-[100px] font-sans focus:outline-none resize-none leading-relaxed font-light"
              />

              <button
                type="button"
                onClick={handleParseSmsAlert}
                disabled={parsingSms || !smsText.trim()}
                className="bg-ash-800 hover:bg-ash-900 text-white text-xs font-normal py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer transition-all"
              >
                {parsingSms ? <Loader2 className="h-3.5 w-3.5 animate-spin text-mint-300" /> : <Sparkles className="h-3.5 w-3.5 text-mint-400 animate-pulse" />}
                Read & Parse SMS Alert
              </button>
            </div>

            {parseError && (
              <div className="p-3 bg-red-400/10 text-red-705 rounded-xl flex items-center gap-2 text-xs border border-red-200/50 font-light">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {parsedSmsResult && (
              <div className="p-4 bg-mint-50 rounded-2xl border border-mint-200/40 space-y-3 animate-fade-in text-ash-800">
                <h4 className="text-xs font-normal text-ash-700 flex items-center gap-1.5 uppercase tracking-wide">
                  <CheckCircle className="h-4 w-4 text-mint-500" />
                  Successfully decoded credit notification alert!
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-normal">
                  <div>
                    <span className="text-ash-400 block text-[10px] uppercase">Payer Account</span>
                    <strong className="text-ash-800 font-normal">{parsedSmsResult.senderName || 'Anonymous Customer'}</strong>
                  </div>
                  <div>
                    <span className="text-ash-400 block text-[10px] uppercase">Receiving Bank</span>
                    <strong className="text-ash-800 font-normal">{parsedSmsResult.bankName || 'Oga Business Bank'}</strong>
                  </div>
                  <div>
                    <span className="text-ash-400 block text-[10px] uppercase">Transfer Valuation</span>
                    <strong className="text-mint-600 font-sans font-normal text-sm">{formatNaira(parsedSmsResult.amount)}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-mint-200/30">
                  <button
                    type="button"
                    onClick={applySmsRepayment}
                    className="bg-mint-400 hover:bg-mint-500 text-white text-xs font-normal py-1.5 px-3 rounded-xl flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Auto-Apply transfer payment to SME debt ledger
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Historical Logs */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-ash-200 shadow-xs space-y-4 font-sans">
            <h3 className="font-display font-normal text-ash-500 text-[10px] uppercase tracking-wider block">
              Recent Direct Bank Repayment logs
            </h3>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {paymentRecords.length > 0 ? (
                paymentRecords.map(rec => (
                   <div key={rec.id} className="p-4 bg-ash-50 border border-ash-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-ash-800 text-sm font-normal">{rec.customerName}</strong>
                        <span className="bg-white border border-ash-200 text-ash-650 text-[9px] px-1.5 py-0.5 rounded-lg font-light uppercase">Bank receipt</span>
                      </div>
                      <p className="text-ash-500 font-light text-[11px]">
                        Transferred directly to {rec.receivingBank}
                      </p>
                      <p className="text-ash-400 italic font-sans font-light">
                        "{rec.referenceNotes}"
                      </p>
                      <p className="text-ash-400 text-[9px] font-light">
                        {new Date(rec.timestamp).toLocaleString()}
                      </p>
                    </div>

                    <div className="text-right sm:shrink-0 bg-mint-50 text-mint-700 px-3 py-1.5 rounded-xl border border-mint-200/40 flex flex-col items-center">
                      <span className="text-[9px] font-normal uppercase tracking-wider block text-mint-600">Settle Recv</span>
                      <strong className="font-normal text-sm tracking-tight">{formatNaira(rec.amount)}</strong>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-ash-400 text-xs bg-ash-50 border border-dashed border-ash-200 rounded-2xl">
                  No direct payment records logged yet this trade terminal loop. Settle a debtor above!
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
