/**
 * firestoreService.ts - Cloud sync service using Firebase Firestore
 *
 * This service handles:
 * 1. Syncing items to Firestore (cloud storage)
 * 2. Real-time synchronization across devices
 * 3. Offline support with automatic sync when online
 * 4. User-specific data isolation
 *
 * How it works:
 * 1. Each user has their own collection: users/{userId}/items
 * 2. Items are synced to Firestore when created/updated/deleted
 * 3. Changes from other devices are listened to in real-time
 * 4. Firestore handles offline caching automatically
 *
 * Architecture:
 * - Local database (IndexedDB) = Source of truth for UI
 * - Firestore = Cloud backup and sync across devices
 * - Two-way sync: Local changes → Cloud, Cloud changes → Local
 */

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  Unsubscribe,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Item } from '../types/item.types';

/**
 * Get Firestore instance
 */
const firestore = getFirestore();

/**
 * Get Firebase Auth instance
 */
const auth = getAuth();

/**
 * Get current user ID
 * All items are stored under users/{userId}/items/{itemId}
 */
function getUserId(): string | null {
  return auth.currentUser?.uid || null;
}

/**
 * Get reference to user's items collection
 */
function getItemsCollection() {
  const userId = getUserId();
  if (!userId) return null;

  return collection(firestore, 'users', userId, 'items');
}

/**
 * Upload/sync a single item to Firestore
 *
 * This is called when:
 * - User creates a new item
 * - User updates an existing item
 *
 * @param item - The item to sync
 */
export async function syncItemToCloud(item: Item): Promise<void> {
  try {
    const itemsCollection = getItemsCollection();
    if (!itemsCollection) {
      console.warn('Cannot sync: User not logged in');
      return;
    }

    // Create document reference
    const itemDoc = doc(itemsCollection, item.id);

    // Prepare item data for Firestore
    const itemData = {
      id: item.id,
      name: item.name,
      description: item.description || null,
      createdAt: item.createdAt,
      imageUrl: item.imageUrl || null,
      labels: item.labels || [],
      audioUrl: item.audioUrl || null,
      audioTranscription: item.audioTranscription || null,
      latitude: item.latitude !== undefined ? item.latitude : null,
      longitude: item.longitude !== undefined ? item.longitude : null,
      locationName: item.locationName || null,
      updatedAt: Date.now(),  // Track last update
    };

    // Upload to Firestore (creates if not exists, updates if exists)
    await setDoc(itemDoc, itemData);
  } catch (error) {
    console.error('Error syncing item to cloud:', error);
    // Sync will retry when network is available (Firestore handles this automatically)
  }
}

/**
 * Delete an item from Firestore
 *
 * @param itemId - ID of the item to delete
 */
export async function deleteItemFromCloud(itemId: string): Promise<void> {
  try {
    const itemsCollection = getItemsCollection();
    if (!itemsCollection) {
      console.warn('Cannot delete from cloud: User not logged in');
      return;
    }

    const itemDoc = doc(itemsCollection, itemId);
    await deleteDoc(itemDoc);
  } catch (error) {
    console.error('Error deleting item from cloud:', error);
  }
}

/**
 * Listen to real-time changes from Firestore
 *
 * This sets up a listener that calls the callback whenever items change in Firestore.
 * Use this to sync changes from other devices to the local database.
 *
 * @param callback - Function to call when items change
 * @returns Unsubscribe function to stop listening
 */
export function listenToCloudChanges(
  callback: (snapshot: QuerySnapshot<DocumentData> | null) => void
): Unsubscribe | null {
  const itemsCollection = getItemsCollection();

  if (!itemsCollection) {
    console.warn('Cannot listen to cloud changes: User not logged in');
    callback(null);
    return null;
  }

  // Set up real-time listener
  const itemsQuery = query(itemsCollection);

  const unsubscribe = onSnapshot(
    itemsQuery,
    (snapshot) => {
      // Send snapshot to callback
      callback(snapshot);
    },
    (error) => {
      console.error('Error listening to cloud changes:', error);
      // Firestore will automatically retry
    }
  );

  return unsubscribe;
}

/**
 * Sync all local items to cloud
 *
 * This is useful for:
 * - Initial sync after login
 * - Manual sync when user wants to ensure everything is backed up
 *
 * @param items - Array of all local items to sync
 */
export async function syncAllItemsToCloud(items: Item[]): Promise<void> {
  for (const item of items) {
    await syncItemToCloud(item);
  }
}

/**
 * Convert Firestore document to Item
 *
 * @param data - Data from Firestore document
 * @returns Item object or null if conversion fails
 */
export function documentToItem(data: DocumentData): Item | null {
  try {
    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      createdAt: data.createdAt,
      imageUrl: data.imageUrl || undefined,
      labels: data.labels || [],
      audioUrl: data.audioUrl || undefined,
      audioTranscription: data.audioTranscription || undefined,
      latitude: data.latitude !== null && data.latitude !== undefined ? data.latitude : undefined,
      longitude: data.longitude !== null && data.longitude !== undefined ? data.longitude : undefined,
      locationName: data.locationName || undefined,
    };
  } catch (error) {
    console.error('Error converting document to item:', error);
    return null;
  }
}

/**
 * Check if user is logged in
 */
export function isUserLoggedIn(): boolean {
  return auth.currentUser !== null;
}

/**
 * Get current user email
 */
export function getUserEmail(): string | null {
  return auth.currentUser?.email || null;
}
