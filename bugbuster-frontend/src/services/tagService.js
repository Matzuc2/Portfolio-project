import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Configuration axios avec intercepteur pour le token
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter automatiquement le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const tagService = {
  // Récupérer tous les tags
  getAllTags: async () => {
    try {
      const response = await api.get('/tags');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des tags:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la récupération des tags'
      };
    }
  },

  // Créer un nouveau tag
  createTag: async (tagName) => {
    try {
      const response = await api.post('/tags', { name: tagName });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors de la création du tag:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la création du tag'
      };
    }
  },

  // Rechercher des tags par nom
  searchTags: async (query) => {
    try {
      const response = await api.get(`/tags/search?q=${encodeURIComponent(query)}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors de la recherche de tags:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la recherche de tags'
      };
    }
  }
};

export default tagService;