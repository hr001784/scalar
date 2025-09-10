import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: ''
  });

  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setStatus({
        loading: false,
        success: false,
        error: 'Passwords do not match'
      });
      return;
    }

    setStatus({ loading: true, success: false, error: '' });

    try {
      await axios.post(`/api/auth/reset-password/${token}`, { password });
      setStatus({
        loading: false,
        success: true,
        error: ''
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setStatus({
        loading: false,
        success: false,
        error: error.response?.data?.message || 'Password reset failed. Please try again.'
      });
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-center">Reset Password</h2>
            </div>
            <div className="card-body">
              {status.success ? (
                <div className="alert alert-success">
                  <p>Your password has been reset successfully!</p>
                  <p>You will be redirected to the login page in a few seconds...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {status.error && <div className="alert alert-danger">{status.error}</div>}
                  <div className="form-group mb-3">
                    <label htmlFor="password">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength="6"
                    />
                    <small className="form-text text-muted">Password must be at least 6 characters long.</small>
                  </div>
                  <div className="form-group mb-3">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength="6"
                    />
                  </div>
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={status.loading}
                    >
                      {status.loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;