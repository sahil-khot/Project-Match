import React, { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../services/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize safely: only hydrate cached user if an auth token actually exists
  const [user, setUser] = useState(() => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('pm_token') : null;
      if (!token) return null;
      const cached = localStorage.getItem('pm_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('pm_token') : null;
    return !!token;
  });

  // Normalized lowercase role
  const role = user?.role ? String(user.role).toLowerCase().trim() : null;
  const isAuthenticated = !!user;

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('pm_token') : null;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await authApi.getMe();
      if (data.success && data.user) {
        if (data.token) {
          localStorage.setItem('pm_token', data.token);
        }
        localStorage.setItem('pm_user', JSON.stringify(data.user));
        setUser(data.user);
      } else {
        localStorage.removeItem('pm_token');
        localStorage.removeItem('pm_user');
        setUser(null);
      }
    } catch (err) {
      console.error('Session verification error:', err);
      localStorage.removeItem('pm_token');
      localStorage.removeItem('pm_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const data = await authApi.login(email, password);
      if (data.success && data.user) {
        if (data.token) {
          localStorage.setItem('pm_token', data.token);
        }
        localStorage.setItem('pm_user', JSON.stringify(data.user));
        setUser(data.user);
        const normalizedRole = String(data.user.role).toLowerCase().trim();
        return { success: true, user: data.user, role: normalizedRole };
      }
      return { success: false, message: data.message || 'Invalid email or password.' };
    } catch (err) {
      return { success: false, message: 'Server connection failed. Please try again.' };
    }
  };

  const register = async (studentData) => {
    try {
      const data = await authApi.register(studentData);
      if (data.success && data.user) {
        if (data.token) {
          localStorage.setItem('pm_token', data.token);
        }
        localStorage.setItem('pm_user', JSON.stringify(data.user));
        setUser(data.user);
        const normalizedRole = String(data.user.role).toLowerCase().trim();
        return { success: true, user: data.user, role: normalizedRole };
      }
      return { success: false, message: data.message || 'Registration failed.' };
    } catch (err) {
      return { success: false, message: 'Server connection failed. Please try again.' };
    }
  };

  const loginWithGoogle = async (googlePayload) => {
    try {
      const data = await authApi.loginWithGoogle(googlePayload);
      if (data.success && data.user) {
        if (data.token) {
          localStorage.setItem('pm_token', data.token);
        }
        localStorage.setItem('pm_user', JSON.stringify(data.user));
        setUser(data.user);
        const normalizedRole = String(data.user.role).toLowerCase().trim();
        return { success: true, user: data.user, role: normalizedRole };
      }
      return { success: false, message: data.message || 'Google authentication failed.' };
    } catch (err) {
      return { success: false, message: 'Google connection failed.' };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('pm_token');
      localStorage.removeItem('pm_user');
      localStorage.removeItem('pm_role');
      setUser(null);
      setLoading(false);
    }
  };

  // Strictly 4 official roles: student, mentor, principal, admin
  const getRoleDashboardPath = (userRole) => {
    const r = (userRole || '').toLowerCase().trim();
    switch (r) {
      case 'student':
        return '/student/dashboard';
      case 'mentor':
        return '/mentor/dashboard';
      case 'principal':
        return '/principal/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        role,
        isAuthenticated,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        checkSession,
        getRoleDashboardPath
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
