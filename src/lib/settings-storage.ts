
"use client";

import { db } from './firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { SystemSettings } from './settings';
import { defaultSettings } from './settings';

const SETTINGS_COLLECTION = 'systemSettings';
const SETTINGS_DOC_ID = 'default';

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
    try {
        const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // Merge fetched data with defaults to ensure all keys are present
            return mergeWithDefault(docSnap.data() as Partial<SystemSettings>);
        } else {
            // If no settings document exists, create one with default values
            await setDoc(docRef, defaultSettings);
            return defaultSettings;
        }
    } catch (error) {
        console.error("Error reading settings from Firestore", error);
        // Fallback to default settings in case of an error
        return defaultSettings;
    }
};

// Function to save settings to Firestore
export const saveSettings = async (settings: SystemSettings): Promise<void> => {
    try {
        const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
        await setDoc(docRef, settings, { merge: true }); // Use merge to avoid overwriting with partial data
    } catch (error) {
        console.error("Error saving settings to Firestore", error);
        // Re-throw the error to be handled by the caller
        throw error;
    }
};
