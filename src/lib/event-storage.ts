
"use client";

import { db } from './firebase/config';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { EventRecord, NewEventRecord, ClientData, FormData } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const EVENTS_COLLECTION = 'impact-balance-events';
const CLIENTS_COLLECTION = 'impact-balance-clients';

// --- CLIENTS ---

export const getClients = async (): Promise<(ClientData & { id: string })[]> => {
    const clientsCollection = collection(db, CLIENTS_COLLECTION);
    try {
        const querySnapshot = await getDocs(clientsCollection);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClientData & { id: string }));
    } catch (serverError: unknown) {
        const err = serverError as { code?: string };
        if (err?.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: clientsCollection.path,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            console.error("Error reading clients from Firestore", serverError);
        }
        return [];
    }
};

export const addClient = (newClient: ClientData) => {
     const clientsCollection = collection(db, CLIENTS_COLLECTION);
     addDoc(clientsCollection, newClient).catch(async (serverError) => {
        const err = serverError as { code?: string };
        if (err?.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: `${clientsCollection.path}/{newClientId}`,
                operation: 'create',
                requestResourceData: newClient,
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
             console.error("Error saving client to Firestore", serverError);
        }
    });
};


// --- EVENTS / SEALS ---

// Function to get all stored events from Firestore
export const getEvents = async (): Promise<EventRecord[]> => {
    const eventsCollection = collection(db, EVENTS_COLLECTION);
    const q = query(eventsCollection, orderBy('timestamp', 'desc'));
    
    try {
        const querySnapshot = await getDocs(q);
        const events: EventRecord[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Ensure results object exists and has a totalParticipants field for filtering
            if (!data.results) {
                data.results = { totalParticipants: 0 };
            } else if (data.results.totalParticipants === undefined) {
                data.results.totalParticipants = 0;
            }
            events.push({ id: doc.id, ...data } as EventRecord);
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
export const addEvent = (newEvent: NewEventRecord, eventTimestamp?: number) => {
    const eventsCollection = collection(db, EVENTS_COLLECTION);
    
    const payload: Omit<EventRecord, 'id'> = {
        timestamp: eventTimestamp || Date.now(),
        archived: false,
        ...newEvent,
    };

    addDoc(eventsCollection, payload).catch(async (serverError) => {
        const err = serverError as { code?: string };
        if (err?.code === 'permission-denied') {
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

// Function to update partial data of an event/seal
export const updateEvent = (eventId: string, dataToUpdate: Partial<FormData>): Promise<void> => {
    const eventDoc = doc(db, EVENTS_COLLECTION, eventId);
    
    const updatePayload: Record<string, unknown> = {};
    for (const key in dataToUpdate) {
        updatePayload[`formData.${key}`] = dataToUpdate[key as keyof typeof dataToUpdate];
    }
    
    return updateDoc(eventDoc, updatePayload);
};

// Function to archive an event
export const archiveEvent = (eventId: string): Promise<void> => {
    const eventDoc = doc(db, EVENTS_COLLECTION, eventId);
    return updateDoc(eventDoc, { archived: true });
};

// Function to unarchive an event
export const unarchiveEvent = (eventId: string): Promise<void> => {
    const eventDoc = doc(db, EVENTS_COLLECTION, eventId);
    return updateDoc(eventDoc, { archived: false });
};


// Function to delete an event
export const deleteEvent = (eventId: string): Promise<void> => {
    const eventDoc = doc(db, EVENTS_COLLECTION, eventId);
    return deleteDoc(eventDoc);
};

    