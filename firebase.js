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

const VALID_FONT_OPTIONS = ['classic', 'modern', 'mono', 'elegant', 'bold'];
const VALID_BG_OPTIONS = ['blank', 'papyrus', 'notepad', 'ivory', 'charcoal'];
const VALID_VISIBILITY_MODES = ['full', '1', '2', '3', 'wpm'];

export async function getUserPassages(userId) {
  const firestore = getDb();
  if (!firestore) return { recentPassages: [], favoritePassages: [], themeIdx: 0, appBgIdx: 0, fontOption: 'modern', bgOption: 'blank', lastPassage: '', visibilityMode: 'full', showFirstLetters: false };
  try {
    const userRef = doc(firestore, USERS_COLLECTION, userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      const themeIdx = typeof data.themeIdx === 'number' ? data.themeIdx : 0;
      const appBgIdx = typeof data.appBgIdx === 'number' ? data.appBgIdx : 0;
      const fontOption = typeof data.fontOption === 'string' && VALID_FONT_OPTIONS.includes(data.fontOption) ? data.fontOption : 'modern';
      const bgOption = typeof data.bgOption === 'string' && VALID_BG_OPTIONS.includes(data.bgOption) ? data.bgOption : 'blank';
      const lastPassage = typeof data.lastPassage === 'string' ? data.lastPassage : '';
      const visibilityMode = typeof data.visibilityMode === 'string' && VALID_VISIBILITY_MODES.includes(data.visibilityMode) ? data.visibilityMode : 'full';
      const showFirstLetters = typeof data.showFirstLetters === 'boolean' ? data.showFirstLetters : false;
      return {
        recentPassages: Array.isArray(data.recentPassages) ? data.recentPassages : [],
        favoritePassages: Array.isArray(data.favoritePassages) ? data.favoritePassages : [],
        themeIdx,
        appBgIdx,
        fontOption,
        bgOption,
        lastPassage,
        visibilityMode,
        showFirstLetters,
      };
    }
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('VerseVault Firestore load failed:', e.code || e.message, e.message);
    }
  }
  return { recentPassages: [], favoritePassages: [], themeIdx: 0, appBgIdx: 0, fontOption: 'modern', bgOption: 'blank', lastPassage: '', visibilityMode: 'full', showFirstLetters: false };
}

export async function setUserPassages(userId, { recentPassages, favoritePassages, themeIdx, appBgIdx, fontOption, bgOption, lastPassage, visibilityMode, showFirstLetters }) {
  const firestore = getDb();
  if (!firestore) return;
  try {
    const userRef = doc(firestore, USERS_COLLECTION, userId);
    const payload = {
      recentPassages: recentPassages || [],
      favoritePassages: favoritePassages || [],
    };
    if (typeof themeIdx === 'number') payload.themeIdx = themeIdx;
    if (typeof appBgIdx === 'number') payload.appBgIdx = appBgIdx;
    if (typeof fontOption === 'string') payload.fontOption = fontOption;
    if (typeof bgOption === 'string') payload.bgOption = bgOption;
    if (typeof lastPassage === 'string') payload.lastPassage = lastPassage;
    if (typeof visibilityMode === 'string') payload.visibilityMode = visibilityMode;
    if (typeof showFirstLetters === 'boolean') payload.showFirstLetters = showFirstLetters;
    await setDoc(userRef, payload);
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('VerseVault Firestore save failed:', e.code || e.message, e.message);
    }
  }
}
