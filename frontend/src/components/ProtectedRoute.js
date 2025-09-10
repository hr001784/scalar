import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - Required Role:', requiredRole);

  if (loading) {
    console.log('ProtectedRoute - Loading...');
    return (
      <div className="loading">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login" />;
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    console.log(`ProtectedRoute - Role mismatch: User role is ${user.role}, required role is ${requiredRole}`);
    
    // Special case for admin role - check if role is exactly 'admin'
    if (requiredRole === 'admin' && user.role.toLowerCase() === 'admin') {
      console.log('ProtectedRoute - Admin role detected despite case mismatch, allowing access');
      // Allow access despite case mismatch
    } else {
      // Redirect to appropriate dashboard based on user's actual role
      return <Navigate to={user.role.toLowerCase() === 'admin' ? '/admin' : '/student'} />;
    }
  }

  console.log(`ProtectedRoute - Access granted for role: ${user.role}`);
  return children;
};

export default ProtectedRoute;
