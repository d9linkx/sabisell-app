import React, { useState } from 'react';
import { 
  User, 
  Building, 
  Save, 
  Phone, 
  Mail, 
  MapPin, 
  Sparkles, 
  Check, 
  Shield, 
  Globe, 
  Info,
  RotateCcw,
  LogOut,
  AlertTriangle,
  X
} from 'lucide-react';
import { OwnerProfile, BusinessProfile, isOrganizationCategory } from '../types';

interface BusinessSettingsProps {
  ownerProfile: OwnerProfile;
  businessProfile: BusinessProfile;
  onSaveProfiles: (owner: OwnerProfile, business: BusinessProfile) => void;
  onLogout: () => void;
}

export default function BusinessSettings({ 
  ownerProfile, 
  businessProfile, 
  onSaveProfiles,
  onLogout
}: BusinessSettingsProps) {
  // Owner profile local state
  const [fullName, setFullName] = useState(ownerProfile.fullName);
  const [phone, setPhone] = useState(ownerProfile.phone);
  const [email, setEmail] = useState(ownerProfile.email);
  
  // Business profile local state
  const [businessName, setBusinessName] = useState(businessProfile.businessName);
  const [category, setCategory] = useState(businessProfile.category);
  const [address, setAddress] = useState(businessProfile.address);
  const [currency, setCurrency] = useState(businessProfile.currency);
  const [whatsappGreeting, setWhatsappGreeting] = useState(businessProfile.whatsappGreeting);
  const [whatsappReminderSuffix, setWhatsappReminderSuffix] = useState(businessProfile.whatsappReminderSuffix);
  const [logoUrl, setLogoUrl] = useState(businessProfile.logoUrl || '');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Detect if current category describes an organization
  const isOrg = isOrganizationCategory(category);

  // Auto-generate avatars text
  const getInitials = (name: string) => {
    if (!name) return 'SM';
    const split = name.trim().split(/\s+/);
    if (split.length === 1) return split[0].slice(0, 2).toUpperCase();
    return (split[0][0] + split[split.length - 1][0]).toUpperCase();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedOwner: OwnerProfile = {
      fullName,
      phone,
      email,
      avatarText: getInitials(fullName)
    };

    const updatedBusiness: BusinessProfile = {
      businessName,
      category,
      address,
      currency,
      whatsappGreeting,
      whatsappReminderSuffix,
      logoUrl
    };

    onSaveProfiles(updatedOwner, updatedBusiness);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans font-light">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-display font-light text-ash-900 tracking-tight">
            {isOrg ? 'Organization Profile & Settings' : 'SME Profile & Settings'}
          </h1>
          <p className="text-xs text-ash-500 font-light">
            {isOrg 
              ? 'Manage your personal administrator profile, organization details, system values and customized templates.'
              : 'Manage your personal merchant profile, shop details, target business values and customized templates.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Status Indicator Bar */}
        {savedSuccess && (
          <div className="p-3 bg-mint-50 border border-mint-200/40 text-mint-700 text-xs rounded-xl flex items-center gap-2 animate-slide-up">
            <Check className="h-4.5 w-4.5 text-mint-500 bg-white rounded-full p-0.5" />
            <span className="font-normal">
              {isOrg
                ? 'Your profiles and organization preferences have been updated successfully!'
                : 'Your profiles and platform preferences have been updated successfully! Sabisell defaults saved.'}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Panel: Business Owner Profile Settings */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 border border-ash-200 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-ash-100">
              <div className="w-8 h-8 bg-mint-50 rounded-lg flex items-center justify-center">
                <User className="h-4.5 w-4.5 text-mint-500" />
              </div>
              <div>
                <h3 className="font-display font-normal text-ash-800 text-sm">
                  {isOrg ? "Administrator's Profile" : "Business Owner's Profile"}
                </h3>
                <p className="text-[10px] text-ash-400">
                  {isOrg 
                    ? "Personal details for coordinator/director sign-offs and statements."
                    : "Personal details for SMS/WhatsApp sign-offs and reporting."}
                </p>
              </div>
            </div>

            {/* Avatar Preview Card */}
            <div className="bg-ash-fb rounded-2xl p-4 border border-ash-100 flex items-center gap-4">
              <div className="w-14 h-14 bg-mint-400 text-white rounded-full font-display text-lg font-normal flex items-center justify-center shadow-xs border-2 border-white uppercase">
                {getInitials(fullName)}
              </div>
              <div className="space-y-1">
                <span className="bg-mint-50 text-mint-705 text-[9px] px-2 py-0.5 rounded-full border border-mint-200/30 font-normal">Active Administrator</span>
                <p className="text-sm font-normal text-ash-800">{fullName || (isOrg ? 'Unnamed Administrator' : 'Unnamed Merchant')}</p>
                <p className="text-[11px] text-ash-400 font-mono">{email || 'no-email@sabisell.com'}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-normal text-ash-600 flex items-center gap-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isOrg ? "e.g. Principal Emmanuel Okocha" : "e.g. Oga Emmanuel Okocha"}
                    className="w-full bg-ash-50 hover:bg-ash-100/30 border border-ash-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-mint-400 transition-all font-light"
                  />
                </div>
              </div>

              {/* Owner Email */}
              <div className="space-y-1">
                <label className="text-xs font-normal text-ash-600">Contact Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@sabisell.com"
                    className="w-full bg-ash-50 hover:bg-ash-100/30 border border-ash-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-mint-400 transition-all font-light"
                  />
                </div>
              </div>

              {/* Owner Phone */}
              <div className="space-y-1">
                <label className="text-xs font-normal text-ash-600">Mobile Phone / Contact (WhatsApp)</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +234 803 123 4567"
                    className="w-full bg-ash-50 hover:bg-ash-100/30 border border-ash-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-mint-400 transition-all font-light font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Quick Security Badge */}
            <div className="p-3.5 bg-ash-fb text-ash-500 text-[11px] rounded-xl border border-ash-100 flex items-start gap-2.5">
              <Shield className="h-4 w-4 text-ash-400 mt-0.5 flex-shrink-0" />
              <span>This device terminal stores owner identities secure-ready in sandboxed local application directories. Nobody else sees your contact details.</span>
            </div>
          </div>

          {/* Right Panel: Business Settings & Invoices Template configuration */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 border border-ash-200 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-ash-100">
              <div className="w-8 h-8 bg-mint-50 rounded-lg flex items-center justify-center">
                <Building className="h-4.5 w-4.5 text-mint-500" />
              </div>
              <div>
                <h3 className="font-display font-normal text-ash-800 text-sm">
                  {isOrg ? "Organization / Institution Profile" : "Business Shop Profile"}
                </h3>
                <p className="text-[10px] text-ash-400">
                  {isOrg 
                    ? "Configure public organization info, currency, and template settings."
                    : "Configure public enterprise info, currency, and WhatsApp text templates."}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Business Name */}
                <div className="space-y-1">
                  <label className="text-xs font-normal text-ash-600">
                    {isOrg ? "Organization Name" : "Business Brand Name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder={isOrg ? "e.g. Redeemer International Academy" : "e.g. Sabisell Foodstuff Ltd"}
                    className="w-full bg-ash-50 hover:bg-ash-100/30 border border-ash-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-mint-400 transition-all font-light"
                  />
                </div>

                {/* Business Sector / Category */}
                <div className="space-y-1">
                  <label className="text-xs font-normal text-ash-600">Category / Type</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-ash-50 border border-ash-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-mint-400 transition-all font-light"
                  >
                    <option value="Provisions & Retail">Provisions & Retail</option>
                    <option value="Building Materials">Building Materials</option>
                    <option value="Grains & Foodstuffs">Grains & Foodstuffs</option>
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Electronic Goods">Electronic Goods</option>
                    <option value="General Merchandising">General Merchandising</option>
                    <option value="School / Educational Academy">School / Educational Academy</option>
                    <option value="Church / Religious Place">Church / Religious Place</option>
                    <option value="NGO / Non-Profit / Charity">NGO / Non-Profit / Charity</option>
                    <option value="Association / Community Club">Association / Community Club</option>
                  </select>
                </div>
              </div>

              {/* Physical Shop Address */}
              <div className="space-y-1">
                <label className="text-xs font-normal text-ash-600">
                  {isOrg ? "Organization Physical Address" : "Shop Physical Address / Market Location"}
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={isOrg ? "e.g. 12 Academy Road, Victoria Island, Lagos, Nigeria" : "e.g. Shop 42, Alaba International Market, Ojo, Lagos, Nigeria"}
                  className="w-full bg-ash-50 hover:bg-ash-100/30 border border-ash-200 text-xs p-3 rounded-xl focus:outline-none focus:bg-white focus:border-mint-400 transition-all font-light resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Currency preference */}
                <div className="space-y-1">
                  <label className="text-xs font-normal text-ash-600">Settle Currency Symbol</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-ash-50 border border-ash-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-mint-400 font-normal"
                  >
                    <option value="₦">Nigerian Naira (₦)</option>
                    <option value="$">US Dollar ($)</option>
                    <option value="£">British Pound (£)</option>
                    <option value="€">Euro (€)</option>
                  </select>
                </div>
                
                {/* Visual Verification Banner */}
                <div className="p-3 bg-mint-50/50 rounded-xl border border-mint-200/30 flex items-center gap-1.5 self-end h-[42px] mb-0.5">
                  <Globe className="h-3.5 w-3.5 text-mint-500 animate-spin" />
                  <span className="text-[10px] text-mint-750 font-normal">Naira Market Zone Active</span>
                </div>
              </div>

              {/* Business Logo Upload Widget */}
              <div className="space-y-2 pt-2 border-t border-ash-100/60">
                <label className="text-xs font-semibold text-ash-700 block">
                  Business Logo / Shop Photo
                </label>
                <div className="border border-dashed border-ash-200 hover:border-mint-400 bg-ash-fb hover:bg-white rounded-2xl p-4 transition-all flex flex-col items-center justify-center text-center relative group">
                  {logoUrl ? (
                    <div className="flex flex-col items-center gap-3">
                      <img 
                        src={logoUrl} 
                        alt="Business Logo" 
                        className="w-16 h-16 rounded-xl object-cover shadow-sm border border-ash-200" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1">
                        <p className="text-xs font-normal text-ash-800">Your Business Logo is Active</p>
                        <button
                          type="button"
                          onClick={() => setLogoUrl('')}
                          className="text-[10px] text-red-650 hover:underline cursor-pointer font-semibold"
                        >
                          Remove and upload another
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center py-4">
                      <div className="w-10 h-10 bg-mint-50 group-hover:bg-mint-100 rounded-full flex items-center justify-center text-mint-500 mb-2 transition-colors">
                        <Building className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-normal text-ash-700">Click or Drag & Drop to select photo</p>
                      <p className="text-[10px] text-ash-400 mt-1">Accepts PNG, JPG (base64 saved securely)</p>
                      <p className="text-[10px] text-mint-600 font-semibold bg-mint-50/55 px-2 py-0.5 rounded-md mt-2">
                        💡 Direct upload: This is for your Business Logo instead of a regular profile photo!
                      </p>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setLogoUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Advanced Invoice custom greetings */}
              <div className="pt-2 border-t border-ash-100 space-y-3">
                <h4 className="text-xs font-normal text-ash-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles className="h-3.5 w-3.5 text-mint-500" />
                  WhatsApp Receipt Templates
                </h4>
                
                <div className="space-y-2">
                  <div className="space-y-1">
                    <span className="text-[10px] text-ash-400 block uppercase font-normal">1. Invoice Prefix Draft</span>
                    <input
                      type="text"
                      value={whatsappGreeting}
                      onChange={(e) => setWhatsappGreeting(e.target.value)}
                      placeholder="e.g. Hello, well done! Here na your invoice from Sabisell:"
                      className="w-full bg-ash-50 border border-ash-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:bg-white focus:border-mint-400 transition-all font-light"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-ash-400 block uppercase font-normal">2. Payment Signoff / Instructions</span>
                    <input
                      type="text"
                      value={whatsappReminderSuffix}
                      onChange={(e) => setWhatsappReminderSuffix(e.target.value)}
                      placeholder="e.g. Please, transfer into my specified bank. Thank you!"
                      className="w-full bg-ash-50 border border-ash-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:bg-white focus:border-mint-400 transition-all font-light"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="bg-mint-400 hover:bg-mint-500 text-white text-xs font-normal py-3 px-6 rounded-xl flex items-center gap-2 shadow-sm hover:scale-102 transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            Save SME & Owner Configuration
          </button>
        </div>

        {/* Sign Out & Accounts Protection Area */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-red-100 shadow-3xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-red-650 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                SME Security Danger Zone
              </h4>
              <p className="text-xs text-ash-500 font-light leading-relaxed">
                Log out of your Sabisell cloud books. This will clear active app sessions and lock your local Sabisell record book caches on this device.
              </p>
            </div>
            <button
              onClick={() => setShowConfirmLogout(true)}
              type="button"
              className="bg-red-50 hover:bg-red-105 text-red-650 hover:text-red-700 border border-red-200/60 text-xs font-semibold py-3 px-5 rounded-xl cursor-pointer transition-all active:scale-98 flex items-center justify-center gap-2 self-start sm:self-auto"
            >
              <LogOut className="h-4 w-4" />
              Sign Out of My Account
            </button>
          </div>
        </div>

      </form>

      {/* Confirmation Modal overlay with smooth modern glass backdrop */}
      {showConfirmLogout && (
        <div id="logout-confirm-modal" className="fixed inset-0 bg-ash-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white rounded-2xl border border-ash-200 shadow-2xl max-w-sm w-full overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-ash-100 flex items-center justify-between bg-ash-fb">
              <div className="flex items-center gap-2 text-red-650 font-display font-medium text-sm">
                <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
                <span>Confirm Sign Out</span>
              </div>
              <button 
                onClick={() => setShowConfirmLogout(false)}
                type="button"
                className="text-ash-400 hover:text-ash-700 hover:bg-ash-100 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3 text-left">
              <h3 className="text-sm font-display font-normal text-ash-900 tracking-tight">
                Are you sure you want to log out of Sabisell?
              </h3>
              <p className="text-xs text-ash-500 leading-relaxed font-light">
                This will end your active session and lock your local shop ledger. You will need to sign back in with your password to view your debts and items.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="p-5 bg-ash-fb border-t border-ash-150/40 flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirmLogout(false)}
                className="w-full sm:w-auto px-4 py-2.5 border border-ash-200 hover:border-ash-300 bg-white text-ash-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors active:scale-98 text-center"
              >
                No, mistake
              </button>
              
              <button
                type="button"
                onClick={async () => {
                  setIsLoggingOut(true);
                  setTimeout(() => {
                    onLogout();
                    setShowConfirmLogout(false);
                    setIsLoggingOut(false);
                  }, 800);
                }}
                disabled={isLoggingOut}
                className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors active:scale-98 flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 text-center hover:opacity-95"
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Exiting...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-3.5 w-3.5 text-white" />
                    <span>Yes, log me out</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
