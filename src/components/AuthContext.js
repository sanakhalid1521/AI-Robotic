import React, { createContext, useContext, useEffect, useState } from 'react';

// Create Auth Context
const AuthContext = createContext(null);

// API base URL
const API_BASE_URL = typeof window !== 'undefined' ? 'https://sanakhalid123-physicalairag.hf.space' : 'http://localhost:8000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('auth_token');
  };

  // Set token in localStorage
  const setToken = (token) => {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  };

  // Check auth status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = getToken();
        if (token) {
          const userData = await getCurrentUser(token);
          if (userData) {
            setUser(userData);
          } else {
            // Token is invalid, remove it
            setToken(null);
          }
        }
      } catch (error) {
        console.warn('Auth check failed:', error);
        // Remove invalid token
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Function to get current user
  const getCurrentUser = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.detail || 'Login failed' };
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      return { success: false, message: 'Network error' };
    }
  };

  // Register a new user
  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.detail || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, message: 'Network error' };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      // Clear token and user
      setToken(null);
      setUser(null);

      // Optionally notify backend
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        // Ignore logout errors from backend
      }
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  // Google sign in - redirect to backend endpoint
  const signInWithGoogle = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signin/google`);
      const data = await response.json();

      if (data.error) {
        console.error('Google OAuth error:', data.error);
        alert(data.error);
        return;
      }

      // If no error, proceed with OAuth flow
      window.location.href = `${API_BASE_URL}/api/auth/signin/google`;
    } catch (error) {
      console.error('Error initiating Google OAuth:', error);
      alert('Error initiating Google login. Please try again later.');
    }
  };

  const value = {
    user,
    loading,
    signIn,
    register,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};