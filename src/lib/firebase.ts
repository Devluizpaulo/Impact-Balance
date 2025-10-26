
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB3-5OjQnMteTZS-nYaORUI3-dQP19DvSw",
  authDomain: "ucs-index-tracker.firebaseapp.com",
  projectId: "ucs-index-tracker",
  storageBucket: "ucs-index-tracker.firebasestorage.app",
  messagingSenderId: "458013275204",
  appId: "1:458013275204:web:9da7774b1648d15d527811"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
