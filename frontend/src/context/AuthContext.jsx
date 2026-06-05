import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

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

  // Derived state
  const isAuthenticated = !!user;
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || false;

  // ── Initialize from localStorage on mount ──
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');

        if (storedUser && accessToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        // Corrupted localStorage — clear it
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ── Login ──
  const login = useCallback(async (email, password) => {
    const response = await authApi.login(email, password);
    const { token, refreshToken, email: userEmail, name, roles } = response.data.data;

    const userData = { email: userEmail, name, roles };

    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));

    setUser(userData);
    toast.success(`Welcome back, ${name}!`);

    return userData;
  }, []);

  // ── Register ──
  const register = useCallback(async (name, email, password) => {
    const response = await authApi.register(name, email, password);
    const { token, refreshToken, email: userEmail, name: userName, roles } = response.data.data;

    const userData = { email: userEmail, name: userName, roles };

    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));

    setUser(userData);
    toast.success(`Welcome to ShopNest, ${userName}!`);

    return userData;
  }, []);

  // ── Logout ──
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if API call fails, clear local state
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    toast.info('Logged out successfully');
  }, []);

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
