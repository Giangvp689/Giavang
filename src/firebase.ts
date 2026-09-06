import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  getFirestore, 
  doc, 
  onSnapshot, 
  setDoc, 
  getDoc,
  Unsubscribe 
} from 'firebase/firestore';
import { GoldItem, StoreSettings, PublicRatesResponse } from './types';

// Firebase configuration from environment or fallback to provisioned values
export const firebaseConfig = {
  projectId: "gen-lang-client-0835625292",
  appId: "1:64222780158:web:d5546ae7177680e1a123af",
  apiKey: "AIzaSyC2sxFHtoDqoQvnKoTICHAbpJuUbUXZ8TU",
  authDomain: "gen-lang-client-0835625292.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-giavang-cd69dab1-4e28-4978-830d-5a692537f079",
  storageBucket: "gen-lang-client-0835625292.firebasestorage.app",
  messagingSenderId: "64222780158"
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if configured
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

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
      console.warn('[Firebase] Firestore onSnapshot warning:', err);
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
    const payload: FirebaseStoreData = {
      items,
      settings: {
        ...settings,
        lastSyncedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' • ' + new Date().toLocaleDateString('vi-VN')
      },
      updatedAt: new Date().toISOString(),
      updatedDevice: deviceInfo
    };
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (error) {
    console.error('[Firebase] Error saving to Firestore:', error);
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
    console.warn('[Firebase] Error reading from Firestore:', error);
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
      console.warn('[Firebase] Market rates listener error:', err);
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
    console.warn('[Firebase] Error saving market rates to Firestore:', error);
  }
}
