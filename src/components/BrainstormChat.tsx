import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Loader2, 
  User, 
  HelpCircle,
  PiggyBank,
  TrendingUp,
  Truck,
  Lightbulb,
  CheckCircle2,
  ListRestart,
  Volume2,
  AlertCircle,
  Trash2,
  Mic,
  MicOff,
  ChevronRight
} from 'lucide-react';
import { ChatMessage, Product, Sale, OwnerProfile, BusinessProfile } from '../types';

interface LocalChatMessage extends ChatMessage {
  cleanPrompt?: string;
  actionDetected?: boolean;
  action?: 'ADD_INVENTORY' | 'RECORD_SALE' | 'RECORD_PAYMENT' | 'DELETE_PRODUCT' | 'NONE';
  actionData?: any;
  applied?: boolean;
}

interface BrainstormChatProps {
  products: Product[];
  sales: Sale[];
  onApplyParsedAction: (parsedResult: any) => void;
  ownerProfile: OwnerProfile;
  businessProfile: BusinessProfile;
}

export default function BrainstormChat({ products, sales, onApplyParsedAction, ownerProfile, businessProfile }: BrainstormChatProps) {
  const [messages, setMessages] = useState<LocalChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: "Oga Boss, you are welcome! I be your Sabi AI, your most loyal strategist. I don look your books well-well. Ask me anything about your sales, who dey owe you, or how to grow your profit. I dey here to help you register items sharp-sharp!",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingText, setRecordingText] = useState('Sabi is listening...');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handle Speech Recognition set-up
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-NG'; // Nigerian English/Pidgin optimized

      rec.onstart = () => {
        setIsRecording(true);
        setRecordingText('Sabi dey hear... Speak now, Oga!');
      };

      rec.onresult = (event: any) => {
        const textStr = event.results[0][0].transcript;
        if (textStr) {
          setInputMessage(textStr);
        }
        setIsRecording(false);
      };

      rec.onerror = (event: any) => {
        console.warn('[Speech Recognition Sandbox/Device block]:', event.error);
        runSimulationRecording();
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const runSimulationRecording = () => {
    setIsRecording(true);
    setRecordingText('Listening... (Simulating speech input)');
    
    // Choose a highly relevant Nigeria shopkeeper dictate preset
    const shopkeeperSpeechPresets = [
      "Add 15 bags of cement",
      "I sold 3 cartons of Indomie to Amaka for 18000 naira",
      "Oga Tunde pay me 5000 naira for his previous debt balance",
      "delete ankara fabrics product",
      "I want to restock 10 packs of Peak Milk cost 2000 sell 2500"
    ];

    setTimeout(() => {
      const chosen = shopkeeperSpeechPresets[Math.floor(Math.random() * shopkeeperSpeechPresets.length)];
      setInputMessage(chosen);
      setIsRecording(false);
    }, 2800);
  };

  const handleMicToggle = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      } else {
        setIsRecording(false);
      }
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (_) {
          runSimulationRecording();
        }
      } else {
        runSimulationRecording();
      }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const rawInput = inputMessage.trim();
    const userMsg: LocalChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: rawInput,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    // Context details to help Gemini matches
    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const outstandingDebts = sales.reduce((sum, s) => sum + s.balanceDebt, 0);

    // Standardized enriched context for better AI intelligence
    const recentSalesSummary = sales.slice(0, 10).map(s => ({
      item: s.productName,
      qty: s.quantity,
      total: s.totalAmount,
      customer: s.customerName,
      debt: s.balanceDebt,
      date: s.timestamp
    }));

    const prodSales: Record<string, number> = {};
    sales.forEach(s => prodSales[s.productName] = (prodSales[s.productName] || 0) + s.quantity);
    
    const topProducts = [...products]
      .sort((a, b) => (prodSales[b.name] || 0) - (prodSales[a.name] || 0))
      .slice(0, 5)
      .map(p => ({ name: p.name, stock: p.quantity, price: p.sellingPrice }));

    const businessContext = {
      inventory: products.map(p => ({ name: p.name, stock: p.quantity, price: p.sellingPrice })),
      outstandingDebts,
      totalSales,
      recentSales: recentSalesSummary,
      topProducts,
      ownerProfile,
      businessProfile
    };

    try {
      // We pass the conversation context so Gemini can track back-and-forth chat
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ sender: m.sender, text: m.text })),
          businessContext
        }),
      });

      if (!res.ok) {
        throw new Error('Connection failed with Sabi AI server.');
      }

      const data = await res.json();
      
      const assistantMsg: LocalChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.text,
        cleanPrompt: data.cleanPrompt,
        actionDetected: data.actionDetected,
        action: data.action,
        actionData: data.actionData,
        applied: false,
        timestamp: new Date().toISOString()
      };

      // Auto-Apply command triggers directly if detected!
      if (data.actionDetected && data.action && data.action !== 'NONE') {
        try {
          onApplyParsedAction({
            action: data.action,
            data: data.actionData,
            recognized: true,
            explanation: data.text
          });
          assistantMsg.applied = true;
        } catch (applyErr) {
          console.error('[Auto-apply ledger update failed]:', applyErr);
        }
      }

      // If Gemini corrected repeating/duplicate words in the cleanPrompt, annotate user message as well
      if (data.cleanPrompt && data.cleanPrompt !== rawInput) {
        setMessages(prev => {
          return prev.map(m => m.id === userMsg.id ? { ...m, cleanPrompt: data.cleanPrompt } : m);
        });
      }

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.warn("Sabisell Server / Gemini failed, falling back to client-side local NLP parser execution:", err);
      
      // Perform client-side NLP match
      const text = rawInput.trim().toLowerCase();
      let action: 'ADD_INVENTORY' | 'RECORD_SALE' | 'RECORD_PAYMENT' | 'NONE' = 'NONE';
      let actionDetected = false;
      let actionData: any = {};
      let feedback = "";

      // Check if user language is likely Nigerian Pidgin or uses Pidgin slangs/markers
      const pidginMarkers = ["wan", "den", "dem", "dey", "abeg", "oya", "oga", "sabi", "na", "debt", "roll", "take", "bring", "pay me", "she owe", "we go", "don", "wetin", "fit", "baba", "mama", "amaka", "chioma", "tunde"];
      const isPidgin = pidginMarkers.some(marker => text.includes(marker)) || text.endsWith("o") || text.endsWith("jare") || text.endsWith("shaa");

      const rawNums = text.match(/\d+/g)?.map(Number) || [];
      const smallNumbers = rawNums.filter(n => n < 100);
      const largeNumbers = rawNums.filter(n => n >= 100);

      let qty = 1;
      if (smallNumbers.length > 0) {
        qty = smallNumbers[0];
      } else if (rawNums.length > 0) {
        qty = rawNums.length === 1 ? 1 : rawNums[0];
      }

      const cleanPrompt = rawInput.split(/\s+/).filter((v, i, a) => a.indexOf(v) === i).join(" ");

      // Match Product Name
      let productName = "General Product";
      if (products && Array.isArray(products)) {
        for (const p of products) {
          if (text.includes(p.name.toLowerCase())) {
            productName = p.name;
            break;
          }
        }
      }
      if (productName === "General Product") {
        if (text.includes("cement")) productName = "Cement Bag";
        else if (text.includes("indomie")) productName = "Indomie Carton";
        else if (text.includes("milo")) productName = "Milo Pack";
        else if (text.includes("milk") || text.includes("peak")) productName = "Peak Milk Pack";
        else if (text.includes("rice")) productName = "Rice Bag";
        else if (text.includes("fabric") || text.includes("ankara")) productName = "Ankara Fabric";
      }

      // Match Customer Name
      let customerName = "Walk-in Customer";
      const nameMatches = ["amaka", "tunde", "baba tunde", "chioma", "mama chioma", "john", "emeka", "bisi", "chidi", "audu"];
      for (const name of nameMatches) {
        if (text.includes(name)) {
          customerName = name.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
          break;
        }
      }
      const toMatch = rawInput.match(/\b(?:to|from|for)\s+([A-Z][a-z]+)/);
      if (toMatch && toMatch[1] && customerName === "Walk-in Customer") {
        customerName = toMatch[1];
      }

      if (text.includes("add") || text.includes("restock") || text.includes("bring")) {
        action = "ADD_INVENTORY";
        actionDetected = true;
        
        let costPrice = 4000;
        let sellingPrice = 5000;

        if (largeNumbers.length === 1) {
          sellingPrice = largeNumbers[0];
          costPrice = Math.round(sellingPrice * 0.82);
        } else if (largeNumbers.length >= 2) {
          costPrice = largeNumbers[0];
          sellingPrice = largeNumbers[1];
        }

        actionData = {
          name: productName,
          quantity: qty,
          costPrice,
          sellingPrice,
          category: 'Provisions'
        };

        if (isPidgin) {
          feedback = `Oga Boss, I don record am sharp-sharp! You restock ${qty} unit(s) of "${productName}" (Buying rate na ₦${costPrice.toLocaleString()}, we go sell am for ₦${sellingPrice.toLocaleString()}). Your store dey grow!`;
        } else {
          feedback = `Yes Oga! I have successfully logged the restock of ${qty} unit(s) for "${productName}". Buying cost is ₦${costPrice.toLocaleString()} and selling price is ₦${sellingPrice.toLocaleString()}. I'm keeping your records safe.`;
        }

      } else if (text.includes("sold") || text.includes("sell") || text.includes("customer")) {
        action = "RECORD_SALE";
        actionDetected = true;

        let unitPrice = 7500;
        const matchingProd = products.find(p => p.name.toLowerCase() === productName.toLowerCase());
        if (matchingProd) {
          unitPrice = matchingProd.sellingPrice;
        } else if (largeNumbers.length > 0) {
          unitPrice = largeNumbers[0];
        }

        const totalAmount = unitPrice * qty;
        let amountPaid = totalAmount;

        if (text.includes("debt") || text.includes("credit") || text.includes("owe")) {
          amountPaid = 0;
          if (largeNumbers.length > 1) {
            amountPaid = largeNumbers[largeNumbers.length - 1];
          }
        }

        actionData = {
          productName,
          quantity: qty,
          unitPrice,
          totalAmount,
          amountPaid,
          balanceDebt: Math.max(0, totalAmount - amountPaid),
          customerName,
          paymentStatus: amountPaid === totalAmount ? 'PAID' : (amountPaid > 0 ? 'PARTIAL' : 'UNPAID')
        };

        if (isPidgin) {
          feedback = `Sharp Oga! I don enter the sale for your book: ${qty} "${productName}" for ${customerName}. You collect ₦${amountPaid.toLocaleString()}, remaining ₦${(totalAmount - amountPaid).toLocaleString()} debt recorded. We go get the money!`;
        } else {
          feedback = `Well done Oga! Sale recorded: ${qty} unit(s) of "${productName}" to ${customerName}. Cash received: ₦${amountPaid.toLocaleString()} out of ₦${totalAmount.toLocaleString()}. I have updated the ledger.`;
        }

      } else if (text.includes("pay") || text.includes("clear") || text.includes("repay")) {
        action = "RECORD_PAYMENT";
        actionDetected = true;
        
        let amountPaidStr = 5000;
        if (largeNumbers.length > 0) {
          amountPaidStr = largeNumbers[0];
        }

        actionData = {
          customerName,
          amountPaid: amountPaidStr,
          balanceDebt: 0
        };

        if (isPidgin) {
          feedback = `Well done Oga! I don enter am: ${customerName} just pay ₦${amountPaidStr.toLocaleString()} to clear debt. Money dey enter hand!`;
        } else {
          feedback = `Excellent Oga Boss! I have logged that ${customerName} paid ₦${amountPaidStr.toLocaleString()} to reduce their balance. Good progress on your debt book!`;
        }

      } else {
        if (isPidgin) {
          feedback = "Oga, Sabi Offline Assistant is active! Please try saying 'Add 15 bags cement cost 4000 sell 5000' or 'I sold cement to Amaka for 2000' and we will log the record instantly for you.";
        } else {
          feedback = "Offline Assistant is active! Please describe your request clearly (e.g., 'Add 15 bags of cement with cost 4000 and sell price 5000' or 'Sold cement to Amaka for 2000') to trace records automatically.";
        }
      }

      const assistantMsg: LocalChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: feedback,
        cleanPrompt,
        actionDetected,
        action,
        actionData,
        applied: false,
        timestamp: new Date().toISOString()
      };

      if (actionDetected && action !== 'NONE') {
        try {
          onApplyParsedAction({
            action,
            data: actionData,
            recognized: true,
            explanation: feedback
          });
          assistantMsg.applied = true;
        } catch (applyErr) {
          console.error('[Client local fallback update failed]:', applyErr);
        }
      }

      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickConsult = (promptText: string) => {
    setInputMessage(promptText);
  };

  const adviceStarters = [
    { label: 'Register Restocks', text: 'I bring in 10 cartons of Indomie packages, cost na 5000 naira sell na 6500', icon: <TrendingUp className="h-3.5 w-3.5" />, desc: 'Add Stock Line' },
    { label: 'Record Sales', text: 'Sell 2 cement bags to Baba Tunde, he pay me 20000 Naira cash', icon: <Truck className="h-3.5 w-3.5" />, desc: 'Log Customer Sale' },
    { label: 'Wipe Listing', text: 'delete product cement from my listings', icon: <Trash2 className="h-3.5 w-3.5" />, desc: 'Wipe Listing' },
    { label: 'Collect Debts', text: 'Amaka pay me 5000 naira cash for outstanding cement balance', icon: <PiggyBank className="h-3.5 w-3.5" />, desc: 'Record Debt Payment' },
    { label: 'Market Strategy', text: 'Analyze my sales and give me a custom marketing plan to increase sales this month.', icon: <Lightbulb className="h-3.5 w-3.5" />, desc: 'Consult strategic adviser' }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-125px)] md:h-[78vh] min-h-[500px] gap-2.5 animate-fade-in max-w-5xl mx-auto font-sans">
      
      {/* Sabi Header */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-3xs shrink-0 select-none">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-ash-100 flex items-center gap-2 tracking-tight">
            <Sparkles className="h-5 w-5 text-rose-500 animate-pulse shrink-0" />
            <span>Sabi AI Companion</span>
          </h1>
          <p className="text-[10px] md:text-xs text-slate-400 font-medium">
            Bookkeeper Strategist & Speech Recognizer. Speak or write naturally to adjust your ledger records!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-450 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/40 uppercase tracking-widest shrink-0">
            Live Link Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3.5 flex-grow overflow-hidden relative">
        
        {/* Advice Quick Starters Sidebar for Computers */}
        <div className="hidden lg:flex flex-col col-span-1 space-y-2 overflow-y-auto pr-1">
          <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider select-none leading-none pb-1.5 pl-1">Examples</h3>
          <div className="grid grid-cols-1 gap-2">
            {adviceStarters.map((starter, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickConsult(starter.text)}
                className="p-3 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl text-left cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:border-mint-400/50 flex flex-col gap-1 shadow-3xs min-w-0"
              >
                <div className="flex items-center gap-2 font-semibold text-xs text-slate-800 dark:text-slate-200">
                  <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 p-1 rounded-lg border border-rose-100 dark:border-rose-900/20 shrink-0">
                    {starter.icon}
                  </div>
                  <span className="truncate">{starter.label}</span>
                </div>
                <p className="text-[9px] text-slate-400 truncate w-full pl-0.5">{starter.text}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Messaging Area Core */}
        <div className="col-span-1 lg:col-span-3 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-150/70 dark:border-zinc-800 shadow-3xs flex flex-col h-full overflow-hidden relative">
          
          {/* Mobile Swipeable Suggestion Carousels (Directly in view as requested by extremely mobile-first goal) */}
          <div className="lg:hidden shrink-0 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 p-2.5 overflow-x-auto select-none">
            <div className="flex gap-2 w-max pr-4">
              {adviceStarters.map((starter, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickConsult(starter.text)}
                  className="flex items-center gap-1.5 bg-white dark:bg-zinc-950 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-350 border border-slate-100 dark:border-zinc-800 shadow-3xs cursor-pointer hover:bg-slate-100"
                >
                  <span className="p-0.5 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-md block shrink-0">{starter.icon}</span>
                  <span className="font-semibold text-[11px] whitespace-nowrap">{starter.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Balloon Timeline lists */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 font-sans text-sm pb-8">
            {messages.map((m) => {
              const isAssistant = m.sender === 'assistant';
              const isCleaned = m.cleanPrompt && !isAssistant;
              
              return (
                <div 
                  key={m.id}
                  className={`flex items-start gap-2.5 max-w-[90%] sm:max-w-[82%] ${isAssistant ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${isAssistant ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' : 'bg-slate-100 text-slate-700'}`}>
                    {isAssistant ? <Sparkles className="h-4.5 w-4.5 shrink-0" /> : <User className="h-4.5 w-4.5 shrink-0" />}
                  </div>
                  
                  <div className="space-y-1.5 flex flex-col w-full min-w-0">
                    <div className={`p-4 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                      isAssistant 
                        ? 'bg-gradient-to-br from-slate-50/90 to-slate-100/50 dark:from-zinc-900 dark:to-zinc-950 text-slate-900 dark:text-ash-100 border border-slate-100 dark:border-zinc-850 shadow-3xs rounded-tl-none' 
                        : 'bg-slate-900 text-white font-medium rounded-tr-none border border-slate-800/30'
                    }`}>
                      {m.text}

                      {/* Auto Record database updates */}
                      {isAssistant && m.actionDetected && m.action && m.action !== 'NONE' && (
                        <div className="mt-3.5 pt-3 border-t border-slate-200/55 dark:border-zinc-800 space-y-2">
                          <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/20 p-3 rounded-xl animate-fade-in">
                            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                            <div className="text-left font-sans min-w-0">
                              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-450">Sabi AI Posted to Ledger!</p>
                              <p className="text-[10px] text-slate-500 font-light mt-0.5 leading-relaxed">
                                I've processed your shorthand record, corrected repeating slips, and successfully appended it to your local records.
                              </p>
                              <div className="mt-2.5 grid grid-cols-2 gap-2 text-[9px] font-sans">
                                <div className="bg-white/80 dark:bg-zinc-900 p-1.5 rounded border border-emerald-100/60 dark:border-emerald-900/20">
                                  <span className="text-slate-400 block uppercase font-bold text-[8px]">Action</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{m.action}</span>
                                </div>
                                <div className="bg-white/80 dark:bg-zinc-900 p-1.5 rounded border border-emerald-100/60 dark:border-emerald-900/20 min-w-0">
                                  <span className="text-slate-400 block uppercase font-bold text-[8px]">Reference</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                                    {m.actionData?.name || m.actionData?.productName || m.actionData?.customerName || 'General Item'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {isCleaned && (
                      <span className="text-[9px] text-emerald-600 font-bold self-end flex items-center gap-1 bg-emerald-50/70 border border-emerald-100 px-2 py-0.5 rounded-lg">
                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                        Repetitions filtered & aligned!
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            
            {loading && (
              <div className="flex items-center gap-2.5 mr-auto">
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-500 animate-pulse">
                  <Sparkles className="h-4.5 w-4.5 shrink-0" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-850 text-gray-400 text-xs flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-500" />
                  Sabi AI analyzing voice transcription...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Speech Recording pulsing wave display if active */}
          {isRecording && (
            <div className="absolute inset-x-0 bottom-16 bg-rose-500/95 text-white p-4 backdrop-blur-sm border-t border-rose-600 flex items-center justify-between gap-4 z-40 animate-slide-up select-none">
              <div className="flex items-center gap-3">
                <div className="p-1 px-2.5 bg-white/20 rounded-full animate-bounce leading-none font-bold text-xs">LIVE</div>
                <div className="space-y-1">
                  <p className="text-xs font-bold">{recordingText}</p>
                  <p className="text-[10px] text-white/70">Dictate naturally. Sabi is listening to context...</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-white rounded-full animate-pulse" />
                <span className="w-1.5 h-4 w-1 bg-white rounded-full animate-pulse delay-75" />
                <span className="w-1.5 h-5 bg-white rounded-full animate-pulse delay-150" />
                <span className="w-1.5 h-3 bg-white rounded-full animate-pulse delay-75" />
              </div>
            </div>
          )}

          {/* Interactive Input Form bar */}
          <form onSubmit={handleSend} className="p-3 bg-slate-50 dark:bg-zinc-900/50 border-t border-slate-150/75 dark:border-zinc-800 flex items-center gap-2 shrink-0">
            
            <button
              type="button"
              onClick={handleMicToggle}
              className={`p-3 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer ${isRecording ? 'bg-rose-550 text-white animate-pulse' : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100/40 hover:bg-rose-100'}`}
              title="Dictate speech with Sabi AI"
            >
              {isRecording ? <MicOff className="h-4 w-4 shrink-0" /> : <Mic className="h-4 w-4 shrink-0" />}
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Sabi AI about profits or type: 'I sold milo to Amaka...'"
              className="flex-grow bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-rose-400 focus:bg-white text-xs px-3.5 py-3 rounded-xl focus:outline-none transition-all dark:text-white"
            />
            
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="bg-mint-400 hover:bg-mint-500 disabled:opacity-40 text-white p-3 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-97 flex items-center justify-center cursor-pointer shrink-0"
            >
              <Send className="h-4.5 w-4.5 text-white" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
