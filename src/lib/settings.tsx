
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { getSettings as getSettingsFromDb, saveSettings as saveSettingsToDb } from './settings-storage';
import { useAuth } from './auth';

// Define the shape of your settings
export interface SystemSettings {
    calculation: {
        perCapitaFactors: {
          // Base
          averageUcsPerHectare: number;
          perCapitaConsumptionHa: number;
          // Derived
          ucsConsumption73years: number;
          annualUcsConsumption: number;
          dailyUcsConsumption: number;
          hourlyUcsConsumption: number;
        };
        equivalences: {
          // Base
          ucsQuotationValue: number;
          gdpPerCapita: number;
          // Derived
          equivalenceValuePerYear: number;
          gdpPercentage: number;
          equivalenceValuePerDay: number;
          equivalenceValuePerHour: number;
        };
        indirectCosts: {
          ownershipRegistration: number; // This is a percentage
          certificateIssuance: number;
          websitePage: number;
        };
    };
    sealParameters: {
      preservedNativeForestArea: string;
      carbonEmissionAvoided: string;
      storedWood: string;
      faunaSpeciesPreservation: string;
      floraSpeciesPreservation: string;
      hydrologicalFlowPreservation: string;
    };
}

// Define the default settings
export const defaultSettings: SystemSettings = {
    calculation: {
        perCapitaFactors: {
            averageUcsPerHectare: 760,
            perCapitaConsumptionHa: 2.389,
            ucsConsumption73years: 1816,
            annualUcsConsumption: 25,
            dailyUcsConsumption: 0.068,
            hourlyUcsConsumption: 0.003,
        },
        equivalences: {
            ucsQuotationValue: 168.85,
            gdpPerCapita: 99706.20,
            equivalenceValuePerYear: 4199.60,
            gdpPercentage: 4.212,
            equivalenceValuePerDay: 11.51,
            equivalenceValuePerHour: 0.48,
        },
        indirectCosts: {
            ownershipRegistration: 1.5,
            certificateIssuance: 200,
            websitePage: 300,
        },
    },
    sealParameters: {
        preservedNativeForestArea: "",
        carbonEmissionAvoided: "",
        storedWood: "",
        faunaSpeciesPreservation: "",
        floraSpeciesPreservation: "",
        hydrologicalFlowPreservation: "",
    }
};

// Function to calculate derived settings based on base values
const calculateDerivedSettings = (baseSettings: SystemSettings): SystemSettings => {
    const calculated = JSON.parse(JSON.stringify(baseSettings)); // Deep copy
    const { perCapitaFactors, equivalences } = calculated.calculation;

    // Calculate per capita factors
    perCapitaFactors.ucsConsumption73years = perCapitaFactors.averageUcsPerHectare * perCapitaFactors.perCapitaConsumptionHa;
    perCapitaFactors.annualUcsConsumption = perCapitaFactors.ucsConsumption73years / 73;
    perCapitaFactors.dailyUcsConsumption = perCapitaFactors.annualUcsConsumption / 365;
    perCapitaFactors.hourlyUcsConsumption = perCapitaFactors.dailyUcsConsumption / 24;

    // Calculate equivalences
    equivalences.equivalenceValuePerYear = equivalences.ucsQuotationValue * perCapitaFactors.annualUcsConsumption;
    equivalences.gdpPercentage = equivalences.gdpPerCapita > 0 ? (equivalences.equivalenceValuePerYear / equivalences.gdpPerCapita) * 100 : 0;
    equivalences.equivalenceValuePerDay = equivalences.equivalenceValuePerYear / 365;
    equivalences.equivalenceValuePerHour = equivalences.equivalenceValuePerDay / 24;

    return calculated;
};


// Define the shape of the context
interface SettingsContextType {
    settings: SystemSettings;
    setSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
    saveSettings: () => Promise<void>;
    resetSettings: () => Promise<void>;
    isLoading: boolean;
    isSaving: boolean;
}

// Create the context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Create the provider component
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    const { isAdmin } = useAuth();
    const t = useTranslations("ParametersPage.toasts" as any);

    // Recalculate derived values whenever base values change
    const updateAndRecalculate = useCallback((newSettings: SystemSettings) => {
        const recalculatedSettings = calculateDerivedSettings(newSettings);
        setSettings(recalculatedSettings);
    }, []);


    useEffect(() => {
      const loadSettings = async () => {
        setIsLoading(true);
        try {
          const dbSettings = await getSettingsFromDb();
          updateAndRecalculate(dbSettings); // Recalculate on initial load
        } catch (error) {
          console.error("Failed to load settings from Firestore", error);
          toast({
              variant: 'destructive',
              title: t('loadError.title'),
              description: t('loadError.description'),
          });
          updateAndRecalculate(defaultSettings);
        } finally {
          setIsLoading(false);
        }
      };

      loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [t, toast]);


    const saveSettings = async () => {
        if (!isAdmin) {
            toast({ variant: 'destructive', title: t('unauthorized.title') });
            return;
        }
        setIsSaving(true);
        try {
            // Ensure settings are recalculated before saving
            const recalculated = calculateDerivedSettings(settings);
            setSettings(recalculated);
            await saveSettingsToDb(recalculated);
            toast({
                title: t('saveSuccess.title'),
                description: t('saveSuccess.description'),
            });
        } catch (error) {
            console.error("Failed to save settings to Firestore", error);
             toast({
                variant: 'destructive',
                title: t('saveError.title'),
                description: t('saveError.description'),
            });
        } finally {
            setIsSaving(false);
        }
    };

    const resetSettings = async () => {
       if (!isAdmin) {
            toast({ variant: 'destructive', title: t('unauthorized.title') });
            return;
        }
        const recalculatedDefaults = calculateDerivedSettings(defaultSettings);
        setSettings(recalculatedDefaults);
        // Also save the reset state to the database
        await saveSettingsToDb(recalculatedDefaults);
        toast({
            title: t('resetSuccess.title'),
            description: t('resetSuccess.description'),
        });
    };

    return (
        <SettingsContext.Provider value={{ settings, setSettings: updateAndRecalculate, saveSettings, resetSettings, isLoading, isSaving }}>
            {children}
        </SettingsContext.Provider>
    );
};

// Create a custom hook to use the settings context
export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
