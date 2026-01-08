/**
 * db.ts - IndexedDB database setup for web app
 *
 * IndexedDB - Browser's local database (like SQLite for web)
 * - Stores data locally in the user's browser
 * - Data persists across browser sessions
 * - Works offline
 * - Can store large amounts of structured data
 *
 * idb library - A Promise-based wrapper around IndexedDB
 * - Makes IndexedDB easier to use (native API is callback-based)
 * - Similar to how Room makes SQLite easier on Android
 *
 * This is the WEB VERSION of Room Database (Android)
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Item } from '../types/item.types';
import { syncItemToCloud, deleteItemFromCloud } from '../services/firestoreService';

/**
 * Define the database schema
 *
 * This is like @Database annotation in Room
 * It defines what tables (object stores) exist and their structure
 */
interface MemoryAssistantDB extends DBSchema {
  /**
   * items - Object store (like a table in SQL)
   *
   * key: string - Primary key type (the item's id)
   * value: Item - What we store in each row
   */
  items: {
    key: string;  // Primary key (item.id)
    value: Item;  // The item object
    indexes: {
      'by-createdAt': number;  // Index for sorting by creation date
      'by-name': string;        // Index for searching by name
    };
  };
}

/**
 * Database name and version
 *
 * Similar to Room's @Database(version = 1)
 */
const DB_NAME = 'memory-assistant-db';
const DB_VERSION = 1;

/**
 * Initialize and open the database
 *
 * This function:
 * 1. Opens the database (creates it if it doesn't exist)
 * 2. Sets up the schema (object stores and indexes)
 * 3. Returns a database instance
 *
 * Similar to AppDatabase.getDatabase() in Android
 */
export async function initDB(): Promise<IDBPDatabase<MemoryAssistantDB>> {
  return openDB<MemoryAssistantDB>(DB_NAME, DB_VERSION, {
    /**
     * upgrade - Called when database is created or version changes
     *
     * This is like Room migrations
     * Here we define the database structure
     */
    upgrade(db) {
      /**
       * Create 'items' object store if it doesn't exist
       *
       * keyPath: 'id' - Use the 'id' property as the primary key
       * This is like @PrimaryKey in Room
       */
      if (!db.objectStoreNames.contains('items')) {
        const itemStore = db.createObjectStore('items', {
          keyPath: 'id',  // Primary key
        });

        /**
         * Create indexes for efficient querying
         *
         * Indexes are like database indexes - they speed up searches
         * Similar to @Query with ORDER BY or WHERE clauses
         */

        // Index for sorting by creation date (newest first)
        itemStore.createIndex('by-createdAt', 'createdAt');

        // Index for searching by name
        itemStore.createIndex('by-name', 'name');
      }
    },
  });
}

/**
 * Get the database instance
 *
 * We initialize it lazily (only when needed)
 */
let dbInstance: IDBPDatabase<MemoryAssistantDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<MemoryAssistantDB>> {
  if (!dbInstance) {
    dbInstance = await initDB();
  }
  return dbInstance;
}

/**
 * DATABASE OPERATIONS
 *
 * These are like DAO methods in Room
 * Each function performs a specific database operation
 */

/**
 * Get all items, sorted by creation date (newest first)
 *
 * Similar to ItemDao.getAllItems() in Android
 */
export async function getAllItems(): Promise<Item[]> {
  const db = await getDB();

  /**
   * Get all items from the 'items' object store
   *
   * db.getAll() - gets all records
   * We'll sort them by createdAt using the index
   */
  const items = await db.getAllFromIndex('items', 'by-createdAt');

  // Reverse to get newest first (index returns oldest first)
  return items.reverse();
}

/**
 * Get a single item by ID
 *
 * @param id - The item's unique identifier
 * @returns Item or undefined if not found
 *
 * Similar to ItemDao.getItemById() in Android
 */
export async function getItemById(id: string): Promise<Item | undefined> {
  const db = await getDB();
  return db.get('items', id);
}

/**
 * Add a new item to the database
 *
 * @param item - The item to add
 *
 * Similar to ItemDao.insertItem() in Android
 */
export async function addItem(item: Item): Promise<void> {
  const db = await getDB();

  /**
   * put() - adds or updates an item
   *
   * If an item with this ID exists, it will be replaced
   * If not, it will be created
   *
   * This is like @Insert(onConflict = OnConflictStrategy.REPLACE) in Room
   */
  await db.put('items', item);

  // Sync to cloud (Step 10: Cloud Sync)
  await syncItemToCloud(item);
}

