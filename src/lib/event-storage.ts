
"use client";

import { db } from './firebase/config';
import { collection, addDoc, getDocs, query, orderBy, getDocsFromCache } from 'firebase/firestore';
import type { EventRecord } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const EVENTS_COLLECTION = 'impact-balance-events';

// Function to get all stored events from Firestore
export const getEvents = async (): Promise<EventRecord[]> => {
    const eventsCollection = collection(db, EVENTS_COLLECTION);
    const q = query(eventsCollection, orderBy('timestamp', 'desc'));
    
    try {
        const querySnapshot = await getDocs(q);
        const events: EventRecord[] = [];
        querySnapshot.forEach((doc) => {
            events.push({ id: doc.id, ...doc.data() } as EventRecord);
        });
        return events;
    } catch (serverError: any) {
        if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: eventsCollection.path,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            console.error("Error reading events from Firestore", serverError);
        }
        return [];
    }
};

// Function to add a new event to Firestore
export const addEvent = (newEvent: Omit<EventRecord, 'id'>) => {
    const eventsCollection = collection(db, EVENTS_COLLECTION);
    
    addDoc(eventsCollection, newEvent).catch(async (serverError) => {
        if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: `${eventsCollection.path}/{newEventId}`,
                operation: 'create',
                requestResourceData: newEvent,
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
             console.error("Error saving event to Firestore", serverError);
        }
    });
};
