import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';
import { useNavigate } from 'react-router-dom';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/api/admin/auth/me');
      if (response.data.success) {
        setAdmin(response.data.admin);
        setIsAuthenticated(true);
      }
    } catch {
      setAdmin(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/admin/auth/login', { email, password });
      if (response.data.success) {
        setAdmin(response.data.admin);
        setIsAuthenticated(true);
        navigate('/admin/dashboard');
        return { success: true };
      }
      // Fallback if response doesn't have success flag
      return { success: false, message: response.data.message || 'An unknown error occurred.' };
    } catch (error) {
      console.error('Admin login error:', error.response || error);
      
      // Extract the specific error message from the backend's JSON response
      const message = error.response?.data?.message || 
                      'Login failed. Server is unreachable or an error occurred.';
      
      return { success: false, message: message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/admin/auth/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAdmin(null);
      setIsAuthenticated(false);
      navigate('/admin/login');
    }
  };

  const hasPermission = (resource, action) => {
    if (!admin || !admin.permissions) return false;
    return admin.permissions[resource]?.[action] === true;
  };

  const value = { admin, isAuthenticated, loading, login, logout, hasPermission, checkAuth };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};


