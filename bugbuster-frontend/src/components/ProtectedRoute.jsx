import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#1a1a2e',
        color: '#fff' 
      }}>
        Vérification de l'authentification...
      </div>
    );
  }

  // SIMPLIFICATION : Redirection simple vers login
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;