import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vigileye_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('vigileye_access_token'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('vigileye_refresh_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('vigileye_access_token');
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('vigileye_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.error('Session restore error:', err);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifier, password, twoFactorCode) => {
    const res = await authService.login({ identifier, password, twoFactorCode });
    if (res.success && res.data?.accessToken) {
      setAccessToken(res.data.accessToken);
      setRefreshToken(res.data.refreshToken);
      setUser(res.data.user);
      localStorage.setItem('vigileye_access_token', res.data.accessToken);
      localStorage.setItem('vigileye_refresh_token', res.data.refreshToken);
      localStorage.setItem('vigileye_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.data?.accessToken) {
      setAccessToken(res.data.accessToken);
      setRefreshToken(res.data.refreshToken);
      setUser(res.data.user);
      localStorage.setItem('vigileye_access_token', res.data.accessToken);
      localStorage.setItem('vigileye_refresh_token', res.data.refreshToken);
      localStorage.setItem('vigileye_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const logout = async () => {
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem('vigileye_access_token');
      localStorage.removeItem('vigileye_refresh_token');
      localStorage.removeItem('vigileye_user');
    }
  };

  const updateProfileState = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('vigileye_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user && !!accessToken,
        isAdmin: user?.role === 'ADMIN',
        loading,
        login,
        register,
        logout,
        updateProfileState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
