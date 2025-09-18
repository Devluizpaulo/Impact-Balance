
"use client";

import type { EventRecord } from './types';

const STORAGE_KEY = 'impactBalanceEvents';

// Function to get all stored events
export const getEvents = (): EventRecord[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const storedEvents = window.localStorage.getItem(STORAGE_KEY);
        if (storedEvents) {
            return JSON.parse(storedEvents) as EventRecord[];
        }
    } catch (error) {
        console.error("Error reading events from localStorage", error);
    }
    return [];
};

// Function to add a new event
export const addEvent = (newEvent: EventRecord): void => {
     if (typeof window === 'undefined') {
        return;
    }
    try {
        const events = getEvents();
        events.unshift(newEvent); // Add new event to the beginning of the array
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
        console.error("Error saving event to localStorage", error);
    }
};
