
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { getSettings as getSettingsFromDb, saveSettings as saveSettingsToDb } from './settings-storage';
import { useAuth } from './auth';

// Define the shape of your settings
export interface SystemSettings {
    perCapitaFactors: {
      averageUcsPerHectare: number;
      perCapitaConsumptionHa: number;
      ucsConsumption73years: number;
      annualUcsConsumption: number;
      dailyUcsConsumption: number;
      hourlyUcsConsumption: number;
    };
    equivalences: {
      ucsQuotationValue: number;
      gdpPerCapita: number;
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
    perCapitaFactors: {
      averageUcsPerHectare: 0,
      perCapitaConsumptionHa: 0,
      ucsConsumption73years: 0,
      annualUcsConsumption: 0,
      dailyUcsConsumption: 0,
      hourlyUcsConsumption: 0,
    },
    equivalences: {
      ucsQuotationValue: 0,
      gdpPerCapita: 0,
      equivalenceValuePerYear: 0,
      gdpPercentage: 0,
      equivalenceValuePerDay: 0,
      equivalenceValuePerHour: 0,
    },
    indirectCosts: {
      ownershipRegistration: 0,
      certificateIssuance: 0,
      websitePage: 0,
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

// Define the shape of the context
interface SettingsContextType {
    settings: SystemSettings;
    setSettings: (settings: SystemSettings) => void;
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

    useEffect(() => {
      const loadSettings = async () => {
        setIsLoading(true);
        try {
          const dbSettings = await getSettingsFromDb();
          setSettings(dbSettings);
        } catch (error) {
          console.error("Failed to load settings from Firestore", error);
          toast({
              variant: 'destructive',
              title: t('loadError.title'),
              description: t('loadError.description'),
          });
        } finally {
          setIsLoading(false);
        }
      };

      loadSettings();
    }, [t]);


    const saveSettings = async () => {
        if (!isAdmin) {
            toast({ variant: 'destructive', title: t('unauthorized.title') });
            return;
        }
        setIsSaving(true);
        try {
            await saveSettingsToDb(settings);
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
        setSettings(defaultSettings);
        // Also save the reset state to the database
        await saveSettingsToDb(defaultSettings);
        toast({
            title: t('resetSuccess.title'),
            description: t('resetSuccess.description'),
        });
    };

    return (
        <SettingsContext.Provider value={{ settings, setSettings, saveSettings, resetSettings, isLoading, isSaving }}>
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
