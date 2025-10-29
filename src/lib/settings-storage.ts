
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

const parseQuotationDoc = (doc: { id: string, data: () => Record<string, unknown> }): { value: number, date: string } | null => {
    const data = doc.data();
    const candidates = [
      'resultado_final_brl',
      'resultado_final_BRL',
      'resultadoFinalBrl',
      'resultadoFinalBRL',
      'valor_brl',
      'valorBRL',
      'valor',
      'value',
      'price',
      'cotacao',
      'cotação'
    ];

    let rawValue: unknown = (data as Record<string, unknown>)['resultado_final_brl'];
    if (rawValue === undefined || rawValue === null) {
      for (const key of candidates) {
        if (key in data) {
          rawValue = (data as Record<string, unknown>)[key];
          break;
        }
      }
    }

    if (rawValue === undefined || rawValue === null) {
      return null;
    }

    const parsedValue = typeof rawValue === 'number'
      ? rawValue
      : typeof rawValue === 'string'
      ? parseFloat(rawValue.replace(',', '.'))
      : NaN;

    if (Number.isFinite(parsedValue) && parsedValue > 0) {
      // Try to derive date from Firestore timestamp field first, then 'data' string, then doc.id
      let dateStr: string | null = null;
      const ts = (data as any).timestamp;
      if (ts && typeof ts === 'object' && typeof ts.toDate === 'function') {
        dateStr = ts.toDate().toISOString().slice(0, 10);
      } else if (typeof (data as any).data === 'string') {
        // keep original if already in dd/mm/yyyy
        dateStr = (data as any).data;
      } else {
        dateStr = doc.id;
      }

      return {
        value: parsedValue,
        date: dateStr || doc.id,
      };
    }
    return null;
};


// Function to get the latest UCS quotation from Firestore
export const getLatestUcsQuotation = async (): Promise<{value: number, date: string} | null> => {
    const cached = getCachedQuotation();
    if (cached) {
        return cached;
    }

    const ucsCollection = collection(db, UCS_QUOTATION_COLLECTION);
    
    try {
        // Prefer ordering by Firestore timestamp field when available
        let latestQuery = query(ucsCollection, orderBy('timestamp', 'desc'), limit(1));
        let querySnapshot = await getDocs(latestQuery);
        // Fallback to documentId ordering if timestamp order fails to return
        if (querySnapshot.empty) {
          latestQuery = query(ucsCollection, orderBy(documentId(), 'desc'), limit(1));
          querySnapshot = await getDocs(latestQuery);
        }
        if (querySnapshot.empty) {
            return null;
        }
        const latestDoc = querySnapshot.docs[0];
        
        const result = parseQuotationDoc(latestDoc);
        if (result) {
            setCachedQuotation(result);
        }
        return result;

    } catch (serverError: unknown) {
        const err = serverError as { code?: string };
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
): (() => void) | undefined => {
  const ucsCollection = collection(db, UCS_QUOTATION_COLLECTION);
  
  try {
    // Prefer ordering by Firestore timestamp field when available
    const latestByTs = query(ucsCollection, orderBy('timestamp', 'desc'), limit(1));
    const unsubscribe = onSnapshot(latestByTs, (snapshot) => {
      if (snapshot.empty) {
        onChange(null);
        return;
      }

      const latestDoc = snapshot.docs[0];
      const result = parseQuotationDoc(latestDoc);
      if (result) {
        setCachedQuotation(result);
      }
      onChange(result);

    }, (error) => {
      const err = error as { code?: string };
      if (err?.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
          path: ucsCollection.path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      } else {
        console.error('Error subscribing to UCS quotation', error);
      }
      onChange(null); // Notify of error state
    });

    return unsubscribe;
  } catch (error) {
    console.error('Failed to initiate subscription:', error);
    return undefined;
  }
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
    const { calculation: { equivalences: { ucsQuotationValue: _ucsQuotationValue, ucsQuotationDate: _ucsQuotationDate, ...restEquivalences }, ...restCalculation } } = settings;
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
