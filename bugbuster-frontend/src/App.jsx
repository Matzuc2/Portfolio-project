import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useNotification } from './hooks/useNotification';
import Notification from './components/Notification';
import Home from './pages/Home';
import QuestionDetail from './pages/QuestionDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AskQuestion from './pages/AskQuestion';
import SearchResults from './pages/SearchResults';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const { notification, hideNotification } = useNotification();

  return (
    <>
      <Router>
        <Routes>
          {/* Route pour la page d'accueil */}
          <Route path="/" element={<Home />} />
          
          {/* Route pour les détails d'une question */}
          <Route path="/question/:id" element={<QuestionDetail />} />
          
          {/* Route pour les résultats de recherche */}
          <Route path="/search" element={<SearchResults />} />
          
          {/* Routes d'authentification */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Route protégée pour poser une question */}
          <Route 
            path="/ask" 
            element={
              <ProtectedRoute>
                <AskQuestion />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirection pour les routes non trouvées */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      {/* Système de notifications global */}
      <Notification 
        notification={notification} 
        onClose={hideNotification} 
      />
    </>
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