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
    // Redirect to appropriate dashboard based on user's actual role
    return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} />;
  }

  console.log(`ProtectedRoute - Access granted for role: ${user.role}`);
  return children;
};

export default ProtectedRoute;
