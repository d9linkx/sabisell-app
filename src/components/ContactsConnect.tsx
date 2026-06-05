import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  Sparkles, 
  Loader2, 
  Plus, 
  Trash2, 
  BookOpen, 
  ArrowUpRight,
  ClipboardCheck,
  Building,
  AlertCircle
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  type: 'Builder/Contracter' | 'Caterer/Hotel' | 'Tailor/Fashion Designer' | 'Retail Buyer' | 'Wholesaler' | 'Other';
  notes?: string;
}

export default function ContactsConnect() {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 'c-1',
      name: 'Engr. Babajide',
      phoneNumber: '08031122334',
      type: 'Builder/Contracter',
      notes: 'Manages building sites around Ikeja. Needs cement and steel rods regularly.'
    },
    {
      id: 'c-2',
      name: 'Mrs. Fatima (Chop Rich Catering)',
      phoneNumber: '08129988776',
      type: 'Caterer/Hotel',
      notes: 'Caters for local weddings and events. Needs Golden Penny flour and grains in bulk.'
    },
    {
      id: 'c-3',
      name: 'Amaka Fashion Boutique',
      phoneNumber: '09012345678',
      type: 'Tailor/Fashion Designer',
      notes: 'Designs premium Ankara wears. Needs quality fabrics and threads.'
    }
  ]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<Contact['type']>('Retail Buyer');
  const [notes, setNotes] = useState('');

  // AI Pitch state
  const [loadingPitch, setLoadingPitch] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [generatedPitch, setGeneratedPitch] = useState('');
  const [offerProduct, setOfferProduct] = useState('');

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newContact: Contact = {
      id: 'c-' + Date.now(),
      name,
      phoneNumber: phone,
      type,
      notes
    };

    setContacts([...contacts, newContact]);
    setName('');
    setPhone('');
    setType('Retail Buyer');
    setNotes('');
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
    if (selectedContact?.id === id) {
      setSelectedContact(null);
      setGeneratedPitch('');
    }
  };

  // Ask Gemini to write a custom pitch based on the contact type and product
  const handleGeneratePitch = async () => {
    if (!selectedContact || !offerProduct.trim()) return;

    setLoadingPitch(true);
    setGeneratedPitch('');

    try {
      const prompt = `Write a short, highly appealing WhatsApp marketing message in polite, enthusiastic Nigerian English/Pidgin as a small business owner.
      Target Client Name: ${selectedContact.name}
      Client Occupation/Niche: ${selectedContact.type}
      Special notes about them: ${selectedContact.notes || 'None'}
      Product/Service offered: ${offerProduct}

      Draft a friendly, non-spammy personal proposal. Highlight speed, quality, and a sweet market pricing offer. Keep it brief so it fits nicely on mobile WhatsApp context without needing to click 'read more'.`;

      const res = await fetch('/api/voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: prompt }),
      });

      if (!res.ok) {
        throw new Error('Chai! Gemini pitch generator failed. Confirm API keys are working properly.');
      }

      const data = await res.json();
      setGeneratedPitch(data.explanation || data.text || 'Failed to compose. Try manual.');
    } catch (err: any) {
      setGeneratedPitch(`Oga! Please make sure your GEMINI_API_KEY is active in Settings, or compose a quick message manually. For now, draft your offer: "Hello ${selectedContact.name}, we get brand new ${offerProduct} in stock for you today! Abeg make we negotiate."`);
    } finally {
      setLoadingPitch(false);
    }
  };

  const getWhatsAppLink = (c: Contact, text: string) => {
    const cleaned = c.phoneNumber.replace(/\s+/g, '').replace(/^\+/, '');
    let parsedPhone = cleaned;
    if (cleaned.startsWith('0')) {
      parsedPhone = '234' + cleaned.slice(1);
    }
    return `https://wa.me/${parsedPhone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">Contact & Service Connect</h1>
        <p className="text-xs text-gray-500">Connect with local target clients, builders, or caterers who need your products, and generate high-conversion WhatsApp trade pitches.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Input list */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-1">
            <Users className="h-4.5 w-4.5 text-green-600" />
            Register Hot Lead / Contact
          </h3>

          <form onSubmit={handleAddContact} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Client / Contact Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Engr. Kola, Mummy Ebube"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 focus:border-green-500 focus:bg-white text-xs px-4 py-2.5 rounded-xl focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">WhatsApp Phone Number</label>
              <input
                type="tel"
                required
                placeholder="e.g. 08031234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 focus:border-green-500 focus:bg-white text-xs px-4 py-2.5 rounded-xl focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">What they typically buy</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-100 px-3 py-2.5 rounded-xl text-xs focus:outline-none"
              >
                <option value="Builder/Contracter">Builder / Contractor (Needs cement/rods)</option>
                <option value="Caterer/Hotel">Caterer / Hotel (Needs flour/rice)</option>
                <option value="Tailor/Fashion Designer">Tailor / Designer (Needs fabrics)</option>
                <option value="Retail Buyer">Regular Retail Consumer</option>
                <option value="Wholesaler">Wholesale Distributor</option>
                <option value="Other">Other Business Niche</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Specific client notes / timing</label>
              <textarea
                placeholder="Specify preferred delivery times, discount levels or trade patterns..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 text-xs p-3 rounded-xl min-h-[70px] focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-display font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
            >
              <Plus className="h-4 w-4" />
              Store Lead Contact
            </button>
          </form>
        </div>

        {/* List of Contacts */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-display font-bold text-slate-900 text-sm">Active Contacts Directory</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contacts.map(contact => (
              <div 
                key={contact.id}
                onClick={() => {
                  setSelectedContact(contact);
                  setGeneratedPitch('');
                }}
                className={`p-4 border rounded-2xl cursor-pointer transition-all ${
                  selectedContact?.id === contact.id
                    ? 'border-green-500 bg-primary-50/50 shadow-sm'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'
                }`}
              >
                <div className="flex justify-between items-start gap-1">
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500">
                    <Building className="h-3 w-3" />
                    {contact.type}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteContact(contact.id);
                    }}
                    className="text-gray-400 hover:text-red-600 p-0.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <h4 className="font-display font-bold text-slate-900 text-sm mt-1">{contact.name}</h4>
                <p className="text-xs text-slate-600 mt-1 font-mono">{contact.phoneNumber}</p>
                {contact.notes && pNotes(contact.notes)}
              </div>
            ))}
          </div>

          {/* Connected Lead Generator panel */}
          {selectedContact && (
            <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl animate-fade-in space-y-4">
              <div className="flex items-center gap-1.5 border-b border-slate-200/50 pb-3">
                <Sparkles className="h-4.5 w-4.5 text-green-600" />
                <h4 className="font-display font-bold text-slate-900 text-xs">
                  Compose WhatsApp Pitch For: <span className="underline">{selectedContact.name}</span>
                </h4>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Specify Product or Service to Promote</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Dangote Cement 50kg, Golden Penny Flour, Ankara Fabric"
                      value={offerProduct}
                      onChange={(e) => setOfferProduct(e.target.value)}
                      className="flex-grow bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none"
                    />
                    <button
                      onClick={handleGeneratePitch}
                      disabled={loadingPitch || !offerProduct.trim()}
                      className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-display font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow"
                    >
                      {loadingPitch ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-green-300" />}
                      Generate AI Pitch
                    </button>
                  </div>
                </div>

                {generatedPitch && (
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 font-sans">
                    <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">Suggested Pitch Message</span>
                    <p className="text-xs leading-relaxed text-slate-900 whitespace-pre-wrap">{generatedPitch}</p>
                    
                    <div className="pt-2 border-t border-slate-100 flex gap-2">
                      <a
                        href={getWhatsAppLink(selectedContact, generatedPitch)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-display font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 shadow"
                      >
                        Pitch live on WhatsApp
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function pNotes(text: string) {
  return (
    <p className="text-[11px] text-gray-500 mt-2 leading-relaxed italic border-t border-slate-200/40 pt-1.5">
      "{text}"
    </p>
  );
}
