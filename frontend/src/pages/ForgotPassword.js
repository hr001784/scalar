import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });

    try {
      await axios.post('/api/auth/forgot-password', { email });
      setStatus({
        loading: false,
        success: true,
        error: ''
      });
    } catch (error) {
      setStatus({
        loading: false,
        success: false,
        error: error.response?.data?.message || 'Something went wrong. Please try again.'
      });
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-center">Forgot Password</h2>
            </div>
            <div className="card-body">
              {status.success ? (
                <div className="alert alert-success">
                  <p>If your email is registered, you will receive a password reset link shortly.</p>
                  <p>Please check your email inbox and follow the instructions.</p>
                  <div className="text-center mt-3">
                    <Link to="/login" className="btn btn-primary">Back to Login</Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {status.error && <div className="alert alert-danger">{status.error}</div>}
                  <div className="form-group mb-3">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={status.loading}
                    >
                      {status.loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </div>
                  <div className="text-center mt-3">
                    <Link to="/login">Back to Login</Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;