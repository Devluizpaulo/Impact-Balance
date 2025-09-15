"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of your settings
export interface SystemSettings {
    ucsFactors: {
        participants: number;
        durationDays: number;
        venueSizeSqm: number;
        travelKm: number;
        wasteKg: number;
        waterLiters: number;
        energyKwh: number;
    };
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
    ucsCostPerUnit: number;
}

// Define the default settings
const defaultSettings: SystemSettings = {
    ucsFactors: {
        participants: 0.5,
        durationDays: 10,
        venueSizeSqm: 0.1,
        travelKm: 0.2,
        wasteKg: 0.8,
        waterLiters: 0.01,
        energyKwh: 0.3,
    },
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
    ucsCostPerUnit: 15,
};

// Define the shape of the context
interface SettingsContextType {
    settings: SystemSettings;
    setSettings: (settings: SystemSettings) => void;
    saveSettings: () => void;
    resetSettings: () => void;
    isClient: boolean;
}

// Create the context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Helper to deep merge settings
const mergeSettings = (base: SystemSettings, updates: Partial<SystemSettings>): SystemSettings => {
    return {
        ...base,
        ...updates,
        ucsFactors: {
            ...base.ucsFactors,
            ...updates.ucsFactors,
        },
        perCapitaFactors: {
          ...base.perCapitaFactors,
          ...updates.perCapitaFactors,
        },
        equivalences: {
          ...base.equivalences,
          ...updates.equivalences
        }
    };
};


// Create the provider component
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
    const [isClient, setIsClient] = useState(false);

    // Ensure code only runs on the client
    useEffect(() => {
        setIsClient(true);
        try {
            const savedSettings = localStorage.getItem('systemSettings');
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                // Merge saved settings with defaults to avoid missing keys
                setSettings(prevSettings => mergeSettings(prevSettings, parsedSettings));
            }
        } catch (error) {
            console.error("Failed to load settings from localStorage", error);
            setSettings(defaultSettings);
        }
    }, []);

    const saveSettings = () => {
        try {
            localStorage.setItem('systemSettings', JSON.stringify(settings));
            alert('Settings saved!'); // Replace with a toast notification later
        } catch (error) {
            console.error("Failed to save settings to localStorage", error);
            alert('Failed to save settings.');
        }
    };

    const resetSettings = () => {
        localStorage.removeItem('systemSettings');
        setSettings(defaultSettings);
        alert('Settings have been reset to default.');
    };

    return (
        <SettingsContext.Provider value={{ settings, setSettings, saveSettings, resetSettings, isClient }}>
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
