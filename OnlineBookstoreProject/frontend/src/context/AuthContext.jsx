import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('bookstore_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('bookstore_token');
        setToken('');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = async (payload) => {
    const response = await api.post('/auth/login', payload);
    localStorage.setItem('bookstore_token', response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const register = async (payload) => {
    const response = await api.post('/auth/register', payload);
    localStorage.setItem('bookstore_token', response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const updateProfile = async (payload) => {
    const response = await api.patch('/auth/profile', payload);
    setUser((current) => ({ ...current, ...response.data.user }));
    return response.data;
  };

  const changePassword = async (payload) => {
    const response = await api.patch('/auth/change-password', payload);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('bookstore_token');
    setToken('');
    setUser(null);
  };

  const updateUser = (userData) => setUser(userData);

  return <AuthContext.Provider value={{ user, token, loading, login, register, updateProfile, changePassword, logout, updateUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
