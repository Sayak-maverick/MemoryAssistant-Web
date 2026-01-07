/**
 * App.tsx - The root component of our React application
 *
 * This is similar to MainActivity.kt in Android - it's the entry point.
 *
 * What's new in Step 4:
 * 1. Added IndexedDB for local storage
 * 2. Items now persist across browser sessions
 * 3. Data loads from local database
 * 4. Automatic dummy data insertion on first load
 */

import React, { useState, useEffect } from 'react';
import { Item } from './types/item.types';
import ItemCard from './components/ItemCard/ItemCard';
import LoginPage from './pages/LoginPage/LoginPage';
import AddEditItemModal from './components/AddEditItemModal/AddEditItemModal';
import { onAuthStateChange, logOut, isUserLoggedIn } from './services/auth.service';
import { getAllItems, insertDummyData } from './database/db';
import './App.css';

/**
 * App Component - Main app with authentication
 *
 * This manages the authentication flow:
 * - Shows LoginPage when user is not logged in
 * - Shows Home screen when user is logged in
 *
 * Similar to AuthenticationFlow in MainActivity.kt
 */
function App() {
  /**
   * STATE: Track if user is logged in
   *
   * useState - React hook to manage state
   * Initialize with current auth state from Firebase
   */
  const [isLoggedIn, setIsLoggedIn] = useState(isUserLoggedIn());

  /**
   * useEffect - React hook for side effects
   *
   * This is like a "lifecycle method" - runs when component mounts.
   *
   * What this does:
   * 1. Subscribe to auth state changes (login/logout events)
   * 2. Update isLoggedIn when auth state changes
   * 3. Cleanup when component unmounts
   *
   * Similar to LaunchedEffect in Jetpack Compose
   */
  useEffect(() => {
    /**
     * Listen for auth state changes
     *
     * onAuthStateChange calls our callback whenever:
     * - User logs in
     * - User logs out
     * - Component first loads (to check existing session)
     */
    const unsubscribe = onAuthStateChange((user) => {
      // user is not null if logged in, null if logged out
      setIsLoggedIn(user !== null);
    });

    /**
     * Cleanup function
     *
     * When component unmounts, stop listening to auth changes
     * This prevents memory leaks
     */
    return () => unsubscribe();
  }, []); // Empty array = run only once on mount

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    try {
      await logOut();
      // isLoggedIn will be updated by onAuthStateChange
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  /**
   * CONDITIONAL RENDERING
   *
   * Show different screens based on login state
   * Similar to if/else in AuthenticationFlow (Android)
   */
  if (!isLoggedIn) {
    // Not logged in - show login page
    return (
      <LoginPage
        onLoginSuccess={() => {
          // onAuthStateChange will handle updating isLoggedIn
          // but we can also update it here for immediate feedback
          setIsLoggedIn(true);
        }}
      />
    );
  }

  // Logged in - show home screen with items
  return <HomeScreen onLogout={handleLogout} />;
}

/**
 * HomeScreen - The main screen showing all items
 *
 * NOW USING INDEXEDDB!
 * - Items are loaded from the browser's local database
 * - Data persists across browser sessions
 * - Works offline
 */
function HomeScreen({ onLogout }: { onLogout: () => void }) {
  /**
   * State for storing items from database
   *
   * useState - React hook to manage state
   * Initially empty array, will be populated from database
   */
  const [items, setItems] = useState<Item[]>([]);

  /**
   * State for loading indicator
   */
  const [isLoading, setIsLoading] = useState(true);

  /**
   * State for Add/Edit modal
   *
   * null = modal closed
   * "add" = add new item
   * itemId = edit that item
   */
  const [modalState, setModalState] = useState<string | null>(null);

  /**
   * Load items from IndexedDB on component mount
   *
   * useEffect - runs when component first loads
   * Similar to LaunchedEffect in Jetpack Compose
   */
  useEffect(() => {
    /**
     * Async function to load items
     *
     * We need async/await because database operations are asynchronous
     */
    async function loadItems() {
      try {
        // Get all items from IndexedDB
        const itemsFromDB = await getAllItems();

        // If database is empty, insert dummy data
        if (itemsFromDB.length === 0) {
          await insertDummyData();
          // Reload items after inserting dummy data
          const newItems = await getAllItems();
          setItems(newItems);
        } else {
          // Use existing items
          setItems(itemsFromDB);
        }
      } catch (error) {
        console.error('Error loading items:', error);
      } finally {
        // Stop loading indicator
        setIsLoading(false);
      }
    }

    // Call the async function
    loadItems();
  }, []); // Empty array = run only once on mount

  /**
   * Refresh items from database
   */
  const refreshItems = async () => {
    const itemsFromDB = await getAllItems();
    setItems(itemsFromDB);
  };

  return (
    <>
      <div className="App">
        {/* Header bar with logout button */}
        <header className="App-header">
          <h1 className="App-header-title">Memory Assistant</h1>
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        </header>

        {/* Main content area */}
        <main className="App-main">
          {isLoading ? (
            // Show loading message
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Loading items...
            </div>
          ) : items.length === 0 ? (
            // Show empty state
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              No items yet. Add your first item!
            </div>
          ) : (
            // Show items
            items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => {
                  // Open edit modal
                  setModalState(item.id);
                }}
              />
            ))
          )}
        </main>

        {/* Floating Action Button */}
        <button
          className="fab"
          onClick={() => setModalState('add')}
          title="Add Item"
        >
          +
        </button>
      </div>

      {/* Add/Edit Modal */}
      <AddEditItemModal
        isOpen={modalState !== null}
        itemId={modalState === 'add' ? undefined : modalState || undefined}
        onClose={() => setModalState(null)}
        onSaved={() => {
          refreshItems();
          setModalState(null);
        }}
      />
    </>
  );
}

/**
 * NOTE: getDummyItems() has been removed!
 *
 * We now use IndexedDB with insertDummyData() from db.ts
 * The data is stored in the browser's database and persists across sessions
 */

// Export the component so index.tsx can use it
export default App;