/**
 * Add multiple items at once
 *
 * @param items - Array of items to add
 *
 * Similar to ItemDao.insertAll() in Android
 */
export async function addItems(items: Item[]): Promise<void> {
  const db = await getDB();

  /**
   * Use a transaction for bulk operations
   *
   * Transactions ensure all operations succeed or all fail
   * This is more efficient than individual operations
   */
  const tx = db.transaction('items', 'readwrite');

  // Add each item
  await Promise.all(items.map((item) => tx.store.put(item)));

  // Wait for transaction to complete
  await tx.done;
}

/**
 * Update an existing item
 *
 * @param item - The item with updated data
 *
 * Similar to ItemDao.updateItem() in Android
 */
export async function updateItem(item: Item): Promise<void> {
  const db = await getDB();
  // put() updates if ID exists, creates if not
  await db.put('items', item);

  // Sync to cloud (Step 10: Cloud Sync)
  await syncItemToCloud(item);
}

/**
 * Delete an item from the database
 *
 * @param id - The ID of the item to delete
 *
 * Similar to ItemDao.deleteItemById() in Android
 */
export async function deleteItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('items', id);

  // Delete from cloud (Step 10: Cloud Sync)
  await deleteItemFromCloud(id);
}

/**
 * Delete all items (clear the database)
 *
 * Similar to ItemDao.deleteAllItems() in Android
 */
export async function deleteAllItems(): Promise<void> {
  const db = await getDB();
  await db.clear('items');
}

/**
 * Search items by name or description
 *
 * @param query - The search text
 * @returns Array of matching items
 *
 * Similar to ItemDao.searchItems() in Android
 */
export async function searchItems(query: string): Promise<Item[]> {
  const db = await getDB();
  const allItems = await getAllItems();

  // Filter items where name or description contains the query
  const lowerQuery = query.toLowerCase();
  return allItems.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerQuery) ||
      (item.description && item.description.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get items with a specific label
 *
 * @param label - The label to filter by
 * @returns Array of items with this label
 *
 * Similar to ItemDao.getItemsByLabel() in Android
 */
export async function getItemsByLabel(label: string): Promise<Item[]> {
  const db = await getDB();
  const allItems = await getAllItems();

  // Filter items that have this label
  return allItems.filter((item) => item.labels.includes(label));
}

/**
 * Insert dummy data for testing
 *
 * Similar to ItemRepository.insertDummyData() in Android
 */
export async function insertDummyData(): Promise<void> {
  const now = Date.now();

  const dummyItems: Item[] = [
    {
      id: crypto.randomUUID(),
      name: 'Car Keys',
      description: 'Toyota keys with red keychain',
      createdAt: now - 3600000,  // 1 hour ago
      labels: ['important', 'daily'],
    },
    {
      id: crypto.randomUUID(),
      name: 'Wallet',
      description: 'Brown leather wallet with credit cards',
      createdAt: now - 7200000,  // 2 hours ago
      labels: ['important'],
    },
    {
      id: crypto.randomUUID(),
      name: 'Reading Glasses',
      description: 'Black frame reading glasses',
      createdAt: now - 86400000,  // 1 day ago
      labels: ['daily'],
    },
    {
      id: crypto.randomUUID(),
      name: 'Phone Charger',
      description: 'USB-C white charger cable',
      createdAt: now - 172800000,  // 2 days ago
      labels: [],
    },
    {
      id: crypto.randomUUID(),
      name: 'Headphones',
      description: 'Sony wireless headphones',
      createdAt: now - 259200000,  // 3 days ago
      labels: ['electronics'],
    },
    {
      id: crypto.randomUUID(),
      name: 'House Keys',
      description: 'Spare keys with blue keychain',
      createdAt: now - 604800000,  // 1 week ago
      labels: ['important', 'backup'],
    },
    {
      id: crypto.randomUUID(),
      name: 'Work Badge',
      description: 'Office access card',
      createdAt: now - 1209600000,  // 2 weeks ago
      labels: ['work', 'important'],
    },
    {
      id: crypto.randomUUID(),
      name: 'Backpack',
      description: 'Black Nike backpack',
      createdAt: now - 1814400000,  // 3 weeks ago
      labels: [],
    },
  ];

  await addItems(dummyItems);
}
