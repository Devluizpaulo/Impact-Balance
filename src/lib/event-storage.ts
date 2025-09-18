
"use client";

import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import type { EventRecord } from './types';

const EVENTS_COLLECTION = 'events';

// Function to get all stored events from Firestore
export const getEvents = async (): Promise<EventRecord[]> => {
    try {
        const eventsCollection = collection(db, EVENTS_COLLECTION);
        const q = query(eventsCollection, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const events: EventRecord[] = [];
        querySnapshot.forEach((doc) => {
            events.push({ id: doc.id, ...doc.data() } as EventRecord);
        });
        return events;
    } catch (error) {
        console.error("Error reading events from Firestore", error);
        return [];
    }
};

// Function to add a new event to Firestore
export const addEvent = async (newEvent: Omit<EventRecord, 'id'>): Promise<void> => {
    try {
        const eventsCollection = collection(db, EVENTS_COLLECTION);
        await addDoc(eventsCollection, newEvent);
    } catch (error) {
        console.error("Error saving event to Firestore", error);
    }
};
