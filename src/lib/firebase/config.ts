
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "studio-1883476079-82252",
  appId: "1:368517440743:web:2a23876c670fddbe752e42",
  storageBucket: "studio-1883476079-82252.firebasestorage.app",
  apiKey: "AIzaSyC42xublr7toaWahYmv26Blf_7TR2T63yM",
  authDomain: "studio-1883476079-82252.firebaseapp.com",
  messagingSenderId: "368517440743"
};


// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
