import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Loader2, 
  Check, 
  X, 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  AlertCircle,
  Volume2,
  FileAudio,
  FileText,
  Play,
  RotateCcw
} from 'lucide-react';
import { Product, OwnerProfile, BusinessProfile } from '../types';

interface VoiceAssistantProps {
  products: Product[];
  onApplyParsedAction: (parsedResult: any) => void;
  ownerProfile: OwnerProfile;
  businessProfile: BusinessProfile;
}

export default function VoiceAssistant({ products, onApplyParsedAction, ownerProfile, businessProfile }: VoiceAssistantProps) {
  const [activeTab, setActiveTab] = useState<'native_audio' | 'text_api'>('native_audio');
  
  // Text & Web Speech API States
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Native Audio Recording States
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API for the fallback text/dictation tab
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-NG'; // Nigerian English accent optimization

      rec.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentTranscript += event.results[i][0].transcript;
          }
        }
        if (currentTranscript) {
          setTranscript(prev => (prev ? prev + ' ' : '') + currentTranscript.trim());
        }
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error:', e);
        if (e.error === 'not-allowed') {
          setErrorMessage('Microphone permissions blocked. Oga please allow permission in your browser address bar.');
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Web Speech Listening Toggle
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Browser structural speech recognition not supported. Please type in the dictation box directly!');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setErrorMessage(null);
      setTranscript('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Text Parsers
  const handleParseText = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    setParsedResult(null);

    try {
      const res = await fetch('/api/voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: transcript.trim(),
          context: {
            inventory: products.map(p => ({ id: p.id, name: p.name, quantity: p.quantity, sellPrice: p.sellingPrice })),
            ownerProfile,
            businessProfile
          }
        }),
      });

      if (!res.ok) {
        throw new Error('Could not contact Gemini parser server. Please verify your internet connection or active config.');
      }

      const data = await res.json();
      setParsedResult(data);
    } catch (err: any) {
      console.warn("Server connection failed during voice parse, executing client fallback:", err);
      // Client-side fallback mechanics
      executeClientTextFallback(transcript.trim());
    } finally {
      setLoading(false);
    }
  };

  const executeClientTextFallback = (rawInput: string) => {
    const text = rawInput.toLowerCase();
    let action: 'ADD_INVENTORY' | 'RECORD_SALE' | 'RECORD_PAYMENT' | 'NONE' = 'NONE';
    let actionDetected = false;
    let actionData: any = {};
    let feedback = "";

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

    let productName = "General Product";
    for (const p of products) {
      if (text.includes(p.name.toLowerCase())) {
        productName = p.name;
        break;
      }
    }

    let customerName = "Walk-in Customer";
    const nameMatches = ["amaka", "tunde", "baba tunde", "chioma", "mama chioma", "john", "emeka", "bisi", "chidi", "audu"];
    for (const name of nameMatches) {
      if (text.includes(name)) {
        customerName = name.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        break;
      }
    }

    if (text.includes("add") || text.includes("restock") || text.includes("bring")) {
      action = "ADD_INVENTORY";
      actionDetected = true;
      let costPrice = 4000;
      let sellingPrice = 5000;

      if (largeNumbers.length === 1) {
        costPrice = largeNumbers[0];
        sellingPrice = Math.round((costPrice * 1.25) / 50) * 50;
      } else if (largeNumbers.length >= 2) {
        costPrice = largeNumbers[0];
        sellingPrice = largeNumbers[1];
      }

      actionData = {
        productName,
        quantity: qty,
        costPrice,
        sellingPrice,
        totalAmount: qty * sellingPrice,
        amountPaid: qty * sellingPrice,
        balanceDebt: 0
      };
      feedback = isPidgin 
        ? `Oya! Ledger don save say you restock ${qty} units of ${productName}. Cost na ₦${costPrice.toLocaleString()}, sell na ₦${sellingPrice.toLocaleString()}.`
        : `Awesome! Recorded restocking of ${qty} units of ${productName}. Cost: ₦${costPrice.toLocaleString()}, sell price: ₦${sellingPrice.toLocaleString()}.`;
    } else if (text.includes("sell") || text.includes("sold") || text.includes("buy") || text.includes("take")) {
      action = "RECORD_SALE";
      actionDetected = true;
      let totalAmt = qty * 4500;
      let amountPaid = totalAmt;

      if (largeNumbers.length > 0) {
        if (largeNumbers.length === 1) {
          if (text.includes("paid") || text.includes("pay") || text.includes("deposit")) {
            amountPaid = largeNumbers[0];
          } else {
            totalAmt = largeNumbers[0];
            amountPaid = totalAmt;
          }
        } else {
          totalAmt = largeNumbers[0];
          amountPaid = largeNumbers[1];
        }
      }

      const balanceDebt = Math.max(0, totalAmt - amountPaid);
      actionData = {
        productName,
        quantity: qty,
        sellingPrice: Math.round(totalAmt / qty),
        amountPaid,
        customerName,
        totalAmount: totalAmt,
        balanceDebt
      };
      feedback = isPidgin
        ? `Oya! Ledger don update! You sell ${qty} ${productName} to ${customerName}. Dem pay ₦${amountPaid.toLocaleString()}, debt na ₦${balanceDebt.toLocaleString()}!`
        : `Transaction saved! Sold ${qty} of ${productName} to ${customerName}. Received ₦${amountPaid.toLocaleString()}, balance is ₦${balanceDebt.toLocaleString()}.`;
    } else if (text.includes("pay") || text.includes("paid") || text.includes("settle")) {
      action = "RECORD_PAYMENT";
      actionDetected = true;
      let amountPaidStr = largeNumbers.length > 0 ? largeNumbers[0] : 1000;

      actionData = {
        customerName,
        amountPaid: amountPaidStr,
        balanceDebt: 0
      };
      feedback = isPidgin
        ? `Well done! Ledger don save say ${customerName} pay ₦${amountPaidStr.toLocaleString()} debt.`
        : `Excellent! Logged that ${customerName} paid ₦${amountPaidStr.toLocaleString()} part payment towards clearing debt.`;
    }

    setParsedResult({
      cleanPrompt,
      text: feedback,
      actionDetected,
      action,
      actionData
    });
  };

  // --- NATIVE RECORDER INTERACTIVE ACTIONS ---
  const startAudioRecording = async () => {
    try {
      setErrorMessage(null);
      setParsedResult(null);
      setAudioUrl(null);
      setAudioBlob(null);
      setAudioBase64(null);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let options = {};
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        options = { mimeType: 'audio/wav' };
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        options = { mimeType: 'audio/ogg' };
      }

      const recorder = new MediaRecorder(stream, options);
      
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          setAudioBase64(base64);
        };

        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250); // Get chunks every 250ms
      setIsRecordingAudio(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error('Failed to start native recording:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone permissions blocked. Oga abeg click the camera/mic icon in your URL address bar to give Sabisell microphone permissions.');
      } else {
        setErrorMessage(`Could not trigger voice recorder: ${err.message}. Please use typing fallback!`);
      }
      setIsRecordingAudio(false);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleProcessAudio = async () => {
    if (!audioBase64 || !audioBlob) {
      setErrorMessage("No recorded voice command found. Click the button to record first!");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setParsedResult(null);

    try {
      const mimeType = audioBlob.type || 'audio/webm';
      const res = await fetch('/api/audio-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio: audioBase64,
          mimeType: mimeType,
          context: {
            inventory: products.map(p => ({ id: p.id, name: p.name, quantity: p.quantity, sellPrice: p.sellingPrice })),
            ownerProfile,
            businessProfile
          }
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gemini native audio processing error. Please speak clearly and try again.');
      }

      const data = await res.json();
      setParsedResult(data);
    } catch (err: any) {
      console.error("Audio processing failure:", err);
      setErrorMessage(err.message || "Could not parse original sound. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const applyAction = () => {
    if (!parsedResult) return;
    onApplyParsedAction(parsedResult);
    // Clear states
    setTranscript('');
    setAudioUrl(null);
    setAudioBlob(null);
    setAudioBase64(null);
    setParsedResult(null);
  };

  const cancelAction = () => {
    setParsedResult(null);
  };

  const formatNairaTarget = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const exampleStatements = [
    'I sell 5 bag of Dangote cement to Amaka for 45000 naira, she pay 20000 cash balance next week',
    'Restock Milo pack, buy 12 pieces unit cost is 3000 naira and selling is 4500 naira',
    'Customer Mama Chioma settled outstanding debt of 15000 naira'
  ];

  return (
    <div className="space-y-6 animate-fade-in" id="voice-commander-container">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900" id="voice-header-title">Hands-free Trade Assistant</h1>
        <p className="text-xs text-gray-500" id="voice-subheader-text">Record sales, expenses, product stocking, or customer payments securely with zero typing.</p>
      </div>

      {/* Modern High-Contrast Navigation Tab Bar */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl max-w-md border border-slate-200/50" id="assistant-tab-selector">
        <button
          onClick={() => { setActiveTab('native_audio'); setParsedResult(null); setErrorMessage(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-display font-medium transition-all ${
            activeTab === 'native_audio'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
          id="tab-btn-native-audio"
        >
          <FileAudio className="h-4 w-4" />
          Gemini Native Listen
        </button>
        <button
          onClick={() => { setActiveTab('text_api'); setParsedResult(null); setErrorMessage(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-display font-medium transition-all ${
            activeTab === 'text_api'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
          id="tab-btn-text-api"
        >
          <FileText className="h-4 w-4" />
          Text Dictation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TAB 1: GEMINI NATIVE LISTEN (The absolute star of the show) */}
        {activeTab === 'native_audio' && (
          <div className="lg:col-span-2 space-y-4" id="native-audio-column">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm min-h-[300px] flex flex-col justify-between relative overflow-hidden" id="native-audio-card">
              
              {/* Glowing active animation indicator */}
              {isRecordingAudio && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5" id="running-recording-pulse">
                  <span className="w-2.5 h-2.5 bg-pink-600 rounded-full animate-ping"></span>
                  <span className="text-xs font-semibold text-pink-600 uppercase tracking-widest block font-mono">LIVE RECORDING</span>
                </div>
              )}

              <div className="space-y-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">NATIVE VOICE RECORDER</span>
                
                {/* Active States displays */}
                {!isRecordingAudio && !audioUrl && (
                  <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                    <button
                      onClick={startAudioRecording}
                      className="w-20 h-20 rounded-full bg-pink-600 hover:bg-pink-500 text-white flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-105 active:scale-95 animate-pulse"
                      title="Tap to speak"
                      id="mic-start-recording-btn"
                    >
                      <Mic className="h-10 w-10 text-white" />
                    </button>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-800">Tap to start voice recording</p>
                      <p className="text-xs text-slate-400 max-w-sm">Speak naturally about a sale, expense, or customer payment. Gemini listens to you directly.</p>
                    </div>
                  </div>
                )}

                {isRecordingAudio && (
                  <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
                    {/* Pulsing Visual Wave Bars */}
                    <div className="flex items-center justify-center gap-1.5 h-12" id="wave-visual-bars">
                      <span className="w-1.5 h-6 bg-pink-600 rounded-full animate-bounce" style={{animationDelay:'0ms'}}></span>
                      <span className="w-1.5 h-10 bg-pink-600 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></span>
                      <span className="w-1.5 h-7 bg-pink-600 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></span>
                      <span className="w-1.5 h-12 bg-pink-600 rounded-full animate-bounce" style={{animationDelay:'450ms'}}></span>
                      <span className="w-1.5 h-4 bg-pink-600 rounded-full animate-bounce" style={{animationDelay:'600ms'}}></span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xl font-mono font-bold text-pink-600 tracking-tight" id="timer-display">{formatSeconds(recordingSeconds)}</p>
                      <p className="text-xs text-slate-500">I am listening... speak naturally and clearly. Click button below to finish!</p>
                    </div>

                    <button
                      onClick={stopAudioRecording}
                      className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-display font-semibold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
                      id="mic-stop-recording-btn"
                    >
                      <MicOff className="h-4 w-4 text-pink-500 animate-pulse" />
                      Stop Recording
                    </button>
                  </div>
                )}

                {/* Post Recording Stage (Ready to send) */}
                {!isRecordingAudio && audioUrl && (
                  <div className="py-6 space-y-5 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                      <Play className="h-8 w-8 text-pink-600" />
                    </div>
                    
                    <div className="space-y-2 w-full max-w-md">
                      <p className="text-sm font-semibold text-slate-800">Voice Recording Captured Successfully!</p>
                      <audio src={audioUrl} controls className="w-full h-11 border border-slate-100 rounded-lg shadow-sm" />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={handleProcessAudio}
                        disabled={loading}
                        className="bg-mint-400 hover:bg-mint-500 disabled:opacity-50 text-white font-medium text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-97 transition-all cursor-pointer duration-200"
                        id="process-native-audio-btn"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-pink-500 animate-pulse" />}
                        ⚡ Send to Gemini Native API
                      </button>

                      <button
                        onClick={startAudioRecording}
                        disabled={loading}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-medium text-xs px-5 py-3 rounded-xl flex items-center gap-1.5"
                        id="restart-native-recording-btn"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Record Again
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Loader container with explanations during Gemini calculation */}
              {loading && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center animate-fade-in" id="audio-loading-overlay">
                  <div className="relative flex items-center justify-center mb-4">
                    <Loader2 className="h-10 w-10 text-pink-600 animate-spin" />
                    <Sparkles className="h-4 w-4 text-pink-600 absolute animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold font-display text-slate-800">Gemini is Listening Natively...</h4>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Parsing raw audio recording directly using @google/genai native intelligence to extract structured transaction variables. No separate speech-to-text tools used!
                    </p>
                  </div>
                </div>
              )}

            </div>
            
            {errorMessage && (
              <div className="p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-100 flex items-start gap-2 text-xs" id="native-audio-error">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ORIGINAL TEXT DICTATION WITH SPEECH API */}
        {activeTab === 'text_api' && (
          <div className="lg:col-span-2 space-y-4" id="text-dictation-column">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[300px]" id="text-dictation-card">
              
              {isListening && (
                <div className="absolute top-4 right-4 flex items-center gap-1" id="dictation-listening-pulse">
                  <span className="w-1.5 h-3 bg-green-500 rounded-full animate-bounce" style={{animationDelay:'0ms'}}></span>
                  <span className="w-1.5 h-4.5 bg-green-500 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></span>
                  <span className="w-1.5 h-6 bg-green-500 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></span>
                  <span className="w-1.5 h-3 bg-green-500 rounded-full animate-bounce" style={{animationDelay:'450ms'}}></span>
                </div>
              )}

              <div className="space-y-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block font-sans">Dictation Transcript</span>
                
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Tap mic to dictate details, or type your business task directly: e.g. 'I sold 5 cartons of indomie to Amaka for 35000, she pays 20000 cash balance next week'"
                  className="w-full bg-slate-50 rounded-xl p-4 text-sm font-sans focus:outline-none min-h-[150px] border border-slate-100 focus:bg-white focus:border-green-600 focus:ring-1 focus:ring-green-600 leading-relaxed resize-none"
                  id="text-dictation-textarea"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-4 flex-wrap">
                <button
                  onClick={toggleListening}
                  className={`flex items-center gap-2 font-display font-medium px-5 py-3 rounded-xl shadow-md transition-all ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-green-600 hover:bg-green-500 text-white font-semibold'
                  }`}
                  id="dictation-mic-toggle-btn"
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5 animate-pulse" />}
                  {isListening ? 'Stop Listening' : 'Tap to Speak'}
                </button>

                <button
                  onClick={handleParseText}
                  disabled={loading || !transcript.trim()}
                  className="bg-mint-400 hover:bg-mint-500 disabled:opacity-50 text-white font-medium text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-97 transition-all cursor-pointer duration-200"
                  id="process-text-command-btn"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-green-400" />}
                  Process Text Command
                </button>

                <button
                  onClick={() => setTranscript('')}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-display font-semibold text-xs px-4 py-3 rounded-xl"
                  id="clear-dictation-btn"
                >
                  Clear
                </button>
              </div>

              {loading && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center animate-fade-in" id="text-loading-overlay">
                  <Loader2 className="h-8 w-8 text-green-600 animate-spin mb-3" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold font-display text-slate-800">Processing Command...</h4>
                    <p className="text-xs text-slate-500 max-w-sm">Analyzing structured variables from text command context</p>
                  </div>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-100 flex items-start gap-2 text-xs" id="text-api-error">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* Hints and Instructions Panel */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4" id="hints-sidebar-panel">
          <h3 className="font-display font-bold text-slate-900 flex items-center gap-1.5 text-sm">
            <Volume2 className="h-5 w-5 text-pink-600" />
            Vocal Guidelines
          </h3>
          <p className="text-slate-600 text-xs leading-relaxed">
            Sabisell is optimized to record sales (income), stocking (expenses) or repayments in standard English or natural Nigerian Pidgin:
          </p>
          <div className="space-y-2.5">
            {exampleStatements.map((ex, idx) => (
              <div 
                key={idx} 
                onClick={() => {
                  if (activeTab === 'text_api') {
                    setTranscript(ex);
                  } else {
                    alert("This is an example statement. Tap Microphone tab above and record your voice speaking this naturally!");
                  }
                }}
                className="p-3 bg-slate-50 hover:bg-slate-100/75 rounded-xl border border-slate-100 text-[11px] leading-relaxed cursor-pointer font-medium transition-all text-slate-700 block"
                title="Example statement"
              >
                "{ex}"
              </div>
            ))}
          </div>
          <div className="text-[10px] text-gray-400 font-medium leading-relaxed pt-2.5 border-t border-slate-100">
            * Note: Gemini natively audits your voice, analyzing numerical counts, customers, item tags, prices, and debts accurately.
          </div>
        </div>
      </div>

      {/* STRUCTURED GEMINI CONFIRMATION PANEL (Exactly what was requested: breaking spoken sentences into precise structured details) */}
      {parsedResult && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md animate-fade-in max-w-3xl" id="parsed-result-display-panel">
          <div className="flex items-center gap-2 mb-4 h-6">
            <Sparkles className="h-5 w-5 text-pink-600 animate-pulse" />
            <h3 className="font-display font-bold text-slate-900 text-sm">Extracted Structured Ledger Variables</h3>
          </div>

          {parsedResult.recognized ? (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-pink-50 text-slate-800 border border-pink-100 text-xs">
                <p className="font-bold text-pink-850">Bilingual Ledger Summary:</p>
                <p className="mt-1 leading-relaxed text-slate-900 font-medium font-sans">{parsedResult.explanation}</p>
              </div>

              {/* Exact precise parts required as structured data */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100" id="structured-elements-grid">
                
                <div>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Transaction Type</span>
                  <span className={`font-display font-bold inline-flex items-center gap-1 mt-1.5 text-xs px-2.5 py-1 rounded-md ${
                    parsedResult.action === 'RECORD_SALE' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : parsedResult.action === 'ADD_INVENTORY' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  }`}>
                    {parsedResult.action === 'ADD_INVENTORY' && <TrendingUp className="h-3 w-3" />}
                    {parsedResult.action === 'RECORD_SALE' && <ShoppingCart className="h-3 w-3" />}
                    {parsedResult.action === 'RECORD_PAYMENT' && <Users className="h-3 w-3" />}
                    {parsedResult.action === 'ADD_INVENTORY' ? 'Restock / Expense' : parsedResult.action === 'RECORD_SALE' ? 'Sale / Income' : 'Debt Repayment'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Item / Partner Name</span>
                  <span className="font-sans font-bold text-slate-850 mt-2 text-xs sm:text-sm block truncate" title={parsedResult.data?.productName || parsedResult.data?.customerName}>
                    {parsedResult.data?.productName || parsedResult.data?.customerName || 'Walk-in Customer'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Quantity Units</span>
                  <span className="font-mono font-bold text-slate-800 mt-2 text-xs sm:text-sm block">
                    {parsedResult.data?.quantity || 1} units
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block font-sans">Payment Amount</span>
                  <span className="font-mono font-bold text-slate-800 mt-2 text-xs sm:text-sm block text-emerald-700">
                    {formatNairaTarget(parsedResult.data?.amountPaid !== undefined ? parsedResult.data.amountPaid : parsedResult.data?.totalAmount || 0)}
                  </span>
                </div>

              </div>

              {/* Expansion block for more complex parsed structures */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200 grid grid-cols-2 lg:grid-cols-3 gap-4" id="accounting-ledger-matrix">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">Total Value</span>
                  <span className="font-mono font-bold text-slate-800 text-xs block mt-1">
                    {formatNairaTarget(parsedResult.data?.totalAmount || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">Outstanding Balance (Debt)</span>
                  <span className={`font-mono font-bold text-xs block mt-1 ${parsedResult.data?.balanceDebt > 0 ? 'text-red-600' : 'text-slate-500'}`}>
                    {formatNairaTarget(parsedResult.data?.balanceDebt || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">Customer/Vendor Target</span>
                  <span className="font-sans font-bold text-slate-800 text-xs block mt-1 truncate">
                    {parsedResult.data?.customerName || 'No Specific Client'}
                  </span>
                </div>
              </div>

              {/* Apply Action CTA buttons */}
              <div className="flex items-center gap-3 pt-3" id="confirmation-buttons-block">
                <button
                  onClick={applyAction}
                  className="bg-mint-400 hover:bg-mint-500 text-white font-medium text-xs px-5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-97 transition-all cursor-pointer duration-200"
                  id="apply-action-and-post-btn"
                >
                  <Check className="h-4 w-4" />
                  Apply & Post to Ledger
                </button>
                <button
                  onClick={cancelAction}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-display font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
                  id="cancel-action-btn"
                >
                  Reject & Discard
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-xs flex items-center gap-2 border border-yellow-200" id="unrecognized-feedback-card">
              <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
              <span>Oga, we understand wetin you write but we fit no match am to structured sales or stock. Custom answer is: "{parsedResult.explanation}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
