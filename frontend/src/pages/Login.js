import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsUnverified(false);
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      console.log('Login result:', result);
      
      if (result.success) {
        // Redirect based on user role
        const user = result.user || JSON.parse(localStorage.getItem('user'));
        console.log('User after login:', user);
        
        if (user && user.role && user.role.toLowerCase() === 'admin') {
          console.log('Redirecting to admin dashboard');
          navigate('/admin');
        } else {
          console.log('Redirecting to student dashboard');
          navigate('/student');
        }
      } else {
        console.error('Login failed:', result.message);
        
        // Check if the error is due to unverified email
        if (result.message === 'Please verify your email before logging in') {
          setIsUnverified(true);
          setUnverifiedEmail(formData.email);
        }
        
        setError(result.message);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      await axios.post('/api/auth/resend-verification', { email: unverifiedEmail });
      setError('Verification email has been resent. Please check your inbox.');
      setIsUnverified(false);
    } catch (err) {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <div className="card">
        <h2 className="text-center mb-3">Login</h2>
        
        {error && (
          <div className="alert alert-danger">
            {error}
            {isUnverified && (
              <div className="mt-2">
                <button 
                  className="btn btn-sm btn-outline-primary" 
                  onClick={handleResendVerification}
                  disabled={loading}
                >
                  Resend Verification Email
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-3">
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
          <p>
            <Link to="/forgot-password">Forgot your password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
