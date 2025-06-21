import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Initialiser l'authentification au démarrage
    const initAuth = () => {
      try {
        authService.initializeAuth();
        
        const currentUser = authService.getCurrentUser();
        console.log('AuthContext - Utilisateur initial:', currentUser);
        
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    console.log('AuthContext - Début du login');
    setLoading(true);
    
    try {
      const result = await authService.login(credentials);
      console.log('AuthContext - Résultat du service login:', result);
      
      if (result.success) {
        console.log('AuthContext - Mise à jour de l\'état utilisateur');
        setUser(result.user);
        setIsAuthenticated(true);
        console.log('AuthContext - État mis à jour:', { user: result.user, isAuthenticated: true });
        return { success: true };
      } else {
        console.log('AuthContext - Échec du login:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('AuthContext - Erreur login:', error);
      return { success: false, error: 'Erreur de connexion' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const result = await authService.register(userData);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Erreur d\'inscription' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const getCurrentUserId = () => {
    return user?.id || user?.Id;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    getCurrentUserId,
    getToken: () => authService.getToken()
  };

  console.log('AuthContext - État actuel:', { 
    user: user?.username || 'Aucun', 
    isAuthenticated, 
    loading 
  });

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
        Chargement...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};