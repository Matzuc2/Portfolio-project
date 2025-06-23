import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Configuration axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour gérer les réponses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const authService = {
  // Initialiser l'authentification (vérifier le token stocké)
  initializeAuth: () => {
    try {
      const token = localStorage.getItem('auth_token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        // Valider le token si nécessaire
        return {
          token,
          user: JSON.parse(user)
        };
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'auth:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      return null;
    }
  },

  // Connexion
  login: async (credentials) => {
    try {
      console.log('authService - Tentative de connexion avec:', credentials);
      
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });
      
      console.log('authService - Réponse complète:', response);
      console.log('authService - Données de réponse:', response.data);
      
      if (response.data && response.data.token) {
        // Stocker le token et les informations utilisateur
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        console.log('authService - Token stocké:', response.data.token);
        console.log('authService - Utilisateur stocké:', response.data.user);
        
        return {
          success: true,
          user: response.data.user,
          token: response.data.token
        };
      } else {
        console.log('authService - Réponse manquante ou incomplète');
        return {
          success: false,
          error: 'Données de connexion manquantes dans la réponse'
        };
      }
    } catch (error) {
      console.error('authService - Erreur de connexion:', error);
      console.error('authService - Détails de l\'erreur:', error.response?.data);
      
      // AMÉLIORATION : Gestion plus précise des erreurs
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.error;
        
        switch (status) {
          case 400:
            return {
              success: false,
              error: errorMessage || 'Données invalides'
            };
          case 401:
            return {
              success: false,
              error: errorMessage || 'Email ou mot de passe incorrect'
            };
          case 429:
            return {
              success: false,
              error: 'Trop de tentatives. Veuillez patienter quelques minutes.'
            };
          case 500:
            return {
              success: false,
              error: 'Erreur temporaire du serveur. Veuillez réessayer.'
            };
          default:
            return {
              success: false,
              error: errorMessage || 'Erreur de connexion'
            };
        }
      } else if (error.request) {
        return {
          success: false,
          error: 'Impossible de contacter le serveur. Vérifiez votre connexion internet.'
        };
      } else {
        return {
          success: false,
          error: 'Erreur inattendue. Veuillez réessayer.'
        };
      }
    }
  },

  // Inscription - CORRECTION : Ne pas stocker le token automatiquement
  register: async (userData) => {
    try {
      console.log('Tentative d\'inscription avec:', userData);
      
      const payload = {
        username: userData.username,
        email: userData.email,
        password: userData.password
      };
      
      console.log('Payload envoyé au backend:', payload);
      
      const response = await api.post('/auth/register', payload);
      
      console.log('Réponse d\'inscription:', response.data);
      
      if (response.data.token) {
        // CORRECTION : Ne PAS stocker le token automatiquement
        // L'utilisateur doit se connecter manuellement après inscription
        
        return {
          success: true,
          user: response.data.user,
          message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.'
        };
      } else {
        return {
          success: false,
          error: 'Données d\'inscription manquantes'
        };
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur d\'inscription'
      };
    }
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  // Obtenir le token actuel
  getToken: () => {
    return localStorage.getItem('auth_token');
  },

  // Obtenir l'utilisateur actuel
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }
};

export default authService;