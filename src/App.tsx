/**
 * App.tsx - The root component of our React application
 *
 * This is similar to MainActivity.kt in Android - it's the entry point.
 * In React, components are functions that return JSX (HTML-like syntax).
 *
 * What's happening:
 * 1. We import React (the library)
 * 2. We import our CSS styles
 * 3. We define a function component called "App"
 * 4. We return JSX describing what should be on screen
 * 5. We export it so other files can use it
 */

import React from 'react';
import './App.css';

/**
 * App Component - The main screen of our web app
 *
 * React components are JavaScript functions that return JSX.
 * JSX looks like HTML but it's actually JavaScript.
 *
 * @returns JSX element representing our UI
 */
function App() {
  return (
    <div className="App">
      {/* Main content container - centered on page */}
      <div className="App-content">
        {/* Title */}
        <h1 className="App-title">Memory Assistant</h1>

        {/* Subtitle with emoji */}
        <h2 className="App-subtitle">Hello World! 👋</h2>

        {/* Description paragraph */}
        <p className="App-description">
          Your personal memory assistant is ready!
        </p>

        {/* Info box */}
        <div className="App-info">
          <p>✨ This is the web version of Memory Assistant</p>
          <p>🚀 Built with React + TypeScript</p>
          <p>🎨 Matching the Android app's design</p>
        </div>
      </div>
    </div>
  );
}

// Export the component so index.tsx can use it
export default App;
