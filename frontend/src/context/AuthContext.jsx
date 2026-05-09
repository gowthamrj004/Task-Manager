import { createContext, useState, useCallback, useEffect } from 'react';
import { accountManagementAPI } from '../utils/apiClient';

/**
 * Authentication Context
 * Manages user authentication state and provides auth methods to the entire app
 * This centralized approach prevents prop drilling and ensures consistent auth state
 */
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authenticationError, setAuthenticationError] = useState(null);

  /**
   * Initialize auth state on app load
   * Restores user session from localStorage if available
   */
  useEffect(() => {
    const restoreSession = () => {
      try {
        const savedUserData = localStorage.getItem('accountData');
        if (savedUserData) {
          setCurrentUser(JSON.parse(savedUserData));
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('accountData');
      } finally {
        setIsAuthLoading(false);
      }
    };

    restoreSession();
  }, []);

  /**
   * Register new user account
   * Saves user data and token to localStorage for persistence
   */
  const registerNewAccount = useCallback(async (emailAddress, rawPassword, userFullName) => {
    setAuthenticationError(null);

    try {
      const response = await accountManagementAPI.registerAccount({
        emailAddress,
        rawPassword,
        userFullName,
      });

      const { accountData, accessToken } = response.data;

      // Persist user data and token
      localStorage.setItem('accountData', JSON.stringify(accountData));
      localStorage.setItem('accessToken', accessToken);

      setCurrentUser(accountData);
      return accountData;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setAuthenticationError(errorMessage);
      throw error;
    }
  }, []);

  /**
   * Login with existing credentials
   * Establishes authenticated session
   */
  const loginWithCredentials = useCallback(async (emailAddress, rawPassword) => {
    setAuthenticationError(null);

    try {
      const response = await accountManagementAPI.loginAccount({
        emailAddress,
        rawPassword,
      });

      const { accountData, accessToken } = response.data;

      localStorage.setItem('accountData', JSON.stringify(accountData));
      localStorage.setItem('accessToken', accessToken);

      setCurrentUser(accountData);
      return accountData;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setAuthenticationError(errorMessage);
      throw error;
    }
  }, []);

  /**
   * End user session and clear authentication
   * Cleans up both local storage and state
   */
  const endUserSession = useCallback(async () => {
    try {
      await accountManagementAPI.logoutAccount();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage even if logout API fails
      localStorage.removeItem('accountData');
      localStorage.removeItem('accessToken');
      setCurrentUser(null);
      setAuthenticationError(null);
    }
  }, []);

  /**
   * Clear any authentication errors from state
   * Useful for dismissing error messages
   */
  const clearAuthError = useCallback(() => {
    setAuthenticationError(null);
  }, []);

  const authContextValue = {
    currentUser,
    isAuthLoading,
    authenticationError,
    registerNewAccount,
    loginWithCredentials,
    endUserSession,
    clearAuthError,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}
