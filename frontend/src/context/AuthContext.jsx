import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        console.log('Verifying session...');
        const response = await api.get('/auth/me');
        if (response.data.success) {
          const userData = response.data.user;
          setUser(userData);
          sessionStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Session verification failed:', error.response?.data || error.message);
        if (error.response?.status === 401) {
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('token');
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    const savedUser = sessionStorage.getItem('user');
    const savedToken = sessionStorage.getItem('token');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      verifySession();
    } else {
      console.log('No saved session found in sessionStorage');
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const userData = response.data.user;
      const token = response.data.token;
      
      setUser(userData);
      sessionStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('token', token);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.errors?.[0]?.msg || 
                      error.response?.data?.message || 
                      (error.code === 'ERR_NETWORK' ? 'Unable to connect to server. Is the backend running?' : 'Login failed');
      return { success: false, message };
    }
  };

  const signup = async (formData) => {
    try {
      const response = await api.post('/auth/signup', formData);
      const userData = response.data.user;
      const token = response.data.token;
      
      setUser(userData);
      sessionStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('token', token);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Signup error:', error);
      const message = error.response?.data?.errors?.[0]?.msg || 
                      error.response?.data?.message || 
                      (error.code === 'ERR_NETWORK' ? 'Unable to connect to server. Is the backend running?' : 'Signup failed');
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      setUser(null);
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
