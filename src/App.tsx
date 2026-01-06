/**
 * App.tsx - The root component of our React application
 *
 * This is similar to MainActivity.kt in Android - it's the entry point.
 * Now showing a list of items instead of Hello World!
 *
 * What's new in Step 2:
 * 1. Import Item type and ItemCard component
 * 2. Create dummy data (like getDummyItems() in Android)
 * 3. Use map() to render a list of ItemCards
 * 4. Add a header bar (like TopAppBar in Android)
 */

import React from 'react';
import { Item } from './types/item.types';
import ItemCard from './components/ItemCard/ItemCard';
import './App.css';

/**
 * App Component - Now shows a list of items
 *
 * @returns JSX element with item list
 */
function App() {
  /**
   * Get dummy items (hardcoded data)
   * Later in Step 4, this will come from IndexedDB
   */
  const items = getDummyItems();

  return (
    <div className="App">
      {/* Header bar (like TopAppBar in Android) */}
      <header className="App-header">
        <h1 className="App-header-title">Memory Assistant</h1>
      </header>

      {/* Main content area */}
      <main className="App-main">
        {/**
         * Render list of items using map()
         *
         * map() is like items() in LazyColumn (Android)
         * For each item in the array, create an ItemCard
         *
         * key={item.id} - React needs unique keys for list items
         * This helps React efficiently update the list
         */}
        {items.map((item) => (
          <ItemCard
            key={item.id}  // Unique key for React
            item={item}
            onClick={() => {
              // TODO: Navigate to item detail page
              // For now, just log to console
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
