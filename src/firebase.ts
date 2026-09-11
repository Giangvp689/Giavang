import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  onSnapshot, 
  setDoc, 
  getDoc,
  getDocFromServer,
  Unsubscribe 
} from 'firebase/firestore';
import { GoldItem, StoreSettings, PublicRatesResponse } from './types';
import rawConfig from '../firebase-applet-config.json';

// Firebase configuration from firebase-applet-config.json with fallback values
export const firebaseConfig = {
  projectId: rawConfig.projectId || "gen-lang-client-0835625292",
  appId: rawConfig.appId || "1:64222780158:web:d5546ae7177680e1a123af",
  apiKey: rawConfig.apiKey || "AIzaSyC2sxFHtoDqoQvnKoTICHAbpJuUbUXZ8TU",
  authDomain: rawConfig.authDomain || "gen-lang-client-0835625292.firebaseapp.com",
  firestoreDatabaseId: rawConfig.firestoreDatabaseId || "ai-studio-giavang-cd69dab1-4e28-4978-830d-5a692537f079",
  storageBucket: rawConfig.storageBucket || "gen-lang-client-0835625292.firebasestorage.app",
  messagingSenderId: rawConfig.messagingSenderId || "64222780158"
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if configured
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Test initial connection to Firestore
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or network connectivity.");
    }
  }
}
testConnection();

// Document paths
const STORE_CONFIG_DOC = 'store_configs/main';
const MARKET_RATES_DOC = 'market_rates/latest';

export interface FirebaseStoreData {
  items: GoldItem[];
  settings: StoreSettings;
  updatedAt: string;
  updatedDevice?: string;
}

/**
 * Real-time listener for Store Settings & Gold Items
 * Allows TV display to immediately reflect changes saved from mobile admin or settings modal!
 */
export function subscribeToStoreConfig(
  onData: (data: FirebaseStoreData) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const docRef = doc(db, 'store_configs', 'main');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.data() as FirebaseStoreData;
        if (val && val.items && val.settings) {
          onData(val);
        }
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, STORE_CONFIG_DOC);
      if (onError) onError(err);
    }
  );
}

/**
 * Save store settings and gold items to Firestore
 * This triggers real-time updates on all connected devices (TV, phones, tablets, PCs)
 */
export async function saveStoreConfigToFirebase(
  items: GoldItem[], 
  settings: StoreSettings,
  deviceInfo: string = 'web'
): Promise<boolean> {
  try {
    const docRef = doc(db, 'store_configs', 'main');

    const sanitizedItems = items.map(it => {
      const clean = { ...it };
      if (clean.prevDaySell === undefined) clean.prevDaySell = clean.customSell || clean.baseSell || clean.apiSell || 0;
      if (clean.prevDayBuy === undefined) clean.prevDayBuy = clean.customBuy || clean.baseBuy || clean.apiBuy || 0;
      if (clean.customBuy === undefined) clean.customBuy = clean.baseBuy || clean.apiBuy || 0;
      if (clean.customSell === undefined) clean.customSell = clean.baseSell || clean.apiSell || 0;
      return clean;
    });

    const payload: FirebaseStoreData = {
      items: JSON.parse(JSON.stringify(sanitizedItems)),
      settings: JSON.parse(JSON.stringify({
        ...settings,
        lastSyncedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' • ' + new Date().toLocaleDateString('vi-VN')
      })),
      updatedAt: new Date().toISOString(),
      updatedDevice: deviceInfo
    };
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, STORE_CONFIG_DOC);
    return false;
  }
}

/**
 * Fetch initial store config from Firebase
 */
export async function fetchStoreConfigFromFirebase(): Promise<FirebaseStoreData | null> {
  try {
    const docRef = doc(db, 'store_configs', 'main');
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as FirebaseStoreData;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, STORE_CONFIG_DOC);
    return null;
  }
}

/**
 * Real-time listener for Market Rates
 */
export function subscribeToMarketRates(
  onData: (data: PublicRatesResponse) => void
): Unsubscribe {
  const docRef = doc(db, 'market_rates', 'latest');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.data() as PublicRatesResponse;
        if (val && val.rates && val.rates.length > 0) {
          onData(val);
        }
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, MARKET_RATES_DOC);
    }
  );
}

/**
 * Save latest market rates to Firestore so all clients get them even without backend
 */
export async function saveMarketRatesToFirebase(data: PublicRatesResponse): Promise<void> {
  try {
    const docRef = doc(db, 'market_rates', 'latest');
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, MARKET_RATES_DOC);
  }
}
