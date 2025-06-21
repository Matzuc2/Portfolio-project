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
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur de connexion'
      };
    }
  },

  // Inscription - CORRECTION : Utiliser les bons noms de champs
  register: async (userData) => {
    try {
      console.log('Tentative d\'inscription avec:', userData);
      
      // CORRECTION : Mapper les champs du formulaire vers ceux attendus par le backend
      const payload = {
        username: userData.username,
        email: userData.email,
        password: userData.password
        // Ne pas envoyer confirmPassword au backend
      };
      
      console.log('Payload envoyé au backend:', payload);
      
      const response = await api.post('/auth/register', payload);
      
      console.log('Réponse d\'inscription:', response.data);
      
      if (response.data.token) {
        // Stocker le token et les informations utilisateur
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        return {
          success: true,
          user: response.data.user,
          token: response.data.token
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