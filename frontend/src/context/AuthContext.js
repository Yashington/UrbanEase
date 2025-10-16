import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));

  // Auto-refresh token
  useEffect(() => {
    const refreshAccessToken = async () => {
      if (!refreshToken) return;

      try {
        const response = await fetch('https://urbanease-backend.onrender.com/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });

        if (response.ok) {
          const data = await response.json();
          setAccessToken(data.data.accessToken);
          setRefreshToken(data.data.refreshToken);
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
        } else {
          logout();
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        logout();
      }
    };

    // Refresh token every 6 hours
    const interval = setInterval(refreshAccessToken, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshToken]);

  // Load user profile on mount
  useEffect(() => {
    const loadUser = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
          const response = await fetch('https://urbanease-backend.onrender.com/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.data.user);
        } else {
          logout();
        }
      } catch (error) {
        console.error('Load user failed:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [accessToken]);

  const login = async (email, password) => {
    try {
      const response = await fetch('https://urbanease-backend.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data.data.user);
      setAccessToken(data.data.accessToken);
      setRefreshToken(data.data.refreshToken);
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('userId', data.data.user._id);

      return data;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await fetch('https://urbanease-backend.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      setUser(data.data.user);
      setAccessToken(data.data.accessToken);
      setRefreshToken(data.data.refreshToken);
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('userId', data.data.user._id);

      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await fetch('https://urbanease-backend.onrender.com/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('cart');
    }
  };

  // API helper with automatic token handling
  const apiCall = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    // If token expired, try to refresh
    if (response.status === 401 && refreshToken) {
      try {
        const refreshResponse = await fetch('https://urbanease-backend.onrender.com/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setAccessToken(refreshData.data.accessToken);
          localStorage.setItem('accessToken', refreshData.data.accessToken);

          // Retry original request with new token
          headers.Authorization = `Bearer ${refreshData.data.accessToken}`;
          return fetch(url, { ...options, headers });
        }
      } catch (error) {
        logout();
      }
    }

    return response;
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    apiCall
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};