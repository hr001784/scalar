import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function AppContent() {
  const { user, loading } = useAuth();

  console.log('App.js - Current user:', user);
  console.log('App.js - Loading state:', loading);

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            <Route 
              path="/login" 
              element={
                user ? (
                  console.log('Login route - Redirecting based on role:', user.role),
                  <Navigate to={user.role && user.role.toLowerCase() === 'admin' ? '/admin' : '/student'} />
                ) : <Login />
              } 
            />
            <Route 
              path="/register" 
              element={
                user ? (
                  console.log('Register route - Redirecting based on role:', user.role),
                  <Navigate to={user.role && user.role.toLowerCase() === 'admin' ? '/admin' : '/student'} />
                ) : <Register />
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student" 
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/verify-email/:token" 
              element={<VerifyEmail />} 
            />
            <Route 
              path="/forgot-password" 
              element={<ForgotPassword />} 
            />
            <Route 
              path="/reset-password/:token" 
              element={<ResetPassword />} 
            />
            <Route 
              path="/" 
              element={
                <Navigate to={user ? (user.role && user.role.toLowerCase() === 'admin' ? '/admin' : '/student') : '/login'} />
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
