
"use client";

import { db } from './firebase/config';
import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs, onSnapshot, documentId } from 'firebase/firestore';
import type { SystemSettings } from './settings';
import { defaultSettings } from './settings';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const SETTINGS_COLLECTION = 'impact-balance-settings';
const SETTINGS_DOC_ID = 'default';
const UCS_QUOTATION_COLLECTION = 'ucs_ase';

// Cache configuration
const CACHE_KEY = 'ucs_quotation_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CachedQuotation {
  data: { value: number; date: string };
  timestamp: number;
}

// Cache utilities
const getCachedQuotation = (): { value: number; date: string } | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const parsedCache: CachedQuotation = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - parsedCache.timestamp < CACHE_TTL) {
      return parsedCache.data;
    }
    
    // Cache expired, remove it
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch (error) {
    console.warn('Error reading quotation cache:', error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

const setCachedQuotation = (data: { value: number; date: string }): void => {
  try {
    const cacheData: CachedQuotation = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Error setting quotation cache:', error);
  }
};

export const clearQuotationCache = (): void => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn('Error clearing quotation cache:', error);
  }
};


// Function to get the latest UCS quotation from Firestore
export const getLatestUcsQuotation = async (): Promise<{value: number, date: string} | null> => {
    // Check cache first
    const cached = getCachedQuotation();
    if (cached) {
        return cached;
    }

    const ucsCollection = collection(db, UCS_QUOTATION_COLLECTION);
    // Order by document ID (date string) descending to get the latest
    const q = query(ucsCollection, orderBy(documentId(), 'desc'), limit(1));

    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const latestDoc = querySnapshot.docs[0];
            const data = latestDoc.data() as Record<string, unknown>;
            const raw = data.valor_brl as unknown;
            const parsed = typeof raw === 'number' ? raw : typeof raw === 'string' ? parseFloat(raw.replace(',', '.')) : NaN;
            if (Number.isFinite(parsed) && parsed > 0) {
              const result = {
                  value: parsed,
                  date: latestDoc.id // The document ID is the date string e.g., "2025-10-24"
              };
              // Cache the result
              setCachedQuotation(result);
              return result;
            }
        }
        return null;
    } catch (serverError: unknown) {
        const err = serverError as { code?: string };
        // If index is missing for orderBy(__name__), fall back to client-side max by ID
        if (err?.code === 'failed-precondition') {
            try {
                const all = await getDocs(ucsCollection);
                if (!all.empty) {
                    // Pick the doc with max lexicographic ID (YYYY-MM-DD)
                    const latestDoc = all.docs.reduce((a, b) => (a.id > b.id ? a : b));
                    const data = latestDoc.data() as Record<string, unknown>;
                    const raw = data.valor_brl as unknown;
                    const parsed = typeof raw === 'number' ? raw : typeof raw === 'string' ? parseFloat(raw.replace(',', '.')) : NaN;
                    if (Number.isFinite(parsed) && parsed > 0) {
                        const result = { value: parsed, date: latestDoc.id };
                        setCachedQuotation(result);
                        return result;
                    }
                }
            } catch (fallbackErr) {
                console.error('Fallback read of UCS quotation failed', fallbackErr);
            }
        }
        if (err?.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: ucsCollection.path,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            console.error("Error reading UCS quotation from Firestore", serverError);
        }
        return null;
    }
}

// Realtime subscription to the latest UCS quotation. Returns an unsubscribe function.
export const subscribeLatestUcsQuotation = (
  onChange: (data: { value: number; date: string } | null) => void
) => {
  const ucsCollection = collection(db, UCS_QUOTATION_COLLECTION);
  const qLatest = query(ucsCollection, orderBy(documentId(), 'desc'), limit(1));
  const orderedListener = (snapshot: any) => {
    if (!snapshot.empty) {
      const latestDoc = snapshot.docs[0];
      const data = latestDoc.data() as Record<string, unknown>;
      const raw = data.valor_brl as unknown;
      const parsed = typeof raw === 'number' ? raw : typeof raw === 'string' ? parseFloat(raw.replace(',', '.')) : NaN;
      const value = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
      onChange(value !== null ? { value, date: latestDoc.id } : null);
    } else {
      onChange(null);
    }
  };

  // Start with ordered subscription, but if index missing, fall back to plain collection subscription
  const unsubscribe = onSnapshot(qLatest, orderedListener, (error) => {
    const code = (error as any)?.code as string | undefined;
    if (code === 'failed-precondition') {
      // Fallback: subscribe to whole collection and compute latest client-side
      const unsubAll = onSnapshot(ucsCollection, (snapshot) => {
        if (!snapshot.empty) {
          const latestDoc = snapshot.docs.reduce((a, b) => (a.id > b.id ? a : b));
          const data = latestDoc.data() as Record<string, unknown>;
          const raw = data.resultado_final_brl as unknown;
          const parsed = typeof raw === 'number' ? raw : typeof raw === 'string' ? parseFloat(raw.replace(',', '.')) : NaN;
          const value = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
          onChange(value !== null ? { value, date: latestDoc.id } : null);
        } else {
          onChange(null);
        }
      }, (e) => {
        console.error('Error subscribing to UCS quotation (fallback)', e);
      });
      // Return fallback unsubscribe instead
      return unsubAll;
    }
    if (code === 'permission-denied') {
      const permissionError = new FirestorePermissionError({
        path: ucsCollection.path,
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
    } else {
      console.error('Error subscribing to UCS quotation', error);
    }
  });
  return unsubscribe;
};

// Helper to deep merge settings to ensure new properties are not missing on load
const mergeWithDefault = (loadedSettings: Partial<SystemSettings>): SystemSettings => {
    const calculationSettings = loadedSettings.calculation || {} as Partial<SystemSettings['calculation']>;
    return {
        calculation: {
            perCapitaFactors: {
                ...defaultSettings.calculation.perCapitaFactors,
                ...(calculationSettings.perCapitaFactors || {}),
            },
            equivalences: {
                ...defaultSettings.calculation.equivalences,
                ...(calculationSettings.equivalences || {}),
            },
            indirectCosts: {
                ...defaultSettings.calculation.indirectCosts,
                ...(calculationSettings.indirectCosts || {}),
            },
            benefits: {
                ...defaultSettings.calculation.benefits,
                ...(calculationSettings.benefits || {}),
            },
        },
    };
};

// Function to get the settings from Firestore
export const getSettings = async (): Promise<SystemSettings> => {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    try {
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return mergeWithDefault(docSnap.data() as Partial<SystemSettings>);
        } else {
            // If no settings document exists, create one with default values
            await setDoc(docRef, defaultSettings);
            return defaultSettings;
        }
    } catch (serverError: unknown) {
        const err = serverError as { code?: string };
        if (err?.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            console.error("Error reading settings from Firestore", serverError);
        }
        // Fallback to default settings in case of an error
        return defaultSettings;
    }
};

// Function to save settings to Firestore
export const saveSettings = (settings: SystemSettings) => {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    // Exclude the dynamically loaded ucsQuotationValue from being saved
    const { calculation: { equivalences: { ucsQuotationValue, ucsQuotationDate, ...restEquivalences }, ...restCalculation } } = settings;
    const settingsToSave = {
        calculation: {
            ...restCalculation,
            equivalences: restEquivalences
        }
    };


    setDoc(docRef, settingsToSave, { merge: true }).catch(async (serverError) => {
        if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'update',
                requestResourceData: settings,
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            console.error("Error saving settings to Firestore", serverError);
        }
        // Re-throw the error to be handled by the caller
        throw serverError;
    });
};
