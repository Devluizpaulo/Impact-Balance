"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UCS_FACTORS, UCS_COST_PER_UNIT, GDP_PER_CAPITA_BRAZIL } from '@/lib/constants';

// Define the shape of your settings
export interface SystemSettings {
    ucsFactors: typeof UCS_FACTORS;
    ucsCostPerUnit: number;
    gdpPerCapita: number;
}

// Define the default settings
const defaultSettings: SystemSettings = {
    ucsFactors: UCS_FACTORS,
    ucsCostPerUnit: UCS_COST_PER_UNIT,
    gdpPerCapita: GDP_PER_CAPITA_BRAZIL,
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
                setSettings(prevSettings => ({
                    ...prevSettings,
                    ...parsedSettings,
                    ucsFactors: {
                        ...prevSettings.ucsFactors,
                        ...parsedSettings.ucsFactors,
                    }
                }));
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
