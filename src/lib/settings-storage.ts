
"use client";

import { db } from './firebase/config';
import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import type { SystemSettings } from './settings';
import { defaultSettings } from './settings';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const SETTINGS_COLLECTION = 'impact-balance-settings';
const SETTINGS_DOC_ID = 'default';
const UCS_QUOTATION_COLLECTION = 'ucs_ase';


// Function to get the latest UCS quotation from Firestore
export const getLatestUcsQuotation = async (): Promise<number | null> => {
    const ucsCollection = collection(db, UCS_QUOTATION_COLLECTION);
    const q = query(ucsCollection, orderBy('documentId', 'desc'), limit(1));

    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const latestDoc = querySnapshot.docs[0].data();
            return latestDoc.resultado_final_brl || null;
        }
        return null;
    } catch (serverError: any) {
        if (serverError.code === 'permission-denied') {
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
    } catch (serverError: any) {
        if (serverError.code === 'permission-denied') {
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
    const { calculation: { equivalences: { ucsQuotationValue, ...restEquivalences }, ...restCalculation } } = settings;
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
