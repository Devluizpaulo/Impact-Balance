
"use client";

import { db } from './firebase/config';
import { collection, addDoc, getDocs, query, orderBy, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { EventRecord, NewEventRecord } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const EVENTS_COLLECTION = 'impact-balance-events';

// Function to get all stored events from Firestore
export const getEvents = async (): Promise<EventRecord[]> => {
    const eventsCollection = collection(db, EVENTS_COLLECTION);
    // Use '==' for equality filter, which is more efficient and doesn't require a composite index for this query.
    const q = query(eventsCollection, where('archived', '==', false), orderBy('timestamp', 'desc'));
    
    try {
        const querySnapshot = await getDocs(q);
        const events: EventRecord[] = [];
        querySnapshot.forEach((doc) => {
            events.push({ id: doc.id, ...doc.data() } as EventRecord);
        });
        return events;
    } catch (serverError: unknown) {
        const err = serverError as { code?: string };
        if (err?.code === 'permission-denied') {
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
export const addEvent = (newEvent: NewEventRecord) => {
    const eventsCollection = collection(db, EVENTS_COLLECTION);
    
    const payload: Omit<EventRecord, 'id'> = {
        timestamp: Date.now(),
        archived: false,
        ...newEvent,
    };

    addDoc(eventsCollection, payload).catch(async (serverError) => {
        if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: `${eventsCollection.path}/{newEventId}`,
                operation: 'create',
                requestResourceData: payload,
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
             console.error("Error saving event to Firestore", serverError);
        }
    });
};

// Function to archive an event
export const archiveEvent = (eventId: string): Promise<void> => {
    const eventDoc = doc(db, EVENTS_COLLECTION, eventId);
    return updateDoc(eventDoc, { archived: true });
};

// Function to delete an event
export const deleteEvent = (eventId: string): Promise<void> => {
    const eventDoc = doc(db, EVENTS_COLLECTION, eventId);
    return deleteDoc(eventDoc);
};
