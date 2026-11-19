import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('roxiler_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('roxiler_token'));
  const [loading, setLoading] = useState(true);

  // Verify and refresh user info on startup
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('roxiler_token');
      if (storedToken) {
        try {
          const res = await authApi.getProfile();
          if (res.data.success && res.data.data.user) {
            setUser(res.data.data.user);
            localStorage.setItem('roxiler_user', JSON.stringify(res.data.data.user));
          }
        } catch {
          // Token is invalid/expired
          localStorage.removeItem('roxiler_token');
          localStorage.removeItem('roxiler_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('roxiler_token', receivedToken);
      localStorage.setItem('roxiler_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('roxiler_token', receivedToken);
      localStorage.setItem('roxiler_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('roxiler_token');
    localStorage.removeItem('roxiler_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await authApi.changePassword({ currentPassword, newPassword });
    return res.data;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    role: user?.role,
    login,
    register,
    logout,
    changePassword,
    setUser
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

