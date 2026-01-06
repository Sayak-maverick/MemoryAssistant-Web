/**
 * firebase.config.ts - Firebase configuration and initialization
 *
 * This file initializes Firebase with your project credentials.
 * These values come from the Firebase Console.
 *
 * SECURITY NOTE:
 * - These values are safe to expose in client-side code
 * - Firebase uses security rules to protect your data
 * - The API key is not a secret - it just identifies your project
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * Firebase Configuration
 * Retrieved from Firebase Console → Project Settings → Your apps → Web app
 */
const firebaseConfig = {
  apiKey: "AIzaSyDKdco1iETIVWpme1WUuvZkXWmPfHxkWis",
  authDomain: "memory-assistant-3c233.firebaseapp.com",
  projectId: "memory-assistant-3c233",
  storageBucket: "memory-assistant-3c233.firebasestorage.app",
  messagingSenderId: "342505346662",
  appId: "1:342505346662:web:b3bda9bfc73ff849367fa7"
};

/**
 * Initialize Firebase
 * This creates a Firebase app instance with your configuration
 */
const app = initializeApp(firebaseConfig);

/**
 * Firebase Services
 *
 * auth - Authentication service (login, signup, logout)
 * db - Firestore database (store item metadata)
 * storage - Cloud Storage (store images and voice notes)
 */
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export the app instance in case we need it
export default app;
