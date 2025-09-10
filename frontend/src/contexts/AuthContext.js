import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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

  // Set up axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('/api/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, ...userData } = response.data;
      
      // Check if user is verified
      if (response.data.isVerified === false) {
        console.log('User is not verified');
        return { 
          success: false, 
          message: 'Please verify your email before logging in',
          isVerified: false
        };
      }
      
      // Add console log to debug admin login
      console.log('Login successful:', userData);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      
      // Check if the error is due to unverified email
      if (error.response?.data?.isVerified === false) {
        return { 
          success: false, 
          message: error.response.data.message || 'Please verify your email before logging in',
          isVerified: false
        };
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (name, email, password, role = 'student') => {
    try {
      // Normalize role to lowercase for consistency
      const normalizedRole = role.toLowerCase();
      console.log(`Registering user with role: ${normalizedRole}`);
      
      const response = await axios.post('/api/auth/register', { 
        name, 
        email, 
        password, 
        role: normalizedRole // Use normalized role
      });
      const { token, ...userData } = response.data;
      
      console.log('Registration successful:', userData);
      
      // Store user data but inform about verification requirement
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      
      return { 
        success: true, 
        user: userData,
        message: response.data.message || 'Registration successful. Please check your email to verify your account.'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  const resendVerification = async (email) => {
    try {
      const response = await axios.post('/api/auth/resend-verification', { email });
      return { 
        success: true, 
        message: response.data.message || 'Verification email sent. Please check your inbox.'
      };
    } catch (error) {
      console.error('Resend verification error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to resend verification email' 
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      return { 
        success: true, 
        message: response.data.message || 'Password reset email sent. Please check your inbox.'
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to send password reset email' 
      };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await axios.post(`/api/auth/reset-password/${token}`, { password });
      return { 
        success: true, 
        message: response.data.message || 'Password reset successful. You can now log in with your new password.'
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to reset password' 
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.post('/api/auth/change-password', { currentPassword, newPassword });
      return { 
        success: true, 
        message: response.data.message || 'Password changed successfully.'
      };
    } catch (error) {
      console.error('Change password error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to change password' 
      };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    resendVerification,
    forgotPassword,
    resetPassword,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
