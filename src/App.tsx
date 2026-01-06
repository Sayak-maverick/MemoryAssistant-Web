/**
 * App.tsx - The root component of our React application
 *
 * This is similar to MainActivity.kt in Android - it's the entry point.
 *
 * What's new in Step 3:
 * 1. Added authentication flow (login/logout)
 * 2. Show LoginPage when not authenticated
 * 3. Show Home with items when authenticated
 * 4. Use useEffect + onAuthStateChange to track login state
 */

import React, { useState, useEffect } from 'react';
import { Item } from './types/item.types';
import ItemCard from './components/ItemCard/ItemCard';
import LoginPage from './pages/LoginPage/LoginPage';
import { onAuthStateChange, logOut, isUserLoggedIn } from './services/auth.service';
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
 * This is extracted from the original App component
 * Now it takes onLogout as a prop
 */
function HomeScreen({ onLogout }: { onLogout: () => void }) {
  /**
   * Get dummy items (hardcoded data)
   * Later in Step 4, this will come from IndexedDB
   */
  const items = getDummyItems();

  return (
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
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onClick={() => {
              console.log('Clicked item:', item.name);
            }}
          />
        ))}
      </main>
    </div>
  );
}

/**
 * getDummyItems - Returns hardcoded sample items
 *
 * This matches the Android getDummyItems() function exactly!
 * Same data, same structure, same timestamps.
 */
function getDummyItems(): Item[] {
  const now = Date.now();

  return [
    {
      id: '1',
      name: 'Car Keys',
      description: 'Toyota keys with red keychain',
      createdAt: now - 3600000,  // 1 hour ago
      labels: ['important', 'daily']
    },
    {
      id: '2',
      name: 'Wallet',
      description: 'Brown leather wallet with credit cards',
      createdAt: now - 7200000,  // 2 hours ago
      labels: ['important']
    },
    {
      id: '3',
      name: 'Reading Glasses',
      description: 'Black frame reading glasses',
      createdAt: now - 86400000,  // 1 day ago
      labels: ['daily']
    },
    {
      id: '4',
      name: 'Phone Charger',
      description: 'USB-C white charger cable',
      createdAt: now - 172800000,  // 2 days ago
      labels: []
    },
    {
      id: '5',
      name: 'Headphones',
      description: 'Sony wireless headphones',
      createdAt: now - 259200000,  // 3 days ago
      labels: ['electronics']
    },
    {
      id: '6',
      name: 'House Keys',
      description: 'Spare keys with blue keychain',
      createdAt: now - 604800000,  // 1 week ago
      labels: ['important', 'backup']
    },
    {
      id: '7',
      name: 'Work Badge',
      description: 'Office access card',
      createdAt: now - 1209600000,  // 2 weeks ago
      labels: ['work', 'important']
    },
    {
      id: '8',
      name: 'Backpack',
      description: 'Black Nike backpack',
      createdAt: now - 1814400000,  // 3 weeks ago
      labels: []
    }
  ];
}

// Export the component so index.tsx can use it
export default App;
