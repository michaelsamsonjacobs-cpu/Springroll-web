/**
 * Firebase Configuration for Springroll Team
 * 
 * This file contains the Firebase project configuration for authentication.
 * Project: springroll-171de
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDaqDdWnZOeL2MXbc__eUA4dlb1Fs8-na0",
    authDomain: "springroll-171de.firebaseapp.com",
    projectId: "springroll-171de",
    storageBucket: "springroll-171de.firebasestorage.app",
    messagingSenderId: "129903623333",
    appId: "1:129903623333:web:66792cb844c1e50172a14c",
    measurementId: "G-HB5LNCGWGJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth exports
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;

// Firestore export (for whitelist access control)
export const db = getFirestore(app);
