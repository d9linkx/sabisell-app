import { Client, Account, Databases, ID, Query } from 'appwrite';

// Read configuration from environment variables or saved local settings (useful for live preview setup!)
const metaEnv = (import.meta as any).env || {};

export const APPWRITE_ENDPOINT = metaEnv.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = metaEnv.VITE_APPWRITE_PROJECT_ID;
export const APPWRITE_DATABASE_ID = metaEnv.VITE_APPWRITE_DATABASE_ID || 'sabisell_db';
export const APPWRITE_USERS_COLLECTION_ID = metaEnv.VITE_APPWRITE_USERS_COLLECTION_ID || 'users';
export const APPWRITE_PRODUCTS_COLLECTION_ID = metaEnv.VITE_APPWRITE_PRODUCTS_COLLECTION_ID || 'products';
export const APPWRITE_SALES_COLLECTION_ID = metaEnv.VITE_APPWRITE_SALES_COLLECTION_ID || 'sales';

export const client = new Client();
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
