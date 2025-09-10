import React, { useState } from 'react';
import axios from 'axios';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: ''
  });

  const { currentPassword, newPassword, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setStatus({
        loading: false,
        success: false,
        error: 'New passwords do not match'
      });
      return;
    }

    setStatus({ loading: true, success: false, error: '' });

    try {
      await axios.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      setStatus({
        loading: false,
        success: true,
        error: ''
      });
      
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: false }));
      }, 3000);
    } catch (error) {
      setStatus({
        loading: false,
        success: false,
        error: error.response?.data?.message || 'Failed to change password. Please try again.'
      });
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h3>Change Password</h3>
      </div>
      <div className="card-body">
        {status.success && (
          <div className="alert alert-success">Password changed successfully!</div>
        )}
        {status.error && (
          <div className="alert alert-danger">{status.error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              className="form-control"
              id="currentPassword"
              name="currentPassword"
              value={currentPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              className="form-control"
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={handleChange}
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
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={status.loading}
          >
            {status.loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;