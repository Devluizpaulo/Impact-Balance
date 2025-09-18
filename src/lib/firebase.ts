// @ts-nocheck
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    projectId: "studio-1883476079-82252",
    appId: "1:368517440743:web:2a23876c670fddbe752e42",
    storageBucket: "studio-1883476079-82252.firebasestorage.app",
    apiKey: "AIzaSyC42xublr7toaWahYmv26Blf_7TR2T63yM",
    authDomain: "studio-1883476079-82252.firebaseapp.com",
    messagingSenderId: "368517440743",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
