import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

// Assume apiClient.js exports these functions matching backend controllers
// They should return { token: '...' } on success and throw an error on failure.
// The error object might have error.response.data.message for specific messages.
import {
  loginUser as apiLogin,
  registerUser as apiRegister,
} from '../services/apiClient.js'; // Adjust path if needed

/**
 * @typedef {object} Credentials
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {object} AuthContextType
 * @property {string | null} token - The JWT authentication token. Null if not authenticated.
 * @property {boolean} isAuthenticated - True if the user is authenticated, false otherwise.
 * @property {boolean} isLoading - True while performing async operations (initial check, login, register).
 * @property {string | null} error - Stores user-friendly error messages from auth operations. Null if no error.
 * @property {(credentials: Credentials) => Promise<void>} login - Function to log the user in.
 * @property {() => void} logout - Function to log the user out.
 * @property {(credentials: Credentials) => Promise<void>} register - Function to register a new user (includes auto-login).
 */

/**
 * @type {React.Context<AuthContextType | undefined>}
 */
const AuthContext = createContext(undefined);

/**
 * @typedef {object} AuthProviderProps
 * @property {React.ReactNode} children - The child components that need access to the auth context.
 */

/**
 * Provides authentication state and actions to the application.
 * Manages JWT token persistence in localStorage and interacts with the API.
 * @param {AuthProviderProps} props
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start loading until initial check is done
  const [error, setError] = useState(null);

  // Effect for checking token persistence on initial load
  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts during async check
    const checkAuthState = () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken && isMounted) {
          // For MVP, simply having a token means authenticated.
          // Real-world might add token validation/refresh logic here.
          setToken(storedToken);
          setIsAuthenticated(true);
          // Note: We are not decoding the token to get user info in MVP context state.
          // If apiClient requires setting default headers, do it here:
          // setApiClientAuthHeader(storedToken);
        }
      } catch (e) {
        // Handle potential localStorage errors gracefully
        console.error('Error reading auth token from localStorage:', e);
        // Ensure state is clean if error occurs
        if (isMounted) {
            localStorage.removeItem('authToken'); // Clear potentially corrupt token
            setToken(null);
            setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false); // Finished initial check
        }
      }
    };

    checkAuthState();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
        isMounted = false;
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to handle user login
  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      const response = await apiLogin(credentials);
      const receivedToken = response.token; // Assuming API returns { token: '...' }

      if (!receivedToken) {
         throw new Error('Login successful, but no token received.');
      }

      localStorage.setItem('authToken', receivedToken);
      setToken(receivedToken);
      setIsAuthenticated(true);
      setError(null);
      // setApiClientAuthHeader(receivedToken); // If needed

    } catch (err) {
      console.error('Login failed:', err);
      // Extract user-friendly message or provide default
      const errorMessage = err?.response?.data?.message || err?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      // Ensure auth state is cleared on failed login attempt
      localStorage.removeItem('authToken');
      setToken(null);
      setIsAuthenticated(false);
      // clearApiClientAuthHeader(); // If needed
    } finally {
      setIsLoading(false);
    }
  }, []); // Dependencies: none, as it uses state setters directly

  // Function to handle user registration (with auto-login)
  const register = useCallback(async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRegister(credentials);
      const receivedToken = response.token;

      if (!receivedToken) {
         throw new Error('Registration successful, but no token received for auto-login.');
      }

      // Auto-login flow: Treat registration success like login success
      localStorage.setItem('authToken', receivedToken);
      setToken(receivedToken);
      setIsAuthenticated(true);
      setError(null);
      // setApiClientAuthHeader(receivedToken); // If needed

    } catch (err) {
      console.error('Registration failed:', err);
      // Extract user-friendly message or provide default
      const errorMessage = err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      // Ensure auth state is cleared on failed registration attempt
      localStorage.removeItem('authToken');
      setToken(null);
      setIsAuthenticated(false);
      // clearApiClientAuthHeader(); // If needed
    } finally {
      setIsLoading(false);
    }
  }, []); // Dependencies: none

  // Function to handle user logout
  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setToken(null);
    setIsAuthenticated(false);
    setError(null);
    setIsLoading(false); // No longer loading after logout action
    // clearApiClientAuthHeader(); // If needed
    // Optionally redirect user via navigation hook if called from component context
  }, []); // Dependencies: none

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(() => ({
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
  }), [token, isAuthenticated, isLoading, error, login, logout, register]); // Include all provided values

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to consume the AuthContext.
 * Provides a convenient way to access auth state and actions.
 * Throws an error if used outside of an AuthProvider.
 * @returns {AuthContextType} The authentication context value.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Optionally export the context itself if needed for specific scenarios
// export { AuthContext };

// Helper functions for managing API client headers (if applicable)
// These would typically reside in or be called by the apiClient itself,
// but are shown here conceptually if the context needed to manage them.
/*
const setApiClientAuthHeader = (token) => {
  // Example: apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  console.log('Setting Authorization header (Conceptual)');
};

const clearApiClientAuthHeader = () => {
  // Example: delete apiClient.defaults.headers.common['Authorization'];
  console.log('Clearing Authorization header (Conceptual)');
};
*/