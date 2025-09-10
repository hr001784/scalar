import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <a href="/" className="navbar-brand">
            Student Management System
          </a>
          
          {user && (
            <div className="d-flex align-items-center">
              <span style={{ marginRight: '20px' }}>
                Welcome, {user.name} ({user.role})
              </span>
              <button 
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: '5px 15px', fontSize: '14px' }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
