import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export interface FirebaseConfigParams {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

const STORAGE_CUSTOM_CONFIG_KEY = 'planly_firebase_custom_config_v1';

export const getSavedCustomConfig = (): FirebaseConfigParams | null => {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.apiKey && parsed.projectId) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse custom firebase config', e);
  }
  return null;
};

export const saveCustomConfig = (config: FirebaseConfigParams): void => {
  localStorage.setItem(STORAGE_CUSTOM_CONFIG_KEY, JSON.stringify(config));
};

export const clearCustomConfig = (): void => {
  localStorage.removeItem(STORAGE_CUSTOM_CONFIG_KEY);
};

export const getActiveFirebaseConfig = (): FirebaseConfigParams | null => {
  // 1. Check custom user config stored in browser
  const custom = getSavedCustomConfig();
  if (custom && custom.apiKey) {
    return custom;
  }

  // 2. Check Vite environment variables (e.g. from Vercel or .env)
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (envApiKey && envProjectId && envApiKey !== 'YOUR_FIREBASE_API_KEY') {
    return {
      apiKey: envApiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
    };
  }

  return null;
};

export const isFirebaseConfigured = (): boolean => {
  const config = getActiveFirebaseConfig();
  return Boolean(config && config.apiKey && config.projectId);
};

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

export const initFirebase = (): { app: FirebaseApp | null; auth: Auth | null; db: Firestore | null } => {
  const config = getActiveFirebaseConfig();
  if (!config) {
    return { app: null, auth: null, db: null };
  }

  try {
    if (!getApps().length) {
      appInstance = initializeApp(config);
    } else {
      appInstance = getApp();
    }
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
    return { app: appInstance, auth: authInstance, db: dbInstance };
  } catch (err) {
    console.error('Failed to initialize Firebase app', err);
    return { app: null, auth: null, db: null };
  }
};

const initial = initFirebase();
export const firebaseApp = initial.app;
export const firebaseAuth = initial.auth;
export const firestoreDb = initial.db;
