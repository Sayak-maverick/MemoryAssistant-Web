/**
 * auth.service.ts - Authentication service for web app
 *
 * This handles all authentication operations using Firebase Authentication.
 * This is the WEB VERSION of the Android AuthService.kt
 *
 * Key concepts:
 * - async/await: JavaScript's way to handle asynchronous operations
 * - Promise: Represents a future value (like Kotlin's suspend functions)
 * - try/catch: Error handling (like Kotlin's try/catch)
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase.config';

/**
 * AuthService class - manages authentication
 *
 * Unlike Kotlin, this is a plain TypeScript class.
 * We'll export functions instead of a class instance.
 */

/**
 * Sign up a new user with email and password
 *
 * @param email - User's email address
 * @param password - User's password (minimum 6 characters)
 * @returns Promise<User> - The created user
 * @throws Error if signup fails
 *
 * What's a Promise?
 * - Like a "future value" - it will eventually succeed or fail
 * - async/await makes Promises easier to work with
 * - Similar to Kotlin's suspend functions with coroutines
 */
export async function signUp(email: string, password: string): Promise<User> {
  try {
    /**
     * createUserWithEmailAndPassword - Firebase function to create account
     *
     * This is from the Firebase Auth SDK (imported at the top)
     * Returns a UserCredential object with the user
     *
     * await - waits for the Promise to complete
     * Without await, we'd get a Promise instead of the actual result
     */
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Return the user from the credential
    return userCredential.user;
  } catch (error: any) {
    /**
     * Error handling
     *
     * Firebase errors have a 'code' property with specific error types:
     * - auth/email-already-in-use
     * - auth/invalid-email
     * - auth/weak-password
     * etc.
     */
    console.error('Sign up error:', error);

    // Throw a user-friendly error message
    throw new Error(getFriendlyErrorMessage(error.code));
  }
}

/**
 * Sign in an existing user with email and password
 *
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise<User> - The signed-in user
 * @throws Error if signin fails
 */
export async function signIn(email: string, password: string): Promise<User> {
  try {
    /**
     * signInWithEmailAndPassword - Firebase function to log in
     *
     * This:
     * 1. Verifies the email/password combination
     * 2. Creates a session (user stays logged in)
     * 3. Returns the user
     */
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return userCredential.user;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(getFriendlyErrorMessage(error.code));
  }
}

/**
 * Sign out the current user
 *
 * @returns Promise<void> - completes when sign out is done
 */
export async function logOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out');
  }
}

/**
 * Get the currently logged-in user
 *
 * @returns User | null - The current user, or null if not logged in
 *
 * This is synchronous (not async) - it returns immediately
 * auth.currentUser is a property, not a method
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Check if a user is currently logged in
 *
 * @returns boolean - true if logged in, false otherwise
 */
export function isUserLoggedIn(): boolean {
  return auth.currentUser !== null;
}

/**
 * Listen for authentication state changes
 *
 * This is useful in React - we can update our UI when login state changes.
 *
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function - call this to stop listening
 *
 * How this works:
 * - onAuthStateChanged calls your callback whenever auth state changes
 * - When user logs in -> callback is called with the user
 * - When user logs out -> callback is called with null
 * - It also calls on initial load (to check if user is already logged in)
 */
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Convert Firebase error codes to user-friendly messages
 *
 * Firebase gives us error codes like "auth/invalid-email"
 * We convert these to readable messages like "Invalid email address"
 */
function getFriendlyErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    default:
      return 'Authentication failed. Please try again';
  }
}
