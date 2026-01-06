/**
 * LoginPage.tsx - Login and Sign Up page for web app
 *
 * This is the WEB VERSION of LoginScreen.kt from Android.
 *
 * Key React concepts used here:
 * - useState: Manages component state (like remember + mutableStateOf in Compose)
 * - useEffect: Runs code when component mounts or state changes
 * - Event handlers: onClick, onChange, onSubmit
 * - Conditional rendering: {condition && <Component />}
 * - Form handling: Prevents default submit, validates input
 */

import React, { useState } from 'react';
import { signUp, signIn } from '../../services/auth.service';
import './LoginPage.css';

/**
 * Props for LoginPage component
 *
 * onLoginSuccess: Callback function called when login succeeds
 * Similar to the Kotlin version, but using TypeScript
 */
interface LoginPageProps {
  onLoginSuccess: () => void;
}

/**
 * LoginPage component
 *
 * Displays a form for users to sign in or sign up.
 *
 * @param onLoginSuccess - Function to call when login succeeds
 */
const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  /**
   * STATE MANAGEMENT with useState
   *
   * useState is React's way to manage component state
   * Similar to remember + mutableStateOf in Jetpack Compose
   *
   * Syntax: const [value, setValue] = useState(initialValue)
   * - value: current state value
   * - setValue: function to update the state
   */

  // Email and password fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Error message to display (null = no error)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Loading state (true = showing spinner)
  const [isLoading, setIsLoading] = useState(false);

  // Track if we're in "Sign Up" mode or "Sign In" mode
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  /**
   * Handle form submission
   *
   * This is an async function because we call the auth service (async operations)
   *
   * @param e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    /**
     * Prevent default form behavior
     *
     * By default, forms reload the page when submitted.
     * preventDefault() stops this - we want to handle it ourselves.
     */
    e.preventDefault();

    // Clear any previous errors
    setErrorMessage(null);

    // Validate inputs
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    // Start loading
    setIsLoading(true);

    try {
      /**
       * Call the auth service
       *
       * await - waits for the async function to complete
       * Like coroutines in Kotlin, but built into JavaScript
       */
      if (isSignUpMode) {
        // Sign up new user
        await signUp(email, password);
      } else {
        // Sign in existing user
        await signIn(email, password);
      }

      // Success! Call the callback
      onLoginSuccess();
    } catch (error: any) {
      /**
       * Handle errors
       *
       * The auth service already converts Firebase errors to friendly messages
       * We just display them here
       */
      setErrorMessage(error.message || 'Authentication failed');
    } finally {
      /**
       * finally block - runs whether try succeeds or fails
       *
       * We always want to stop loading, even if there's an error
       */
      setIsLoading(false);
    }
  };

  /**
   * Toggle between Sign In and Sign Up modes
   */
  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setErrorMessage(null); // Clear errors when switching
  };

  /**
   * RENDER - Return the JSX (UI)
   *
   * This looks like HTML, but it's JSX - JavaScript XML
   * Similar to Composable functions in Jetpack Compose
   */
  return (
    <div className="login-page">
      <div className="login-container">
        {/* Title */}
        <h1 className="login-title">
          {isSignUpMode ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="login-subtitle">
          {isSignUpMode ? 'Sign up to get started' : 'Sign in to continue'}
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Email Input */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
              required
            />
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
              required
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="error-message">{errorMessage}</div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              // Show loading spinner
              <span className="loading-spinner">Loading...</span>
            ) : (
              // Show button text
              isSignUpMode ? 'Sign Up' : 'Sign In'
            )}
          </button>
        </form>

        {/* Toggle between Sign In and Sign Up */}
        <button onClick={toggleMode} className="toggle-mode-button">
          {isSignUpMode
            ? 'Already have an account? Sign In'
            : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
