import React, { useState } from 'react';
import { 
  account, 
  databases, 
  ID, 
  getAppwriteStatus, 
  applyAppwriteConfig,
  APPWRITE_DATABASE_ID,
  APPWRITE_USERS_COLLECTION_ID,
  setAppwriteSession
} from '../appwrite';
import { OwnerProfile, BusinessProfile, isOrganizationCategory, getOrganizationTerminology } from '../types';
import { SabisellLogo } from './SabisellLogo';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  Building, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Award,
  AlertCircle,
  Database,
  HelpCircle,
  Copy,
  CheckCircle2,
  Settings,
  X
} from 'lucide-react';
import { motion } from 'motion/react';

interface AuthScreenProps {
  onAuthSuccess: (owner: OwnerProfile, business: BusinessProfile, appwriteUser: any) => void;
  onBackToHome?: () => void;
}

export default function AuthScreen({ onAuthSuccess, onBackToHome }: AuthScreenProps) {
  const appwriteStatus = getAppwriteStatus();

  // Onboarding / Config states
  const [configEndpoint, setConfigEndpoint] = useState(appwriteStatus.endpoint);
  const [configProjectId, setConfigProjectId] = useState(appwriteStatus.projectId);
  const [configDatabaseId, setConfigDatabaseId] = useState(appwriteStatus.databaseId);
  const [configUsersCol, setConfigUsersCol] = useState(appwriteStatus.usersCollection);
  const [configProductsCol, setConfigProductsCol] = useState(appwriteStatus.productsCollection);
  const [configSalesCol, setConfigSalesCol] = useState(appwriteStatus.salesCollection);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Authentication states
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('Provisions & Retail');
  const isOrg = isOrganizationCategory(category);
  const terms = getOrganizationTerminology(category, isOrg);
  const [showAlignmentGuide, setShowAlignmentGuide] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const getInitials = (name: string) => {
    if (!name) return 'SM';
    const split = name.trim().split(/\s+/);
    if (split.length === 1) return split[0].slice(0, 2).toUpperCase();
    return (split[0][0] + split[split.length - 1][0]).toUpperCase();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configProjectId.trim()) {
      setErrorMsg('Appwrite Project ID cannot be empty');
      return;
    }
    applyAppwriteConfig({
      endpoint: configEndpoint || 'https://cloud.appwrite.io/v1',
      projectId: configProjectId.trim(),
      databaseId: configDatabaseId || 'sabisell_db',
      usersCol: configUsersCol || 'users',
      productsCol: configProductsCol || 'products',
      salesCol: configSalesCol || 'sales'
    });
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
       if (isSignUp) {
        // Validation check
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long for Appwrite security.');
        }
        if (!fullName.trim() || !businessName.trim()) {
          throw new Error('Please fill in your name and business details.');
        }

        // Create user in Appwrite Auth
        const userId = ID.unique();
        const createdUser = await account.create(userId, email.trim(), password, fullName.trim());

        // Create email session safely (delete any existing leftover browser sessions first)
        try {
          await account.deleteSession('current');
        } catch (_) {
          // No current session
        }
        const session = await account.createEmailPasswordSession(email.trim(), password);
        if (session && session.$id) {
          setAppwriteSession(session.$id);
        }

        // Custom profiles definition
        const initialOwner: OwnerProfile = {
          fullName: fullName.trim(),
          phone: '',
          email: createdUser.email || email.trim(),
          avatarText: getInitials(fullName)
        };

        const initialBusiness: BusinessProfile = {
          businessName: businessName.trim(),
          category: category,
          address: 'No custom address specified yet.',
          currency: '₦',
          whatsappGreeting: 'Hello, here na your invoice from Sabisell:',
          whatsappReminderSuffix: 'Please, fit negotiate or pay directly into my bank account. Thank you for your business!'
        };

        let dbWriteSuccess = true;
        let dbWriteErrorMessage = '';

        // Save defaults directly into Appwrite Databases under users collection
        try {
          await databases.createDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_USERS_COLLECTION_ID,
            createdUser.$id, // Make document ID match Appwrite user ID for simple joins
            {
              fullName: initialOwner.fullName,
              phone: initialOwner.phone,
              email: initialOwner.email,
              avatarText: initialOwner.avatarText,
              businessName: initialBusiness.businessName,
              category: initialBusiness.category,
              address: initialBusiness.address,
              currency: initialBusiness.currency,
              whatsappGreeting: initialBusiness.whatsappGreeting,
              whatsappReminderSuffix: initialBusiness.whatsappReminderSuffix,
              updatedAt: new Date().toISOString()
            }
          );
        } catch (dbErr: any) {
          console.warn('[Appwrite DB Init Profile Error during signup (non-blocking)]:', dbErr);
          dbWriteSuccess = false;
          dbWriteErrorMessage = dbErr.message || '';
        }        // SUCESSFUL SIGN UP - Keep them logged in and invoke onAuthSuccess immediately!
        if (!dbWriteSuccess) {
          // If the users database collection isn't aligned yet, let them know but proceed into dashboard
          console.warn('Database user row alignment warning during signup: ' + dbWriteErrorMessage);
        }
        
        setPassword('');
        setSuccessMsg('🎉 Sabisell account created successfully! Redirecting you into the dashboard...');
        setTimeout(() => {
          onAuthSuccess(initialOwner, initialBusiness, createdUser);
        }, 1300);
      } else {
        // Sign In securely by clearing active sessions first
        try {
          await account.deleteSession('current');
        } catch (_) {
          // No active session
        }
        const session = await account.createEmailPasswordSession(email.trim(), password);
        if (session && session.$id) {
          setAppwriteSession(session.$id);
        }
        const userDetails = await account.get();
  
        // Pass transient details, fetch the latest custom document from the database
        let finalOwner: OwnerProfile = {
          fullName: userDetails.name || 'Sabisell Merchant',
          phone: '',
          email: userDetails.email || email.trim(),
          avatarText: getInitials(userDetails.name || 'Sabisell Merchant')
        };
        let finalBusiness: BusinessProfile = {
          businessName: 'My Sabisell Store',
          category: 'Retail Goods',
          address: 'Lagos, Nigeria',
          currency: '₦',
          whatsappGreeting: 'Hello, here na your invoice from Sabisell:',
          whatsappReminderSuffix: 'Please buy now, transfer to my bank.'
        };

        try {
          const docRes = await databases.getDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_USERS_COLLECTION_ID,
            userDetails.$id
          );
          
          finalOwner = {
            fullName: docRes.fullName || userDetails.name || 'Sabisell Merchant',
            phone: docRes.phone || '',
            email: docRes.email || userDetails.email || '',
            avatarText: docRes.avatarText || 'SM'
          };
          finalBusiness = {
            businessName: docRes.businessName || 'My Sabisell Store',
            category: docRes.category || 'Retail Goods',
            address: docRes.address || 'Lagos, Nigeria',
            currency: docRes.currency || '₦',
            whatsappGreeting: docRes.whatsappGreeting || 'Hello, here na your invoice from Sabisell:',
            whatsappReminderSuffix: docRes.whatsappReminderSuffix || 'Please buy now, transfer to my bank.'
          };
        } catch (dbErr: any) {
          console.log('[AuthScreen login fetch custom profile error/not found]:', dbErr);
          // Auto create row if it doesn't exist, to align the document for saving preferences later
          try {
            await databases.createDocument(
              APPWRITE_DATABASE_ID,
              APPWRITE_USERS_COLLECTION_ID,
              userDetails.$id,
              {
                fullName: finalOwner.fullName,
                phone: finalOwner.phone,
                email: finalOwner.email,
                avatarText: finalOwner.avatarText,
                businessName: finalBusiness.businessName,
                category: finalBusiness.category,
                address: finalBusiness.address,
                currency: finalBusiness.currency,
                whatsappGreeting: finalBusiness.whatsappGreeting,
                whatsappReminderSuffix: finalBusiness.whatsappReminderSuffix,
                updatedAt: new Date().toISOString()
              }
            );
          } catch (createErr) {
            console.warn('[AuthScreen login default profile creation failure]:', createErr);
          }
        }
 
        setPassword('');
        setSuccessMsg('⚡ Welcome back! Login successful, loading your ledger record books...');
        setTimeout(() => {
          onAuthSuccess(finalOwner, finalBusiness, userDetails);
        }, 1300);
      }
    } catch (err: any) {
      console.error('[Appwrite Auth Screen Error]:', err);
      let translateError = err.message || 'An unexpected connection error occurred.';
      if (err.type === 'user_already_exists') {
        translateError = 'This email address is already registered on Sabisell.';
      } else if (err.type === 'user_invalid_email') {
        translateError = 'Please enter a valid email address.';
      } else if (err.type === 'user_password_to_weak' || translateError.includes('password')) {
        translateError = 'Appwrite password must be at least 8 characters long.';
      } else if (err.type === 'user_invalid_credentials' || err.code === 401) {
        translateError = 'Incorrect email or password details. Verify and try again!';
      }
      setErrorMsg(translateError);
    } finally {
      setLoading(false);
    }
  };

  // If Appwrite is not configured yet, show the Guide step-by-step onboarding
  if (!appwriteStatus.isConfigured) {
    return (
      <div className="min-h-screen bg-ash-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 font-sans font-light">
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-8 border border-ash-200 shadow-lg grid grid-cols-1 md:grid-cols-12 gap-6 divide-y md:divide-y-0 md:divide-x divide-ash-100"
        >
          {/* Left instructions block */}
          <div className="md:col-span-7 pr-0 md:pr-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 bg-mint-400 rounded-xl flex items-center justify-center text-white">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-display font-medium text-ash-900">Appwrite Setup Guide</h3>
                <span className="text-[10px] text-ash-400 font-normal uppercase tracking-widest block">SABISELL DATABASE CONFIGURATION</span>
              </div>
            </div>

            <div className="space-y-4 text-xs text-ash-600 leading-relaxed">
              <p>
                Sabisell has migrated its backend ledger to **Appwrite Database and Authentication**! To power your store ledger books, please execute the following setup on your cloud or local Appwrite Console:
              </p>

              <div className="space-y-3.5 pt-2">
                {/* Step 1 */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-ash-100 text-ash-700 font-bold flex items-center justify-center text-[10px]">1</span>
                    <strong className="text-ash-800 text-xs text-mint-700 uppercase tracking-wide">Create Appwrite Web Platform (Yes, use Vercel!)</strong>
                  </div>
                  <p className="pl-7 text-ash-500 text-[11.5px] leading-relaxed">
                    Since you host on **Vercel**, go to your Appwrite Dashboard &gt; **Integrations &gt; Add Platform &gt; Choose Web App**. 
                    <br />
                    Add these hostnames to the dashboard field:
                    <span className="block mt-1 space-y-1 font-mono text-[10px]">
                      <span className="block">- 🌐 Production Host: <code className="bg-mint-50/50 border border-mint-200 text-mint-700 px-1 rounded select-all font-semibold">sabisell2.vercel.app</code></span>
                      <span className="block">- 💻 Local Hostname: <code className="bg-ash-fb border px-1 rounded select-all text-ash-700">localhost</code></span>
                      <span className="block">- 👁️ Live Preview: <code className="bg-ash-fb border px-1 rounded select-all text-ash-700">{typeof window !== 'undefined' ? window.location.hostname : 'AIS-Dev-Preview'}</code></span>
                    </span>
                  </p>
                </div>

                {/* Step 2 */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-ash-100 text-ash-700 font-bold flex items-center justify-center text-[10px]">2</span>
                    <strong className="text-ash-800 text-xs">Enable Email Password Auth</strong>
                  </div>
                  <p className="pl-7 text-ash-500 text-[11px]">
                    Under **Auth &gt; Settings &gt; Auth Methods**, ensure that the **Email/Password** provider toggle switch is active.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-ash-100 text-ash-700 font-bold flex items-center justify-center text-[10px]">3</span>
                    <strong className="text-ash-800 text-xs">Database & Collections Configuration</strong>
                  </div>
                  <p className="pl-7 text-ash-500 text-[11px] space-y-2">
                    <span>Create a Database named <strong className="text-ash-700">sabisell_db</strong>. Then, create the following **3 Collections** with Document Permissions set to <code className="font-mono text-[10px] bg-ash-50 p-0.5 border border-ash-200 text-ash-800 rounded">"Any" (or "Users") can read/write</code>:</span>
                    
                    <span className="block mt-1 pt-1 border-t border-dashed border-ash-100 space-y-1">
                      <span className="flex items-center justify-between text-[11px]">
                        <span>📂 Collection <strong className="text-ash-750 font-mono">users</strong> (User Profiles):</span>
                        <button onClick={() => copyToClipboard('users')} className="text-mint-600 hover:text-mint-700 flex items-center gap-0.5 cursor-pointer">
                          {copiedText === 'users' ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </span>
                      <span className="block text-[10px] text-ash-400 leading-tight pl-2 space-y-1 bg-ash-50 p-1.5 rounded border border-ash-200/50">
                        <span className="block font-semibold text-ash-600 border-b pb-0.5 mb-1 text-[9.5px]">Create Attributes:</span>
                        <span className="block">- <strong className="font-mono bg-white px-0.5">fullName</strong> (String, size 256, Required)</span>
                        <span className="block">- <strong className="font-mono bg-white px-0.5">email</strong> (String, size 256, Required)</span>
                        <span className="block">- <strong className="font-mono bg-white px-0.5">avatarText</strong> (String, size 10, Required)</span>
                        <span className="block">- <strong className="font-mono bg-white px-0.5">businessName</strong> (String, size 256, Required)</span>
                        <span className="block">- <strong className="font-mono bg-white px-0.5">category</strong> (String, size 100, Required)</span>
                        <span className="block">- <strong className="font-mono bg-white px-0.5">phone</strong> (String, size 50, Optional/Nullable)</span>
                        <span className="block">- <strong className="font-mono bg-white px-0.5">address</strong> (String, size 1000, Optional/Nullable)</span>
                        <span className="block">- <strong className="font-mono bg-white px-0.5">currency</strong> (String, size 10, Optional/Nullable)</span>
                        <span className="block">- <strong className="font-mono bg-white px-0.5">whatsappGreeting</strong> (String, size 1000, Optional/Nullable)</span>
                        <span className="block">- <strong className="font-mono bg-white px-0.5">whatsappReminderSuffix</strong> (String, size 1000, Optional/Nullable)</span>
                        <span className="block">- <strong className="font-mono bg-white px-0.5">updatedAt</strong> (String, size 100, Optional/Nullable)</span>
                      </span>
                    </span>

                    <span className="block mt-1.5 space-y-1">
                      <span className="flex items-center justify-between text-[11px]">
                        <span>📂 Collection <strong className="text-ash-750 font-mono">products</strong> (Inventory):</span>
                        <button onClick={() => copyToClipboard('products')} className="text-mint-600 hover:text-mint-700 flex items-center gap-0.5 cursor-pointer">
                          {copiedText === 'products' ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </span>
                      <span className="block text-[10px] text-ash-400 leading-tight pl-2">
                        Attributes: <code className="bg-ash-fb border rounded px-1">userId</code> (string), <code className="bg-ash-fb border rounded px-1">name</code> (string), <code className="bg-ash-fb border rounded px-1">sku</code> (string, optional), <code className="bg-ash-fb border rounded px-1">stockLevel</code> (integer), <code className="bg-ash-fb border rounded px-1">buyingPrice</code> (float), <code className="bg-ash-fb border rounded px-1">sellingPrice</code> (float), <code className="bg-ash-fb border rounded px-1">category</code> (string, optional), <code className="bg-ash-fb border rounded px-1">updatedAt</code> (string, optional).
                      </span>
                    </span>

                    <span className="block mt-1.5 space-y-1">
                      <span className="flex items-center justify-between text-[11px]">
                        <span>📂 Collection <strong className="text-ash-750 font-mono">sales</strong> (Sales Logs):</span>
                        <button onClick={() => copyToClipboard('sales')} className="text-mint-600 hover:text-mint-700 flex items-center gap-0.5 cursor-pointer">
                          {copiedText === 'sales' ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </span>
                      <span className="block text-[10px] text-ash-400 leading-tight pl-2">
                        Attributes: <code className="bg-ash-fb border rounded px-1">userId</code> (string), <code className="bg-ash-fb border rounded px-1">productId</code> (string), <code className="bg-ash-fb border rounded px-1">productName</code> (string), <code className="bg-ash-fb border rounded px-1">quantity</code> (integer), <code className="bg-ash-fb border rounded px-1">totalAmount</code> (float), <code className="bg-ash-fb border rounded px-1">amountPaid</code> (float), <code className="bg-ash-fb border rounded px-1">balanceDebt</code> (float), <code className="bg-ash-fb border rounded px-1">customerName</code> (string), <code className="bg-ash-fb border rounded px-1">customerPhone</code> (string, optional), <code className="bg-ash-fb border rounded px-1">paymentStatus</code> (string), <code className="bg-ash-fb border rounded px-1">timestamp</code> (string).
                      </span>
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right form block */}
          <div className="md:col-span-5 pl-0 md:pl-4 pt-4 md:pt-0 space-y-5">
            <div>
              <h4 className="text-sm font-semibold text-ash-900 flex items-center gap-1.5">
                <Settings className="h-4 w-4 text-mint-500 animate-spin-slow" />
                Connect Storefront
              </h4>
              <p className="text-[10px] text-ash-450 leading-normal">
                Input your credentials below to test instantly inside your developer browser sandbox. You can also specify these configurations in your environment variables.
              </p>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10.5px] font-medium text-ash-650 block">Appwrite Endpoint</label>
                <input
                  type="text"
                  required
                  value={configEndpoint}
                  onChange={(e) => setConfigEndpoint(e.target.value)}
                  placeholder="https://cloud.appwrite.io/v1"
                  className="w-full bg-ash-fb border border-ash-200 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:border-mint-450 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] font-medium text-ash-650 block">Appwrite Project ID</label>
                <input
                  type="text"
                  required
                  value={configProjectId}
                  onChange={(e) => setConfigProjectId(e.target.value)}
                  placeholder="Insert Project ID"
                  className="w-full bg-ash-fb border border-ash-200 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:border-mint-450 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] font-medium text-ash-650 block">Database ID</label>
                <input
                  type="text"
                  required
                  value={configDatabaseId}
                  onChange={(e) => setConfigDatabaseId(e.target.value)}
                  placeholder="sabisell_db"
                  className="w-full bg-ash-fb border border-ash-200 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:border-mint-450 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] font-medium text-ash-650 block">Users Collection ID</label>
                <input
                  type="text"
                  required
                  value={configUsersCol}
                  onChange={(e) => setConfigUsersCol(e.target.value)}
                  placeholder="users"
                  className="w-full bg-ash-fb border border-ash-200 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:border-mint-450 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] font-medium text-ash-650 block">Products Collection ID</label>
                <input
                  type="text"
                  required
                  value={configProductsCol}
                  onChange={(e) => setConfigProductsCol(e.target.value)}
                  placeholder="products"
                  className="w-full bg-ash-fb border border-ash-200 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:border-mint-450 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] font-medium text-ash-650 block">Sales Collection ID</label>
                <input
                  type="text"
                  required
                  value={configSalesCol}
                  onChange={(e) => setConfigSalesCol(e.target.value)}
                  placeholder="sales"
                  className="w-full bg-ash-fb border border-ash-200 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:border-mint-450 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-mint-400 hover:bg-mint-500 text-white font-normal text-xs py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <span>Save Config & Auto Mount</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </form>

            <div className="bg-ash-50 p-3 rounded-2xl border border-ash-100 text-[10px] text-ash-500 leading-normal font-sans">
              ℹ️ **Tip:** To save globally into production files, write these exact credentials as environment variables starting with <code className="font-mono text-ash-700 font-normal bg-ash-fb p-0.5 border border-ash-200 rounded">VITE_APPWRITE_</code> in your project repository keys list.
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // standard auth screens using Appwrite
  return (
    <div className="min-h-screen bg-ash-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans font-light">
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-ash-200 shadow-md space-y-6"
      >
        {onBackToHome && (
          <button 
            type="button" 
            onClick={onBackToHome}
            className="text-[11px] text-ash-500 hover:text-mint-600 flex items-center gap-1 cursor-pointer font-light transition-colors"
          >
            <span>← Return to homepage</span>
          </button>
        )}

        {/* Branding Logo */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-mint-400 flex items-center justify-center shadow-xs">
            <SabisellLogo className="h-6 w-6 text-white" animate={true} />
          </div>
          <div>
            <h2 className="text-2xl font-display font-light text-ash-900 tracking-tight flex items-center justify-center gap-1.5">
              <span>Sabisell</span>
              <span className="text-[9px] bg-mint-50 text-mint-700 font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-mint-200/50 font-sans">App</span>
            </h2>
            <p className="text-xs text-ash-500 max-w-[280px] mx-auto leading-relaxed">
              Nigeria Retail & SME Trade Ledger terminal. Access your record books anytime, anywhere.
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 bg-ash-fb p-1 rounded-xl border border-ash-100">
          <button
            id="auth-signin-toggle-btn"
            type="button"
            onClick={() => { setIsSignUp(false); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all ${!isSignUp ? 'bg-white text-mint-600 shadow-xs border border-mint-100/30 font-medium' : 'text-ash-500 hover:text-ash-700 hover:bg-ash-100/20'}`}
          >
            Sign In
          </button>
          <button
            id="auth-signup-toggle-btn"
            type="button"
            onClick={() => { setIsSignUp(true); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all ${isSignUp ? 'bg-white text-mint-600 shadow-xs border border-mint-100/30 font-medium' : 'text-ash-500 hover:text-ash-700 hover:bg-ash-100/20'}`}
          >
            Create Account
          </button>
        </div>

        {/* Success Notification */}
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 bg-mint-400/10 border border-mint-200/50 text-mint-800 text-xs rounded-xl flex items-start gap-2 leading-relaxed font-sans"
          >
            <CheckCircle2 className="h-4.5 w-4.5 text-mint-500 flex-shrink-0 mt-0.5" />
            <span className="font-normal">{successMsg}</span>
          </motion.div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 bg-red-400/10 border border-red-200/50 text-red-700 text-xs rounded-xl flex items-start gap-2 leading-relaxed font-sans"
          >
            <AlertCircle className="h-4.5 w-4.5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="font-normal">{errorMsg}</span>
          </motion.div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          
          {/* Sign Up Fields */}
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 overflow-hidden"
            >
              <div className="space-y-1">
                <label className="text-xs font-normal text-ash-600 block font-sans">Full Name</label>
                <div className="relative font-sans">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ash-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alao Ibrahim"
                    className="w-full bg-ash-50 border border-ash-200 text-xs pl-10 pr-3 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-mint-400 transition-all font-light"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-normal text-ash-600 block font-sans">
                  {isOrg ? "Organization / Institution Name" : "Business / Shop Name"}
                </label>
                <div className="relative font-sans">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ash-400">
                    <Building className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder={isOrg ? "e.g. Redeemer International Academy" : "e.g. Alao Provisions Store"}
                    className="w-full bg-ash-50 border border-ash-200 text-xs pl-10 pr-3 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-mint-400 transition-all font-light"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-normal text-ash-600 block font-sans">
                  {isOrg ? "Organization Category" : "Business Category"}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-ash-50 border border-ash-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-mint-400 transition-all font-light font-sans"
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

                {/* Live Dynamic Terminology Engine Preview */}
                <div className="mt-2.5 text-left p-3.5 bg-ash-fb rounded-2xl border border-ash-200/50 text-[11px] text-ash-600 space-y-2 font-sans animate-fade-in">
                  <div className="flex items-center gap-1.5 pb-1 border-b border-ash-100/60">
                    <Sparkles className="h-3.5 w-3.5 text-mint-500" />
                    <span className="font-semibold text-mint-705">Live Category Vocabulary Map</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2.5 gap-y-1.5 font-sans">
                    <div>
                      <span className="text-ash-400 block text-[9px] uppercase font-normal tracking-wide">Stock / Product:</span>
                      <span className="font-medium text-ash-800 line-clamp-1">{terms.stockItem}</span>
                    </div>
                    <div>
                      <span className="text-ash-400 block text-[9px] uppercase font-normal tracking-wide">Sales & Ledger:</span>
                      <span className="font-medium text-ash-800 line-clamp-1">{terms.sales}</span>
                    </div>
                    <div>
                      <span className="text-ash-400 block text-[9px] uppercase font-normal tracking-wide">User / Affiliate:</span>
                      <span className="font-medium text-ash-800 line-clamp-1">{terms.customer}</span>
                    </div>
                    <div>
                      <span className="text-ash-400 block text-[9px] uppercase font-normal tracking-wide">Debt / Pledges:</span>
                      <span className="font-medium text-ash-800 line-clamp-1">{terms.debt}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Mutual Fields */}
          <div className="space-y-1">
            <label className="text-xs font-normal text-ash-600 block font-sans">Email Address</label>
            <div className="relative font-sans">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ash-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="merchant@sabisell.com"
                className="w-full bg-ash-50 border border-ash-200 text-xs pl-10 pr-3 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-mint-400 transition-all font-light"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-normal text-ash-600 block font-sans">Password</label>
            <div className="relative font-sans">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ash-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-ash-50 border border-ash-200 text-xs pl-10 pr-10 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-mint-400 transition-all font-light font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ash-400 hover:text-ash-600 cursor-pointer font-sans"
              >
                {showPassword ? <EyeOff className="h-4 w-4 font-sans" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {!isSignUp && (
              <p className="text-[10px] text-ash-450 font-light mt-1 text-right font-sans">
                Password must match your registered account
              </p>
            )}
            {isSignUp && (
              <p className="text-[10px] text-ash-450 font-light mt-1 font-sans">
                Must be at least 8 characters long for Appwrite safety limits.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-mint-400 hover:bg-mint-500 text-white font-normal text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-xs hover:scale-101 transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-4 font-sans"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>{isSignUp ? 'Verify & Launch Shop Ledger' : 'Sign In and Load My Books'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Semi-Interactive Terms & Conditions block */}
        <div className="pt-4 border-t border-ash-100 flex flex-col gap-3 font-sans">
          <div className="bg-ash-fb/80 p-3.5 rounded-2xl border border-ash-150 flex items-center justify-between gap-3 font-sans text-left">
            <span className="text-[11px] text-ash-500 leading-normal font-light">
              Understand how Sabisell protects and handles your shop record ledger.
            </span>
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="text-[11px] font-bold text-mint-600 hover:text-mint-755 underline cursor-pointer hover:no-underline transition-all whitespace-nowrap"
            >
              Read Terms
            </button>
          </div>
        </div>
      </motion.div>

      {/* Modern, Scrollable terms and conditions modal overlay */}
      {showTerms && (
        <div className="fixed inset-0 bg-ash-950/45 backdrop-blur-xs flex items-center justify-center p-4 z-[200] animate-fade-in text-left">
          <div className="bg-white rounded-2xl border border-ash-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh] animate-slide-up">
            {/* Header */}
            <div className="p-4 border-b border-ash-100 bg-ash-fb flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-mint-450 text-white leading-none">
                  <SabisellLogo className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ash-900 font-display">Sabisell Terms of Service</h3>
                  <span className="text-[9px] text-ash-400 font-normal uppercase tracking-wider block">Usage Policy & Ledger Rules</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowTerms(false)}
                className="text-ash-400 hover:text-ash-700 p-1.5 rounded-lg hover:bg-ash-100 transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-ash-600 leading-relaxed font-light font-sans max-h-[55vh]">
              <p className="font-semibold text-ash-850">
                Welcome to Sabisell (herein referred to as the "Service", "Application", or "Platform"). Please carefully study and comprehend these comprehensive worldwide Terms and Conditions ("Agreement", "Terms") before setting up your merchant account, deploying your synced record databases, or processing trade ledgers through this terminal interface.
              </p>

              <div className="space-y-2">
                <h4 className="font-bold text-ash-800 text-xs uppercase tracking-wide">1. Acceptance of Contractual Terms and Parties</h4>
                <p>
                  By performing an account creation sequence, entering login credentials, or browsing any associated data dashboards, you represent that you possess full legal capacity to bind yourself, your small or medium-scale shop, or your global corporate commercial enterprise to this Agreement. If you are accepting this Agreement on behalf of a company, cooperative, or enterprise, you verify that you have absolute authority to agree to these mandates. If you disagree with any terms written herein, you are strictly prohibited from utilizing this terminal.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-ash-800 text-xs uppercase tracking-wide">2. Description of Global Service & Scope</h4>
                <p>
                  Sabisell operates as a multi-currency, cross-border commercial trade ledger suite built to run seamlessly in any sovereign territory, country, or location worldwide. The platform offers digital modules enabling merchants to record stock item classifications, assign discrete pricing thresholds (such as unit cost price and active unit retail selling price), track historical sales logs, manage physical inventory depletion alerts, maintain operations ledger books, and record outstanding buyer credit amounts (customer debts). The digital terminal is configured to follow variable parameters, including customizable currencies and international formatting rules, to render it fully appropriate for merchants worldwide.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-ash-800 text-xs uppercase tracking-wide">3. Account Integrity & Appwrite Sync System</h4>
                <p>
                  To ensure sovereign custody of business intelligence records, Sabisell integrates directly with separate server architectures and relational backend infrastructures, specifically using the Appwrite cloud platform or self-hosted database systems. It is your sole responsibility to configure, safeguard, and secure your database endpoints, security roles, primary read/write collection permissions, and connection secrets. All transactions, operational entries, inventory shifts, and customer listings authenticated under your terminal identifier are deemed to be your personal representation. You agree to notify Sabisell or your own systems administrators immediately if you identify compromised data keys or unauthorized ledger manipulations.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-ash-800 text-xs uppercase tracking-wide">4. Mathematical Approximations and P&L Disclaimers</h4>
                <p>
                  Sabisell incorporates multiple automated computation pipelines to supply standard trade indices, including but not limited to: SME Working Capital, active Profit & Loss (P&L) quotients, dynamic Cost of Goods Sold (COGS) figures, overall Operational running cost metrics (OPEX), profit margins, and historical debt ratios. You agree and understand that these indices represent mathematical approximations generated only from individual records inputted directly by you, your agents, or your employees. The Service makes absolutely no representation or warranty regarding the compliance of these mathematical summaries with Generally Accepted Accounting Principles (GAAP), International Financial Reporting Standards (IFRS), or any specific local, state, or federal financial auditing requirements.
                </p>
                <p>
                  You are solely obliged to consult with professional certified public accountants, corporate auditors, or valid tax specialists prior to relying on these reports for governmental filings, tax computations, equity valuations, bank loans, or corporate business investments.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-ash-800 text-xs uppercase tracking-wide">5. Customer Privacy & Compliance With International Regulations</h4>
                <p>
                  Sabisell prioritizes the privacy and sanctity of your customer listings, sales logs, and cost curves. The Application does not scrape, index, aggregate, sell, or communicate your customer databases or transaction lists to third-party entities. All customer entries and phone records remain stored securely in your configured private Appwrite databases or localized browser caching. 
                </p>
                <p>
                  By utilizing prompt WhatsApp notification engines, SMS message shortcuts, or manual invoice dispatch channels enabled by the Platform, you represent and warrant that you have obtained explicit consent and approvals from each end-customer to contact them regarding product sales, outstanding debt collection, or payment reminders. Your use of the Service must line up with all regulatory provisions governing regional data collection and consumer protection, including but not limited to the European Union General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and other international data privacy guidelines.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-ash-800 text-xs uppercase tracking-wide">6. Regulatory Compliance and Geographic Legality</h4>
                <p>
                  Since Sabisell is accessible across diverse international regions, different localized regulations regarding commercial bookkeeping, interest rates, debt-collection methods, tax collection, and business trade may apply to your transactions. You represent and warrant that your commerce operations align with local and international framework parameters. You assume sole responsibility for calculating, filing, and paying any value-added tax (VAT), sales tax, digital duties, or business levies resulting from transactions recorded in Sabisell.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-ash-800 text-xs uppercase tracking-wide">7. Absolutely No Warranties & Limitations of Liability</h4>
                <p>
                  THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTY OF ANY KIND, EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE. TO THE FURTHEST EXTENT ALLOWED BY APPLICABLE GLOBAL LAWS, SABISELL, ITS CONTRIBUTORS, DEPLOYERS, AND RELATED AGENTS DISCLAIM ALL WARRANTIES, INCLUDING FITNESS FOR A PARTICULAR PURPOSE, MERCHANT QUALITY, DATABASE STABILITY, INTEGRATION CONSTANCY, ACCURACY OF CALCULATORS, AND SECURITY OF SERVER ENDPOINTS.
                </p>
                <p>
                  IN NO COMPLIANCE OR LEGAL EVENT SHALL SABISELL OR ITS CONTRIBUTING DESIGNERS, DEVELOPERS, OR AFFILIATES BE LIABLE FOR PRIVATE OR ECONOMIC LOSSES, INCLUDING LOSS OF PROFITS, BUSINESS DISRUPTION, SYSTEM DOWNTIMES, INVENTORY MISCALCULATIONS, OUTFLOW DEVIATIONS, CORRUPTED LEDGER ROWS, OR ANY INDIRECT, CONSEQUENTIAL, INCIDENTAL, OR EXEMPLARY DAMAGES RESULTING FROM YOUR USAGE OF THE TERMINAL, REGARDLESS OF THE LEGAL SYSTEM AND EVEN IF SPECIFICALLY WARNED OF SUCH DANGER.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-ash-800 text-xs uppercase tracking-wide">8. Prohibited Actions and Usage Restrictions</h4>
                <p>
                  You agree never to exploit, strain, or compromise the Sabisell platform through malicious scripts, automated SQL queries, API injection efforts, or denial of service attacks. You agree not to map illegally gained resources onto database keys, log unauthorized or illegitimate commercial goods, or use the automated WhatsApp messaging frameworks to transmit unsolicited marketing spam, fraudulent promotional schemes, or harassment.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-ash-800 text-xs uppercase tracking-wide">9. Intellectual Property rights</h4>
                <p>
                  All structural source code, visual design elements, CSS custom variables, custom logo frameworks, asset placements, and user experience paradigms are the proprietary property of Sabisell and its primary contributors. Any custom business labels, registered store logos, product catalog descriptions, and customer information cards entered by the operator remain the intellectual property of the respective merchant.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-ash-800 text-xs uppercase tracking-wide">10. Modifications to Contract and Terminal System</h4>
                <p>
                  We reserve the right to modify, adapt, or update the formatting, structural design, analytical formulas, or interface paradigms of Sabisell to improve international performance or adapt to novel technologies. Major revisions to this Agreement will be posted openly inside the application interface or noted during account log sequences. Continued utilization of the terminal represents active acceptance of updated Terms.
                </p>
              </div>

              <div className="space-y-2 text-[10px] text-ash-400 font-mono italic">
                <p>
                  Last revised: May 2026. This electronic terms of service constitutes a globally binding digital contract between the operating merchant and the Sabisell Platform.
                </p>
              </div>
            </div>

            {/* Footer Button */}
            <div className="p-4 bg-ash-fb border-t border-ash-150/45 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowTerms(false)}
                className="w-full sm:w-auto px-5 py-2.5 bg-ash-900 hover:bg-ash-950 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors text-center font-sans"
              >
                I understand, proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
