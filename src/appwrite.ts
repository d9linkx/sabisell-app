import { Client, Account, Databases, ID, Query } from 'appwrite';

// Read configuration from environment variables or saved local settings (useful for live preview setup!)
const metaEnv = (import.meta as any).env || {};

export const APPWRITE_ENDPOINT = metaEnv.VITE_APPWRITE_ENDPOINT || localStorage.getItem('sabisell_appwrite_endpoint') || (typeof window !== 'undefined' ? `${window.location.origin}/api/appwrite-proxy` : '/api/appwrite-proxy');
export const APPWRITE_PROJECT_ID = metaEnv.VITE_APPWRITE_PROJECT_ID || localStorage.getItem('sabisell_appwrite_project_id') || 'sabisell-appwrite-sandbox';
export const APPWRITE_DATABASE_ID = metaEnv.VITE_APPWRITE_DATABASE_ID || localStorage.getItem('sabisell_appwrite_database_id') || 'sabisell_db';
export const APPWRITE_USERS_COLLECTION_ID = metaEnv.VITE_APPWRITE_USERS_COLLECTION_ID || localStorage.getItem('sabisell_appwrite_users_col') || 'users';
export const APPWRITE_PRODUCTS_COLLECTION_ID = metaEnv.VITE_APPWRITE_PRODUCTS_COLLECTION_ID || localStorage.getItem('sabisell_appwrite_products_col') || 'products';
export const APPWRITE_SALES_COLLECTION_ID = metaEnv.VITE_APPWRITE_SALES_COLLECTION_ID || localStorage.getItem('sabisell_appwrite_sales_col') || 'sales';

export const client = new Client();

// Gracefully intercept & mock client.subscribe when using local Appwrite proxy/sandbox
// This prevents infinite WebSocket reconnection warnings in sandboxed preview containers
const originalSubscribe = client.subscribe.bind(client);
client.subscribe = function (this: any, topics: string | string[], callback: (response: any) => void) {
  const isProxy = APPWRITE_ENDPOINT.includes('appwrite-proxy') || !APPWRITE_PROJECT_ID || APPWRITE_PROJECT_ID === 'sabisell-appwrite-sandbox';
  if (isProxy) {
    console.log('[Appwrite Realtime]: Substituted mock listener for topics:', topics);
    return () => {
      console.log('[Appwrite Realtime]: Closed sandbox listener for topics:', topics);
    };
  }
  return originalSubscribe(topics, callback);
};
export const account = new Account(client);
export const databases = new Databases(client);

// Check if Appwrite credentials have been configured
export function getAppwriteStatus() {
  return {
    isConfigured: !!APPWRITE_PROJECT_ID,
    endpoint: APPWRITE_ENDPOINT,
    projectId: APPWRITE_PROJECT_ID,
    databaseId: APPWRITE_DATABASE_ID,
    usersCollection: APPWRITE_USERS_COLLECTION_ID,
    productsCollection: APPWRITE_PRODUCTS_COLLECTION_ID,
    salesCollection: APPWRITE_SALES_COLLECTION_ID,
  };
}

// Dynamically configuration applying
export function applyAppwriteConfig(config: {
  endpoint: string;
  projectId: string;
  databaseId: string;
  usersCol: string;
  productsCol: string;
  salesCol: string;
}) {
  localStorage.setItem('sabisell_appwrite_endpoint', config.endpoint.trim());
  localStorage.setItem('sabisell_appwrite_project_id', config.projectId.trim());
  localStorage.setItem('sabisell_appwrite_database_id', config.databaseId.trim());
  localStorage.setItem('sabisell_appwrite_users_col', config.usersCol.trim());
  localStorage.setItem('sabisell_appwrite_products_col', config.productsCol.trim());
  localStorage.setItem('sabisell_appwrite_sales_col', config.salesCol.trim());
  
  window.location.reload();
}

export function clearAppwriteConfig() {
  localStorage.removeItem('sabisell_appwrite_endpoint');
  localStorage.removeItem('sabisell_appwrite_project_id');
  localStorage.removeItem('sabisell_appwrite_database_id');
  localStorage.removeItem('sabisell_appwrite_users_col');
  localStorage.removeItem('sabisell_appwrite_products_col');
  localStorage.removeItem('sabisell_appwrite_sales_col');
  
  window.location.reload();
}

// Guard application initialization
if (APPWRITE_PROJECT_ID) {
  client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

  const savedSession = localStorage.getItem('sabisell_appwrite_session_id');
  if (savedSession) {
    try {
      client.setSession(savedSession);
    } catch (_) {}
  }
}

export function setAppwriteSession(sessionId: string) {
  localStorage.setItem('sabisell_appwrite_session_id', sessionId);
  try {
    client.setSession(sessionId);
  } catch (_) {}
}

export function clearAppwriteSession() {
  localStorage.removeItem('sabisell_appwrite_session_id');
  try {
    client.setSession('');
  } catch (_) {}
}

export { ID, Query };
