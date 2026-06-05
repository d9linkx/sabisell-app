export interface Product {
  id: string;
  name: string;
  quantity: number;
  costPrice: number; // in Naira
  sellingPrice: number; // in Naira
  category?: string;
  lastUpdated: string;
  type?: 'product' | 'service';
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  amountPaid: number;
  balanceDebt: number;
  customerName: string;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';
  timestamp: string;
}

export interface CustomerPayment {
  id: string;
  customerName: string;
  phoneNumber?: string;
  amountPaid: number;
  timestamp: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface ConnectedBank {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  balance: number;
  linkedAt: string;
  status: 'active' | 'disconnected';
}

export interface BankTransaction {
  id: string;
  bankName: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  timestamp: string;
  status: 'parsed' | 'pending';
}

export interface BusinessReport {
  weekStarting: string;
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  outstandingDebts: number;
  inventoryValue: number;
  topMovingProduct: string;
  marginOptimizationStrategy: string;
}

export interface OwnerProfile {
  fullName: string;
  phone: string;
  email: string;
  avatarText: string;
}

export interface BusinessProfile {
  businessName: string;
  category: string;
  address: string;
  currency: string;
  whatsappGreeting: string;
  whatsappReminderSuffix: string;
  logoUrl?: string; // base64 encoded or external URL representing the uploaded business logo
}

export function isOrganizationCategory(category: string): boolean {
  if (!category) return false;
  const lower = category.toLowerCase();
  return (
    lower.includes('school') ||
    lower.includes('educational') ||
    lower.includes('academy') ||
    lower.includes('church') ||
    lower.includes('religious') ||
    lower.includes('ngo') ||
    lower.includes('non-profit') ||
    lower.includes('charity') ||
    lower.includes('association') ||
    lower.includes('club') ||
    lower.includes('organization') ||
    lower.includes('institution')
  );
}

export interface OrganizationTerms {
  stocks: string;
  stockItem: string;
  productService: string;
  sales: string;
  sale: string;
  totalSales: string;
  customer: string;
  customers: string;
  debt: string;
  debtTitle: string;
  supplier: string;
  restocking: string;
  sellItem: string;
  costPrice: string;
  sellingPrice: string;
}

export function getOrganizationTerminology(category: string, isOrg: boolean): OrganizationTerms {
  if (!isOrg) {
    return {
      stocks: "My Items",
      stockItem: "Item",
      productService: "Work & Things",
      sales: "Sales List",
      sale: "Record of Sale",
      totalSales: "Cash Made",
      customer: "Client",
      customers: "My Customers",
      debt: "Money Owed",
      debtTitle: "Debt Book",
      supplier: "Who I Buy From",
      restocking: "Add New Items",
      sellItem: "Sell Item",
      costPrice: "What I Paid",
      sellingPrice: "Price to Sell"
    };
  }

  const lower = (category || "").toLowerCase();
  
  if (lower.includes('school') || lower.includes('educational') || lower.includes('academy') || lower.includes('tuition')) {
    return {
      stocks: "Class Programs & Tuition Fees",
      stockItem: "Class Course / Tuition Fee",
      productService: "Tuition Fee / Learning Material",
      sales: "Collected Fees",
      sale: "Fee Payment Record",
      totalSales: "Total Fees Collected",
      customer: "Student / Parent",
      customers: "Registered Students & Parents",
      debt: "Outstanding Tuition Balance",
      debtTitle: "Students with Fee Balance",
      supplier: "Book & Uniform Supplier",
      restocking: "Register Class Course",
      sellItem: "Record Fee Payment / Bill Student",
      costPrice: "Course Setup / Material Expense",
      sellingPrice: "Tuition Rate / Termly Fee"
    };
  }

  if (lower.includes('church') || lower.includes('religious') || lower.includes('ngo') || lower.includes('non-profit') || lower.includes('charity')) {
    return {
      stocks: "Projects & Ministry Programs",
      stockItem: "Tithe, Contribution, or Donation Project",
      productService: "Ministry Service / Charity Fundraiser Project",
      sales: "Received Offerings / Contributions",
      sale: "Donation Record",
      totalSales: "Total Donation Funds Received",
      customer: "Donor / Congregation Member",
      customers: "Members & Fund Donors",
      debt: "Outstanding Ministry Pledge Balance",
      debtTitle: "Members with Active Pledges",
      supplier: "Event/Charity Supply Vendor",
      restocking: "Register Donation Project",
      sellItem: "Record Contribution Event",
      costPrice: "Project Cost / Ministry Expense Budget",
      sellingPrice: "Target Goal / Donation Suggested Rate"
    };
  }

  return {
    stocks: "Organizational Asset Registry",
    stockItem: "Registered Asset or Regular Fee",
    productService: "Asset / Regular Levy Program",
    sales: "Dues & Regular Levies Collected",
    sale: "Levy Collection Record",
    totalSales: "Total Capital Levies Received",
    customer: "Club / Association Member",
    customers: "Registered Members & Affiliates",
    debt: "Outstanding Levy Due Balance",
    debtTitle: "Members Owed Lever",
    supplier: "Operations Provider / Vendor",
    restocking: "Register Organizational Asset",
    sellItem: "Post Member Association Fee",
    costPrice: "Acquisition Cost",
    sellingPrice: "Membership Assessment Levy Rate"
  };
}

export interface Expense {
  id: string;
  description: string;
  amount: number; // in Naira
  category: 'Transport' | 'Supplies' | 'Utilities' | 'Rent' | 'Salary' | 'Other' | string;
  timestamp: string;
  associatedProductId?: string; // linked product
}

export interface PriceHistory {
  id: string;
  productId: string;
  costPrice: number;
  sellingPrice: number;
  timestamp: string; // ISO string or short date
}
