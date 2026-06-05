import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Mic, 
  HelpCircle, 
  Landmark, 
  Users,
  Award,
  Sparkles,
  CheckCircle,
  Menu,
  X,
  Settings,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { Product, Sale, OwnerProfile, BusinessProfile, Expense, PriceHistory } from './types';
import { SabisellLogo } from './components/SabisellLogo';
import Dashboard from './components/Dashboard';
import InventoryManager from './components/InventoryManager';
import SalesManager from './components/SalesManager';
import VoiceAssistant from './components/VoiceAssistant';
import BrainstormChat from './components/BrainstormChat';
import BankLinker from './components/BankLinker';
import ContactsConnect from './components/ContactsConnect';
import BusinessSettings from './components/BusinessSettings';
import AuthScreen from './components/AuthScreen';
import LandingPage from './components/LandingPage';
import PublicCatalog from './components/PublicCatalog';
import { 
  account, 
  databases, 
  ID, 
  Query, 
  client,
  APPWRITE_DATABASE_ID,
  APPWRITE_USERS_COLLECTION_ID,
  APPWRITE_PRODUCTS_COLLECTION_ID,
  APPWRITE_SALES_COLLECTION_ID,
  getAppwriteStatus,
  clearAppwriteSession
} from './appwrite';

export default function App() {
  const [activeTab, setActiveTab ] = useState(() => {
    // Recognize WhatsApp status catalog links instantly
    const params = new URLSearchParams(window.location.search);
    if (params.get('catalog') === 'true') {
      return 'public-catalog';
    }
    return localStorage.getItem('sabisell_active_tab') || 'dashboard';
  });
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('sabisell_fallback_products');
      return cached ? JSON.parse(cached) : [];
    } catch (_) {
      return [];
    }
  });
  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const cached = localStorage.getItem('sabisell_fallback_sales');
      return cached ? JSON.parse(cached) : [];
    } catch (_) {
      return [];
    }
  });
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const cached = localStorage.getItem('sabisell_fallback_expenses');
      return cached ? JSON.parse(cached) : [];
    } catch (_) {
      return [];
    }
  });
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>(() => {
    try {
      const cached = localStorage.getItem('sabisell_fallback_price_history');
      return cached ? JSON.parse(cached) : [];
    } catch (_) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('sabisell_fallback_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sabisell_fallback_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('sabisell_fallback_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('sabisell_fallback_price_history', JSON.stringify(priceHistory));
  }, [priceHistory]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Light and Dark theme state support
  const [theme, setTheme] = useState(() => localStorage.getItem('sabisell_theme') || 'light');

  useEffect(() => {
    localStorage.setItem('sabisell_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('sabisell_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('sabisell_theme', 'light');
    }
  }, [theme]);

  // Sync browser device top color (ash light: #f1f5f9, ash dark: #1e293b)
  useEffect(() => {
    const themeColor = theme === 'dark' ? '#1e293b' : '#f1f5f9';
    const metaTag = document.getElementById('theme-color-meta') as HTMLMetaElement;
    if (metaTag) {
      metaTag.content = themeColor;
    }
  }, [theme]);

  // Authentication states
  const [user, setUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthGate, setShowAuthGate] = useState(false);

  // Profile preferences
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile>({
    fullName: 'Oga Merchant',
    phone: '',
    email: '',
    avatarText: 'OM'
  });

  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    businessName: 'Sabisell Enterprises',
    category: 'Provisions & Retail',
    address: 'Nigeria Market Terminal',
    currency: '₦',
    whatsappGreeting: 'Hello, here na your invoice from Sabisell:',
    whatsappReminderSuffix: 'Please, fit negotiate or pay directly into my bank account. Thank you for your business!'
  });

  // 1. Subscribe to Appwrite Authentication session check
  useEffect(() => {
    async function checkSession() {
      const appwriteStatus = getAppwriteStatus();
      if (!appwriteStatus.isConfigured) {
        setUser(null);
        setAuthLoading(false);
        return;
      }

      try {
        const currentUser = await account.get();
        setUser(currentUser);

        // Fetch custom user profile document from Appwrite DB
        try {
          const docRes = await databases.getDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_USERS_COLLECTION_ID,
            currentUser.$id
          );
          
          setOwnerProfile({
            fullName: docRes.fullName || currentUser.name || 'Sabisell Merchant',
            phone: docRes.phone || '',
            email: docRes.email || currentUser.email || '',
            avatarText: docRes.avatarText || 'SM'
          });

          setBusinessProfile({
            businessName: docRes.businessName || 'Sabisell Enterprises',
            category: docRes.category || 'Provisions & Retail',
            address: docRes.address || '',
            currency: docRes.currency || '₦',
            whatsappGreeting: docRes.whatsappGreeting || 'Hello, here na your invoice from Sabisell:',
            whatsappReminderSuffix: docRes.whatsappReminderSuffix || 'Please transfer directly. Thank you!'
          });
        } catch (dbErr: any) {
          console.log('[Appwrite DB]: No custom profile found, creating user default row...', dbErr);
          if (dbErr.code === 404 || dbErr.type === 'document_not_found') {
            const defaultOwner: OwnerProfile = {
              fullName: currentUser.name || 'Sabisell Merchant',
              phone: '',
              email: currentUser.email || '',
              avatarText: (currentUser.name || 'SM').substring(0, 2).toUpperCase()
            };
            const defaultBusiness: BusinessProfile = {
              businessName: 'My Sabisell Store',
              category: 'Provisions & Retail',
              address: 'Lagos, Nigeria',
              currency: '₦',
              whatsappGreeting: 'Hello, here na your invoice from Sabisell:',
              whatsappReminderSuffix: 'Please transfer directly. Thank you for your business!'
            };
            setOwnerProfile(defaultOwner);
            setBusinessProfile(defaultBusiness);

            await databases.createDocument(
              APPWRITE_DATABASE_ID,
              APPWRITE_USERS_COLLECTION_ID,
              currentUser.$id,
              {
                fullName: defaultOwner.fullName,
                phone: defaultOwner.phone,
                email: defaultOwner.email,
                avatarText: defaultOwner.avatarText,
                businessName: defaultBusiness.businessName,
                category: defaultBusiness.category,
                address: defaultBusiness.address,
                currency: defaultBusiness.currency,
                whatsappGreeting: defaultBusiness.whatsappGreeting,
                whatsappReminderSuffix: defaultBusiness.whatsappReminderSuffix,
                updatedAt: new Date().toISOString()
              }
            );
          }
        }
      } catch (err) {
        console.log('[Appwrite Sessions]: No active session found.');
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }

    checkSession();
  }, []);

  // 2. Load and Sync Appwrite Collections
  useEffect(() => {
    if (!user) return;

    // Load initial documents
    async function loadInitialData() {
      try {
        // Load Products
        const prodRes = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          APPWRITE_PRODUCTS_COLLECTION_ID,
          [Query.equal('userId', user.$id), Query.limit(100)]
        );
        const mappedProducts = prodRes.documents.map((doc: any) => ({
          id: doc.$id,
          name: doc.name,
          quantity: doc.stockLevel ?? 0,
          costPrice: doc.buyingPrice ?? 0,
          sellingPrice: doc.sellingPrice ?? 0,
          category: doc.category || 'General',
          lastUpdated: doc.updatedAt || doc.$updatedAt || new Date().toISOString(),
          type: doc.type || (['Salon & Beauty', 'Labor & Repairs', 'Consultation & Tuition', 'Professional Services', 'Others (Service)'].includes(doc.category) ? 'service' : 'product')
        }));
        
        // Merge remote products into local list, preserving items not on remote DB
        setProducts(prev => {
          const result = [...prev];
          for (const rm of mappedProducts) {
            const matchByIdIdx = result.findIndex(l => l.id === rm.id);
            if (matchByIdIdx !== -1) {
              result[matchByIdIdx] = { ...result[matchByIdIdx], ...rm };
              continue;
            }
            const matchByNameIdx = result.findIndex(l => l.name.toLowerCase() === rm.name.toLowerCase());
            if (matchByNameIdx !== -1) {
              result[matchByNameIdx] = { ...result[matchByNameIdx], ...rm, id: rm.id };
              continue;
            }
            result.push(rm);
          }
          return result;
        });

        // Load Sales
        const salesRes = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          APPWRITE_SALES_COLLECTION_ID,
          [Query.equal('userId', user.$id), Query.limit(100)]
        );
        const mappedSales = salesRes.documents.map((doc: any) => ({
          id: doc.$id,
          productId: doc.productId || '',
          productName: doc.productName || '',
          quantity: doc.quantity ?? 1,
          unitPrice: (doc.totalAmount && doc.quantity) ? Math.round(doc.totalAmount / doc.quantity) : doc.sellingPrice ?? 0,
          totalAmount: doc.totalAmount ?? 0,
          amountPaid: doc.amountPaid ?? 0,
          balanceDebt: doc.balanceDebt ?? 0,
          customerName: doc.customerName || 'Standard Customer',
          paymentStatus: doc.paymentStatus || 'UNPAID',
          timestamp: doc.timestamp || doc.$createdAt || new Date().toISOString()
        }));
        
        // Merge remote sales into local list, preserving items not on remote DB
        setSales(prev => {
          const result = [...prev];
          for (const rm of mappedSales) {
            const matchByIdIdx = result.findIndex(l => l.id === rm.id);
            if (matchByIdIdx !== -1) {
              result[matchByIdIdx] = { ...result[matchByIdIdx], ...rm };
              continue;
            }
            const matchByDetailsIdx = result.findIndex(l => {
              const lTime = new Date(l.timestamp).getTime();
              const rTime = new Date(rm.timestamp).getTime();
              const closeTime = Math.abs(lTime - rTime) < 30000;
              return l.productId === rm.productId &&
                     l.quantity === rm.quantity &&
                     l.totalAmount === rm.totalAmount &&
                     (l.id.startsWith('sale_') || closeTime);
            });
            if (matchByDetailsIdx !== -1) {
              result[matchByDetailsIdx] = { ...result[matchByDetailsIdx], ...rm, id: rm.id };
              continue;
            }
            result.push(rm);
          }
          return result;
        });
      } catch (err) {
        console.error('[Appwrite Initial DB Fetch Error]:', err);
      }
    }

    loadInitialData();

    // Stream live collections with Realtime channel
    let unsubProducts: (() => void) | null = null;
    let unsubSales: (() => void) | null = null;

    try {
      const productsChannel = `databases.${APPWRITE_DATABASE_ID}.collections.${APPWRITE_PRODUCTS_COLLECTION_ID}.documents`;
      unsubProducts = client.subscribe(productsChannel, (response: any) => {
        const { events, payload } = response;
        if (payload.userId !== user.$id) return;

        const isCreate = events.some((e: string) => e.includes('.create'));
        const isUpdate = events.some((e: string) => e.includes('.update'));
        const isDelete = events.some((e: string) => e.includes('.delete'));

        if (isCreate) {
          setProducts(prev => {
            if (prev.some(p => p.id === payload.$id)) return prev;
            
            // Check if there is an optimistic product with the same name
            const matchIndex = prev.findIndex(p => p.name.toLowerCase() === (payload.name || '').toLowerCase() && p.id.startsWith('prod_'));
            if (matchIndex !== -1) {
              const copy = [...prev];
              copy[matchIndex] = {
                ...copy[matchIndex],
                id: payload.$id
              };
              return copy;
            }

            return [...prev, {
              id: payload.$id,
              name: payload.name,
              quantity: payload.stockLevel ?? 0,
              costPrice: payload.buyingPrice ?? 0,
              sellingPrice: payload.sellingPrice ?? 0,
              category: payload.category || 'General',
              lastUpdated: payload.updatedAt || new Date().toISOString()
            }];
          });
        } else if (isUpdate) {
          setProducts(prev => prev.map(p => p.id === payload.$id ? {
            ...p,
            name: payload.name,
            quantity: payload.stockLevel ?? 0,
            costPrice: payload.buyingPrice ?? 0,
            sellingPrice: payload.sellingPrice ?? 0,
            category: payload.category || 'General',
            lastUpdated: payload.updatedAt || new Date().toISOString()
          } : p));
        } else if (isDelete) {
          // Preserve local stock, or delete if manually synced.
          // In order to prevent stock from being deleted spontaneously by DB sync quirks, we filter safely
          setProducts(prev => prev.filter(p => p.id !== payload.$id));
        }
      });

      const salesChannel = `databases.${APPWRITE_DATABASE_ID}.collections.${APPWRITE_SALES_COLLECTION_ID}.documents`;
      unsubSales = client.subscribe(salesChannel, (response: any) => {
        const { events, payload } = response;
        if (payload.userId !== user.$id) return;

        const isCreate = events.some((e: string) => e.includes('.create'));
        const isUpdate = events.some((e: string) => e.includes('.update'));
        const isDelete = events.some((e: string) => e.includes('.delete'));

        if (isCreate) {
          setSales(prev => {
            if (prev.some(s => s.id === payload.$id)) return prev;
            
            // Deduplicate matching optimistic local sales with provisional IDs
            const matchIndex = prev.findIndex(s => {
              const prevTime = new Date(s.timestamp).getTime();
              const payloadTime = new Date(payload.timestamp || payload.$createdAt || '').getTime();
              const isRecent = Math.abs(prevTime - payloadTime) < 30000; // 30s window
              return s.productId === payload.productId && 
                     s.quantity === payload.quantity && 
                     s.totalAmount === payload.totalAmount &&
                     (s.id.startsWith('sale_') || isRecent);
            });

            if (matchIndex !== -1) {
              const copy = [...prev];
              copy[matchIndex] = {
                ...copy[matchIndex],
                id: payload.$id
              };
              return copy;
            }

            return [{
              id: payload.$id,
              productId: payload.productId || '',
              productName: payload.productName || '',
              quantity: payload.quantity ?? 1,
              unitPrice: (payload.totalAmount && payload.quantity) ? Math.round(payload.totalAmount / payload.quantity) : payload.sellingPrice ?? 0,
              totalAmount: payload.totalAmount ?? 0,
              amountPaid: payload.amountPaid ?? 0,
              balanceDebt: payload.balanceDebt ?? 0,
              customerName: payload.customerName || 'Standard Customer',
              paymentStatus: payload.paymentStatus || 'UNPAID',
              timestamp: payload.timestamp || new Date().toISOString()
            }, ...prev];
          });
        } else if (isUpdate) {
          setSales(prev => prev.map(s => s.id === payload.$id ? {
            ...s,
            amountPaid: payload.amountPaid ?? 0,
            balanceDebt: payload.balanceDebt ?? 0,
            paymentStatus: payload.paymentStatus || 'UNPAID',
            customerName: payload.customerName || s.customerName
          } : s));
        } else if (isDelete) {
          setSales(prev => prev.filter(s => s.id !== payload.$id));
        }
      });
    } catch (realtimeErr) {
      console.warn('[Appwrite Realtime Sync Warning]: Subscription failed, falling back to instant operations triggers', realtimeErr);
    }

    return () => {
      if (unsubProducts) unsubProducts();
      if (unsubSales) unsubSales();
    };
  }, [user]);

  // Sign out helper
  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
    } catch (err) {
      console.error('[Appwrite Signout Error]:', err);
    }
    clearAppwriteSession();
    // Do not clear the local ledger cache/states on logout
    setUser(null);
  };

  // Profile preferences saver
  const handleSaveProfiles = async (owner: OwnerProfile, bProfile: BusinessProfile) => {
    setOwnerProfile(owner);
    setBusinessProfile(bProfile);
    if (user) {
      try {
        await databases.updateDocument(
          APPWRITE_DATABASE_ID,
          APPWRITE_USERS_COLLECTION_ID,
          user.$id,
          {
            fullName: owner.fullName,
            phone: owner.phone,
            email: owner.email,
            avatarText: owner.avatarText,
            businessName: bProfile.businessName,
            category: bProfile.category,
            address: bProfile.address,
            currency: bProfile.currency,
            whatsappGreeting: bProfile.whatsappGreeting,
            whatsappReminderSuffix: bProfile.whatsappReminderSuffix,
            updatedAt: new Date().toISOString()
          }
        );
      } catch (err) {
        console.error('[Appwrite User Prof Update Error]:', err);
      }
    }
  };

  // State Updates (All operations write live to Appwrite Database)

  // Add inventory product
  const handleAddProduct = async (newProd: Omit<Product, 'id' | 'lastUpdated'> & { lastUpdated?: string }) => {
    const tempId = `prod_${Date.now()}`;
    const productDate = newProd.lastUpdated ? new Date(newProd.lastUpdated).toISOString() : new Date().toISOString();
    const localProd: Product = {
      id: tempId,
      name: newProd.name,
      quantity: newProd.quantity,
      costPrice: newProd.costPrice,
      sellingPrice: newProd.sellingPrice,
      category: newProd.category || 'General',
      lastUpdated: productDate,
      type: newProd.type || 'product'
    };
    
    // Optimistic local state update
    setProducts(prev => [...prev, localProd]);

    // Record initial price point into history
    const initialPriceHistory: PriceHistory = {
      id: `price_hist_${Date.now()}`,
      productId: tempId,
      costPrice: newProd.costPrice,
      sellingPrice: newProd.sellingPrice,
      timestamp: productDate
    };
    setPriceHistory(prev => [...prev, initialPriceHistory]);

    if (!user) return;
    try {
      const generatedDoc = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_PRODUCTS_COLLECTION_ID,
        ID.unique(),
        {
          userId: user.$id,
          name: newProd.name,
          sku: '',
          stockLevel: newProd.quantity,
          buyingPrice: newProd.costPrice,
          sellingPrice: newProd.sellingPrice,
          category: newProd.category || 'General',
          updatedAt: productDate
        }
      );
      
      // Swap local tempId with actual server ID
      setProducts(prev => prev.map(p => p.id === tempId ? { ...p, id: generatedDoc.$id, type: localProd.type } : p));
      setPriceHistory(prev => prev.map(h => h.productId === tempId ? { ...h, productId: generatedDoc.$id } : h));
    } catch (err) {
      console.error('[Appwrite Add Product Error - using local persistent state fallback]:', err);
    }
  };

  // Update product properties/counts
  const handleUpdateProduct = async (id: string, updatedFields: Partial<Product>) => {
    // Local update first & audit check to see if price has changed to record in PriceHistory
    setProducts(prev => {
      const parentProd = prev.find(p => p.id === id);
      if (parentProd) {
        const isCostChanged = updatedFields.costPrice !== undefined && updatedFields.costPrice !== parentProd.costPrice;
        const isSellChanged = updatedFields.sellingPrice !== undefined && updatedFields.sellingPrice !== parentProd.sellingPrice;
        if (isCostChanged || isSellChanged) {
          const newHistoryPrice: PriceHistory = {
            id: `price_hist_${Date.now()}`,
            productId: id,
            costPrice: updatedFields.costPrice !== undefined ? updatedFields.costPrice : parentProd.costPrice,
            sellingPrice: updatedFields.sellingPrice !== undefined ? updatedFields.sellingPrice : parentProd.sellingPrice,
            timestamp: new Date().toISOString()
          };
          setPriceHistory(ph => [...ph, newHistoryPrice]);
        }
      }
      return prev.map(p => p.id === id ? { ...p, ...updatedFields, lastUpdated: new Date().toISOString() } : p);
    });

    if (!user || id.startsWith('prod_')) return;
    
    const fieldsToUpdate: any = {};
    if (updatedFields.name !== undefined) fieldsToUpdate.name = updatedFields.name;
    if (updatedFields.quantity !== undefined) fieldsToUpdate.stockLevel = updatedFields.quantity;
    if (updatedFields.costPrice !== undefined) fieldsToUpdate.buyingPrice = updatedFields.costPrice;
    if (updatedFields.sellingPrice !== undefined) fieldsToUpdate.sellingPrice = updatedFields.sellingPrice;
    if (updatedFields.category !== undefined) fieldsToUpdate.category = updatedFields.category;
    fieldsToUpdate.updatedAt = new Date().toISOString();

    try {
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_PRODUCTS_COLLECTION_ID,
        id,
        fieldsToUpdate
      );
    } catch (err) {
      console.error('[Appwrite Update Product Error]:', err);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    // Local delete immediately first
    setProducts(prev => prev.filter(p => p.id !== id));

    if (!user || id.startsWith('prod_')) return;
    try {
      await databases.deleteDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_PRODUCTS_COLLECTION_ID,
        id
      );
    } catch (err) {
      console.error('[Appwrite Delete Product Error]:', err);
    }
  };

  // Delete sale
  const handleDeleteSale = async (id: string) => {
    // Local delete immediately
    setSales(prev => prev.filter(s => s.id !== id));

    if (!user || id.startsWith('sale_')) return;
    try {
      await databases.deleteDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_SALES_COLLECTION_ID,
        id
      );
    } catch (err) {
      console.error('[Appwrite Delete Sale Error]:', err);
    }
  };

  // Add a flexible running cost or capital expense
  const handleAddExpense = (newExpense: Omit<Expense, 'id' | 'timestamp'>) => {
    const expense: Expense = {
      id: `exp_${Date.now()}`,
      description: newExpense.description,
      amount: newExpense.amount,
      category: newExpense.category,
      timestamp: new Date().toISOString(),
      associatedProductId: newExpense.associatedProductId
    };
    setExpenses(prev => [expense, ...prev]);
  };

  // Delete expense item
  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Log new sales transaction
  const handleAddSale = async (newSale: Omit<Sale, 'id' | 'timestamp'> & { timestamp?: string }) => {
    const tempSaleId = `sale_${Date.now()}`;
    const saleDate = newSale.timestamp ? new Date(newSale.timestamp).toISOString() : new Date().toISOString();
    const localSale: Sale = {
      id: tempSaleId,
      productId: newSale.productId,
      productName: newSale.productName,
      quantity: newSale.quantity,
      unitPrice: Math.round(newSale.totalAmount / newSale.quantity),
      totalAmount: newSale.totalAmount,
      amountPaid: newSale.amountPaid,
      balanceDebt: newSale.balanceDebt,
      customerName: newSale.customerName,
      paymentStatus: newSale.paymentStatus,
      timestamp: saleDate
    };

    // Deduct stock quantity
    const product = products.find(p => p.id === newSale.productId);
    if (product && product.type !== 'service') {
      const newQty = Math.max(0, product.quantity - newSale.quantity);
      await handleUpdateProduct(newSale.productId, { quantity: newQty });
    }

    // Update local state immediately for instant feedback
    setSales(prev => [localSale, ...prev]);

    if (!user) return;
    try {
      const gDoc = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_SALES_COLLECTION_ID,
        ID.unique(),
        {
          userId: user.$id,
          productId: newSale.productId,
          productName: newSale.productName,
          quantity: newSale.quantity,
          totalAmount: newSale.totalAmount,
          amountPaid: newSale.amountPaid,
          balanceDebt: newSale.balanceDebt,
          customerName: newSale.customerName,
          customerPhone: '',
          paymentStatus: newSale.paymentStatus,
          timestamp: saleDate
        }
      );

      // Swap temporary ID with real Appwrite ID
      setSales(prev => prev.map(s => s.id === tempSaleId ? { ...s, id: gDoc.$id } : s));
    } catch (err) {
      console.error('[Appwrite Add Sale Error - using offline persistent fallback state]:', err);
    }
  };

  const handleUpdateSale = async (id: string, updatedFields: Partial<Sale>) => {
    // Local update first
    setSales(prev => prev.map(s => s.id === id ? { ...s, ...updatedFields } : s));

    if (!user || id.startsWith('sale_')) return;
    
    const fieldsToUpdate: any = {};
    if (updatedFields.amountPaid !== undefined) fieldsToUpdate.amountPaid = updatedFields.amountPaid;
    if (updatedFields.balanceDebt !== undefined) fieldsToUpdate.balanceDebt = updatedFields.balanceDebt;
    if (updatedFields.paymentStatus !== undefined) fieldsToUpdate.paymentStatus = updatedFields.paymentStatus;
    if (updatedFields.customerName !== undefined) fieldsToUpdate.customerName = updatedFields.customerName;

    try {
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_SALES_COLLECTION_ID,
        id,
        fieldsToUpdate
      );
    } catch (err) {
      console.error('[Appwrite Update Sale Error]:', err);
    }
  };

  // Apply parsed speech action (Invoked by voice coordinator component)
  const handleApplyParsedSpeechAction = (result: any) => {
    if (!result || !result.action) return;

    const data = result.data;
    if (result.action === 'ADD_INVENTORY') {
      // Find if we already have this product to replenish
      const matched = products.find(p => p.name.toLowerCase().includes(data.productName.toLowerCase()));
      if (matched) {
        handleUpdateProduct(matched.id, {
          quantity: matched.quantity + (data.quantity || 1),
          costPrice: data.costPrice || matched.costPrice,
          sellingPrice: data.sellingPrice || matched.sellingPrice
        });
      } else {
        handleAddProduct({
          name: data.productName || 'Unnamed Restock Item',
          quantity: data.quantity || 1,
          costPrice: data.costPrice || 2000,
          sellingPrice: data.sellingPrice || 3500,
          category: 'Others'
        });
      }
    } 
    
    else if (result.action === 'RECORD_SALE') {
      // Find product to link
      const matched = products.find(p => p.name.toLowerCase().includes(data.productName.toLowerCase())) || products[0];
      if (matched) {
        handleAddSale({
          productId: matched.id,
          productName: matched.name,
          quantity: data.quantity || 1,
          unitPrice: matched.sellingPrice,
          totalAmount: data.totalAmount || matched.sellingPrice * (data.quantity || 1),
          amountPaid: data.amountPaid || 0,
          balanceDebt: data.balanceDebt !== undefined ? data.balanceDebt : Math.max(0, (data.totalAmount || matched.sellingPrice * (data.quantity || 1)) - (data.amountPaid || 0)),
          customerName: data.customerName || 'Voice customer',
          paymentStatus: (data.balanceDebt === 0) ? 'PAID' : (data.amountPaid > 0) ? 'PARTIAL' : 'UNPAID'
        });
      }
    } 
    
    else if (result.action === 'RECORD_PAYMENT') {
      // Find an existing debt for customer and credit it
      const matchedSale = sales.find(s => s.customerName.toLowerCase().includes(data.customerName.toLowerCase()) && s.balanceDebt > 0);
      if (matchedSale) {
        const amtToPay = data.amountPaid || 1000;
        const newPaid = matchedSale.amountPaid + amtToPay;
        const newDebt = Math.max(0, matchedSale.totalAmount - newPaid);
        handleUpdateSale(matchedSale.id, {
          amountPaid: newPaid,
          balanceDebt: newDebt,
          paymentStatus: newDebt === 0 ? 'PAID' : 'PARTIAL'
        });
      } else {
        // Log individual sales settlement as walk-in credit
        const cleanName = data.customerName || 'Customer Client';
        alert(`Oga, we parse the repay of ${cleanName} but didn\'t locate any open debts. Settle manually in Sales & Debts tab!`);
      }
    }
    
    else if (result.action === 'DELETE_PRODUCT' || result.action === 'DELETE_STOCK') {
      const matched = products.find(p => p.name.toLowerCase().includes(data.productName.toLowerCase()));
      if (matched) {
        handleDeleteProduct(matched.id);
      } else {
        alert(`Oga, we try to delete "${data.productName || 'General Item'}" but we didn't find any match in your stock list.`);
      }
    }
  };

  // Receive bank SMS transaction uploader link
  const handleApplySMSRepayment = (repay: { amount: number; senderName: string; bankName: string }) => {
    // Find customer oweing balance
    const matchedSale = sales.find(s => s.customerName.toLowerCase().includes(repay.senderName.toLowerCase()) && s.balanceDebt > 0)
                      || sales.find(s => s.balanceDebt > 0); // fallback to oldest open debt

    if (matchedSale) {
      const newPaid = matchedSale.amountPaid + repay.amount;
      const newDebt = Math.max(0, matchedSale.totalAmount - newPaid);
      handleUpdateSale(matchedSale.id, {
        amountPaid: newPaid,
        balanceDebt: newDebt,
        paymentStatus: newDebt === 0 ? 'PAID' : 'PARTIAL'
      });
    }
  };

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'inventory', label: 'Stock', icon: <Package className="h-4 w-4" /> },
    { id: 'sales', label: 'Sales & Debts', icon: <ShoppingCart className="h-4 w-4" /> },
    { id: 'voice', label: 'Voice Controller', icon: <Mic className="h-4 w-4 text-green-600 animate-pulse" /> },
    { id: 'chat', label: 'Trade Strategy Chat', icon: <HelpCircle className="h-4 w-4" /> },
    { id: 'bank', label: 'Direct Bank Accounts', icon: <Landmark className="h-4 w-4" /> },
    { id: 'contacts', label: 'Contacts Connect', icon: <Users className="h-4 w-4" /> },
    { id: 'settings', label: 'SME Settings', icon: <Settings className="h-4 w-4" /> },
  ];

  if (activeTab === 'public-catalog') {
    return (
      <PublicCatalog 
        products={products}
        businessProfile={businessProfile}
        ownerPhone={ownerProfile?.phone || ''}
        isMerchantPreview={!!user}
        onBackToApp={() => setActiveTab('dashboard')}
      />
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-ash-50 flex items-center justify-center font-sans font-light">
        <div className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-mint-400 flex items-center justify-center animate-pulse shadow-xs">
            <SabisellLogo className="h-6 w-6 text-white" animate={true} />
          </div>
          <p className="text-[11px] text-ash-500 tracking-widest font-normal uppercase animate-pulse">Loading Sabisell app...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showAuthGate) {
      return (
        <AuthScreen 
          onAuthSuccess={(owner, business, appwriteUser) => { 
            setOwnerProfile(owner); 
            setBusinessProfile(business); 
            setUser(appwriteUser); // Immediately logs them in, shifting state reactively!
            setShowAuthGate(false); // Reset to false on successful authentication
            setActiveTab('dashboard'); // Default to dashboard on successful login
          }} 
          onBackToHome={() => setShowAuthGate(false)}
        />
      );
    }
    return (
      <LandingPage onEnterApp={() => setShowAuthGate(true)} theme={theme} setTheme={setTheme} />
    );
  }

  return (
    <div className="min-h-screen bg-ash-50 text-ash-900 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-ash-200/50 font-sans font-light">
      
      {/* Dynamic Navigation Rails with White, Ash, and Mint Accents */}
      <aside className="hidden lg:flex w-full lg:w-64 bg-white lg:min-h-screen shrink-0 text-ash-800 flex-col justify-between p-4 z-40 border-b lg:border-b-0 lg:border-r border-ash-200">
        
        <div className="space-y-6">
          {/* Logo Brand Card styled like SME Command Center */}
          <div className="flex items-center justify-between pb-4 border-b border-ash-100">
            <div 
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity" 
              onClick={() => setActiveTab('dashboard')}
              title="Return to Dashboard"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-xs overflow-hidden shrink-0">
                {businessProfile.logoUrl ? (
                  <img src={businessProfile.logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-mint-400 flex items-center justify-center">
                    <SabisellLogo className="h-4.5 w-4.5 text-white" animate={true} />
                  </div>
                )}
              </div>
              <div>
                <span className="font-display font-medium text-base block tracking-tight text-ash-900">Sabisell</span>
                <span className="text-[10px] text-ash-400 font-normal uppercase tracking-widest block font-sans">SME COMMAND CENTER</span>
              </div>
            </div>
          </div>

          {/* Core Tab controls in ash and mint styles with light/normal typography */}
          <nav className="space-y-1">
            {navTabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs tracking-wide transition-all duration-150 ${
                    isActive
                      ? 'bg-mint-50/70 text-mint-600 shadow-xs border-l-2 border-mint-455 font-normal'
                      : 'text-ash-600 hover:bg-ash-50 hover:text-ash-900 font-light'
                  }`}
                >
                  <span className={isActive ? 'text-mint-500 font-normal' : 'text-ash-400'}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User identification badge / Live Syncing banner in Professional Polish theme */}
        <div className="hidden md:block border-t border-ash-100 pt-4 space-y-2 mt-4">
          <div className="bg-ash-fb p-3 px-3 rounded-lg border border-ash-100 shadow-xs">
            <p className="text-[9px] text-ash-400 uppercase tracking-wider font-semibold mb-1">Business active</p>
            <p className="text-xs font-normal truncate text-ash-800">{businessProfile.businessName}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-2 h-2 rounded-full bg-mint-400 animate-pulse"></div>
              <span className="text-[10px] text-ash-500 font-light font-mono">Cloud Synced</span>
            </div>
            
            <button
              onClick={async () => {
                try {
                  await account.deleteSession('current');
                } catch (err) {
                  console.error('[Appwrite Signout Error]:', err);
                }
                clearAppwriteSession();
                // Preserve local ledger state
                setUser(null);
              }}
              className="mt-3.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-red-200/55 bg-red-50 hover:bg-red-100 text-[10px] font-normal text-red-650 hover:text-red-705 cursor-pointer transition-all"
            >
              <LogOut className="h-3 w-3" />
              <span>Sign Out Of Ledger</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main workspace panels with Custom Header */}
      <div className="flex-grow flex flex-col min-h-screen relative">
        <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-ash-fb/95 backdrop-blur-md border-b border-ash-150 dark:border-ash-100/80 px-4 lg:px-8 flex items-center justify-between shadow-xs shrink-0 font-sans">
          <div className="flex items-center gap-2 sm:gap-6">
            {/* Mobile Branding - Visually unified with user greeting on mobile */}
            <div 
              className="lg:hidden flex items-center gap-2 mr-1 cursor-pointer hover:opacity-85 transition-opacity" 
              onClick={() => setActiveTab('dashboard')}
              title="Return to Dashboard"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                {businessProfile.logoUrl ? (
                  <img src={businessProfile.logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-mint-400 flex items-center justify-center text-white font-normal">
                    <SabisellLogo className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
              </div>
              <span className="font-display font-medium text-xs tracking-tight text-ash-900 dark:text-ash-900 border-r border-ash-200/80 dark:border-ash-100/60 pr-2 pl-0.5">Sabisell</span>
            </div>

            <h1 className="text-xs sm:text-sm tracking-tight text-ash-700">
              Morning, <span className="font-normal text-ash-900">{ownerProfile.fullName ? ownerProfile.fullName.trim().split(' ')[0] : 'Oga'}</span>
            </h1>
            <div 
              onClick={() => setActiveTab('voice')}
              className="flex items-center gap-2 px-2.5 py-1 bg-ash-50 hover:bg-ash-100/80 rounded-full cursor-pointer transition-all border border-ash-150 shrink-0"
            >
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-ping"></div>
              <span className="text-[10px] font-normal text-ash-600 sm:inline hidden">Voice active</span>
              <Mic className="h-3 w-3 text-ash-400 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Elegant Mode Toggling switch with smooth rotary icon shifts */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-1.5 sm:p-2 rounded-xl border border-ash-200 hover:border-mint-400 text-ash-500 hover:text-mint-600 transition-all cursor-pointer bg-ash-fb shadow-3xs hover:scale-105 active:scale-95 flex items-center justify-center"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              ) : (
                <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
            </button>
            <button 
              onClick={() => setActiveTab('chat')}
              className="hidden sm:inline-block text-[10px] sm:text-xs font-normal py-1.5 px-3 border border-ash-200 hover:border-mint-400 text-ash-600 hover:text-mint-600 rounded-lg uppercase tracking-wider transition-all"
            >
              Report
            </button>
            <div 
              onClick={() => setActiveTab('settings')}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-ash-105 hover:bg-ash-100 text-ash-700 font-normal flex items-center justify-center text-xs border border-ash-200 shadow-xs font-display uppercase cursor-pointer overflow-hidden transition-all hover:scale-105 shrink-0"
            >
              {businessProfile.logoUrl ? (
                <img src={businessProfile.logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                ownerProfile.avatarText
              )}
            </div>

            {/* Mobile menu trigger */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-ash-500 hover:text-ash-950 p-1.5 rounded-lg hover:bg-ash-50 transition-colors border border-ash-200/50 dark:border-ash-100/30 flex items-center justify-center bg-ash-fb shadow-3xs"
            >
              {mobileMenuOpen ? <X className="h-3.5 w-3.5" /> : <Menu className="h-3.5 w-3.5" />}
            </button>
          </div>
        </header>

        {/* Transparent backdrop when side drawer is open */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-45 transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Beautiful side drawer navigation on mobile and tablet when open */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed top-0 right-0 bottom-0 h-full w-[50%] bg-white dark:bg-black backdrop-blur-xl border-l border-slate-205 dark:border-zinc-800 shadow-2xl p-5 z-50 animate-slide-in flex flex-col justify-between overflow-y-auto">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between pb-3 border-b border-ash-100/50">
                <span className="text-[10px] text-ash-400 font-bold uppercase tracking-widest">
                  Sabisell Menu
                </span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-ash-100 dark:hover:bg-ash-800 text-ash-500 hover:text-ash-950 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex flex-col gap-2.5 mt-3">
                {navTabs.map(tab => {
                   const isActive = activeTab === tab.id;
                   return (
                     <button
                       key={tab.id}
                       onClick={() => {
                         setActiveTab(tab.id);
                         setMobileMenuOpen(false);
                       }}
                       className={`w-full text-left flex items-center justify-start gap-3 px-3.5 py-3 rounded-xl text-xs tracking-wide transition-all ${
                         isActive
                           ? 'bg-mint-50/80 dark:bg-mint-900/20 text-mint-600 dark:text-mint-400 font-bold border border-mint-455'
                           : 'text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 font-medium bg-white dark:bg-zinc-950'
                       }`}
                     >
                       <span className={isActive ? 'text-mint-500' : 'text-slate-400 dark:text-zinc-500'}>
                         {tab.icon}
                       </span>
                       <span>{tab.label}</span>
                     </button>
                   );
                })}
              </div>
            </div>

            {/* Logout button & Business description at bottom of Drawer */}
            <div className="pt-4 border-t border-ash-100/50 mt-4">
              <div className="flex flex-col gap-1 mb-3 text-[10px] text-ash-400">
                <span className="truncate">Store: {businessProfile.businessName}</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-mint-400 animate-pulse"></span>
                  Cloud Synced
                </span>
              </div>
              <button
                onClick={async () => {
                  try {
                    await account.deleteSession('current');
                  } catch (err) {
                     console.error('[Appwrite Signout Error]:', err);
                  }
                  clearAppwriteSession();
                  // Preserve local ledger state
                  setUser(null);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-200/55 dark:border-red-500/20 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 text-[11px] font-semibold text-red-650 hover:text-red-750 dark:text-red-400 cursor-pointer transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 p-3.5 sm:p-6 md:p-8 pb-36 md:pb-8 overflow-y-auto w-full max-w-7xl mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <Dashboard 
              products={products} 
              sales={sales} 
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              onNavigate={(tab) => setActiveTab(tab)} 
              businessProfile={businessProfile}
            />
          )}
          {activeTab === 'inventory' && (
            <InventoryManager 
              products={products} 
              priceHistory={priceHistory}
              onAddProduct={handleAddProduct} 
              onUpdateProduct={handleUpdateProduct} 
              onDeleteProduct={handleDeleteProduct} 
              businessProfile={businessProfile}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}
          {activeTab === 'sales' && (
            <SalesManager 
              products={products} 
              sales={sales} 
              onAddSale={handleAddSale} 
              onUpdateSale={handleUpdateSale} 
              onDeleteSale={handleDeleteSale}
              businessProfile={businessProfile}
            />
          )}
          {activeTab === 'voice' && (
            <VoiceAssistant 
              products={products} 
              onApplyParsedAction={handleApplyParsedSpeechAction} 
              ownerProfile={ownerProfile}
              businessProfile={businessProfile}
            />
          )}
          {activeTab === 'chat' && (
            <BrainstormChat 
              products={products} 
              sales={sales} 
              onApplyParsedAction={handleApplyParsedSpeechAction}
              ownerProfile={ownerProfile}
              businessProfile={businessProfile}
            />
          )}
          {activeTab === 'bank' && (
            <BankLinker 
              sales={sales}
              onUpdateSale={handleUpdateSale}
              onApplyParsedRepayment={handleApplySMSRepayment} 
              businessProfile={businessProfile}
            />
          )}
          {activeTab === 'settings' && (
            <BusinessSettings 
              ownerProfile={ownerProfile} 
              businessProfile={businessProfile} 
              onSaveProfiles={handleSaveProfiles} 
              onLogout={handleLogout}
            />
          )}
          {activeTab === 'contacts' && (
            <ContactsConnect />
          )}
        </main>
      </div>

      {/* Fixed bottom navigation bar (Beautifully anchored, Glass-morphic, High-contrast in Light/Dark Mode) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-ash-200/50 dark:border-ash-100/30 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] px-4 py-2.5 pb-4.5 flex justify-around items-center z-50">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5 font-light" /> },
          { id: 'inventory', label: 'Stock', icon: <Package className="h-5 w-5 font-light" /> },
          { id: 'sales', label: 'Sales & Debts', icon: <ShoppingCart className="h-5 w-5 font-light" /> },
          { id: 'chat', label: 'Sabi AI', icon: <Sparkles className="h-5 w-5" /> },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const isAI = tab.id === 'chat';
          
          if (isAI) {
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex flex-col items-center cursor-pointer transition-all duration-200 relative px-2.5 py-0.5 rounded-xl ${
                  isActive ? 'scale-105 filter drop-shadow-[0_0_12px_rgba(236,72,153,0.3)]' : 'hover:scale-102 hover:opacity-95'
                }`}
                style={{ minWidth: '64px' }}
              >
                {/* Highlighted Gradient container with pulse effect */}
                <div className={`p-2 rounded-xl transition-all duration-200 flex items-center justify-center relative ${
                  isActive 
                    ? 'bg-gradient-to-tr from-mint-450 to-emerald-500 text-white shadow-md' 
                    : 'bg-mint-50/80 dark:bg-mint-600/10 text-mint-600 dark:text-mint-400 border border-mint-200/50 dark:border-mint-500/20 shadow-3xs'
                }`}>
                  {tab.icon}
                </div>
                <span className={`text-[10px] tracking-tight mt-1 transition-all duration-150 font-semibold ${
                  isActive 
                    ? 'text-mint-500 dark:text-mint-400 font-bold' 
                    : 'text-ash-500 dark:text-ash-700 font-medium'
                }`}>
                  {tab.label}
                </span>
                
                {/* Smart little glowing dot indicator for user awareness of AI availability */}
                {!isActive && (
                  <span className="absolute top-0.5 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-mint-500"></span>
                  </span>
                )}
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`flex flex-col items-center cursor-pointer transition-all duration-150 min-w-[64px] ${
                isActive ? 'scale-102' : 'opacity-85 hover:opacity-100'
              }`}
            >
              <div className={`p-2 rounded-xl transition-all duration-150 flex items-center justify-center ${
                isActive 
                  ? 'bg-gradient-to-tr from-mint-400 to-pink-500 text-white shadow-sm' 
                  : 'bg-transparent text-ash-500 dark:text-ash-600 hover:bg-ash-50 dark:hover:bg-ash-100/10'
              }`}>
                {tab.icon}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 transition-all duration-150 ${
                isActive 
                  ? 'text-mint-500 dark:text-mint-400 font-bold' 
                  : 'text-ash-500 dark:text-ash-700 font-medium'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
