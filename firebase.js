import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let db = null;

export function getDb() {
  if (!import.meta.env.VITE_FIREBASE_API_KEY) {
    if (import.meta.env.DEV) {
      console.info('VerseVault: Add VITE_FIREBASE_* vars to .env to save/load library across logins.');
    }
    return null;
  }
  if (!db) {
    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      db = getFirestore(app);
    } catch (e) {
      console.warn('Firebase not configured:', e.message);
      return null;
    }
  }
  return db;
}

const USERS_COLLECTION = 'users';

export async function getUserPassages(userId) {
  const firestore = getDb();
  if (!firestore) return { recentPassages: [], favoritePassages: [] };
  try {
    const userRef = doc(firestore, USERS_COLLECTION, userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        recentPassages: Array.isArray(data.recentPassages) ? data.recentPassages : [],
        favoritePassages: Array.isArray(data.favoritePassages) ? data.favoritePassages : [],
      };
    }
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('VerseVault Firestore load failed:', e.code || e.message, e.message);
    }
  }
  return { recentPassages: [], favoritePassages: [] };
}

export async function setUserPassages(userId, { recentPassages, favoritePassages }) {
  const firestore = getDb();
  if (!firestore) return;
  try {
    const userRef = doc(firestore, USERS_COLLECTION, userId);
    await setDoc(userRef, {
      recentPassages: recentPassages || [],
      favoritePassages: favoritePassages || [],
    });
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('VerseVault Firestore save failed:', e.code || e.message, e.message);
    }
  }
}
