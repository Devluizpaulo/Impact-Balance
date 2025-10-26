
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { getSettings as getSettingsFromDb, saveSettings as saveSettingsToDb, getLatestUcsQuotation, subscribeLatestUcsQuotation } from './settings-storage';
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
          ucsQuotationDate: string | null;
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
        benefits: {
            preservedNativeForestArea: number; // m² per UCS
            carbonEmissionAvoided: number; // tCO2e per UCS
            storedWood: number; // m³ per UCS
            faunaSpeciesPreservation: number; // species per Ha per UCS
            floraSpeciesPreservation: number; // species per Ha per UCS
            hydrologicalFlowPreservation: number; // Liters/Year per UCS
        };
    };
}

// Define the default settings
export const defaultSettings: SystemSettings = {
    calculation: {
        perCapitaFactors: {
            averageUcsPerHectare: 760,
            perCapitaConsumptionHa: 2.389,
            ucsConsumption73years: 0, // Calculated
            annualUcsConsumption: 0, // Calculated
            dailyUcsConsumption: 0, // Calculated
            hourlyUcsConsumption: 0, // Calculated
        },
        equivalences: {
            ucsQuotationValue: 168.85,
            ucsQuotationDate: null,
            gdpPerCapita: 99706.20,
            equivalenceValuePerYear: 0, // Calculated
            gdpPercentage: 0, // Calculated
            equivalenceValuePerDay: 0, // Calculated
            equivalenceValuePerHour: 0, // Calculated
        },
        indirectCosts: {
            ownershipRegistration: 1.5,
            certificateIssuance: 200,
            websitePage: 300,
        },
        benefits: {
            preservedNativeForestArea: 13.16,
            carbonEmissionAvoided: 1,
            storedWood: 0.34,
            faunaSpeciesPreservation: 1749,
            floraSpeciesPreservation: 546,
            hydrologicalFlowPreservation: 10503.36,
        }
    },
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
    setSettings: (newSettings: SystemSettings) => void;
    saveSettings: () => Promise<void>;
    resetSettings: () => Promise<void>;
    isLoading: boolean;
    isSaving: boolean;
}

// Create the context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Create the provider component
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettings] = useState<SystemSettings>(() => calculateDerivedSettings(defaultSettings));
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    const { isAdmin } = useAuth();
    const t = useTranslations("ParametersPage.toasts" as const);

    // This function will receive the new base settings and will trigger a recalculation.
    const updateAndRecalculate = useCallback((newBaseSettings: SystemSettings) => {
        const recalculatedSettings = calculateDerivedSettings(newBaseSettings);
        setSettings(recalculatedSettings);
    }, []);


    useEffect(() => {
      const loadSettings = async () => {
        setIsLoading(true);
        try {
            const dbSettings = await getSettingsFromDb();
            const latestQuotationData = await getLatestUcsQuotation();

            if (latestQuotationData) {
                dbSettings.calculation.equivalences.ucsQuotationValue = latestQuotationData.value;
                dbSettings.calculation.equivalences.ucsQuotationDate = latestQuotationData.date;
                 toast({
                    title: t('loadQuotationSuccess.title'),
                    description: t('loadQuotationSuccess.description', { value: latestQuotationData.value }),
                });
            } else {
                 // Fallback: if DB has 0 or invalid quotation value, use default value to avoid zeroing costs
                 if (!(dbSettings.calculation.equivalences.ucsQuotationValue > 0)) {
                   dbSettings.calculation.equivalences.ucsQuotationValue = defaultSettings.calculation.equivalences.ucsQuotationValue;
                   dbSettings.calculation.equivalences.ucsQuotationDate = null;
                 }
                 toast({
                    variant: 'destructive',
                    title: t('loadQuotationError.title'),
                    description: t('loadQuotationError.description'),
                });
            }
            updateAndRecalculate(dbSettings);
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
      // Subscribe for daily quotation updates in real time
      const unsubscribe = subscribeLatestUcsQuotation((data) => {
        if (!data) return;
        // Update only if changed
        setSettings((prev) => {
          const next = JSON.parse(JSON.stringify(prev)) as SystemSettings;
          if (next.calculation.equivalences.ucsQuotationDate === data.date && next.calculation.equivalences.ucsQuotationValue === data.value) {
            return prev;
          }
          next.calculation.equivalences.ucsQuotationValue = data.value;
          next.calculation.equivalences.ucsQuotationDate = data.date;
          toast({
            title: t('loadQuotationSuccess.title'),
            description: t('loadQuotationSuccess.description', { value: data.value }),
          });
          return calculateDerivedSettings(next);
        });
      });

      return () => {
        unsubscribe?.();
      };
    }, [t, toast, updateAndRecalculate]);


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
