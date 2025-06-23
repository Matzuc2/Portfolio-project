import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Configuration axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const searchService = {
  // Recherche globale avec filtres
  searchQuestions: async (searchParams) => {
    try {
      const queryString = new URLSearchParams(searchParams).toString();
      const response = await api.get(`/search/questions?${queryString}`);
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la recherche'
      };
    }
  },

  // Recherche par tag
  searchByTag: async (tagName) => {
    try {
      const response = await api.get(`/search/tag/${encodeURIComponent(tagName)}`);
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      console.error('Erreur lors de la recherche par tag:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la recherche par tag'
      };
    }
  },

  // Recherche par utilisateur
  searchByUser: async (username) => {
    try {
      const response = await api.get(`/search/user/${encodeURIComponent(username)}`);
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      console.error('Erreur lors de la recherche par utilisateur:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la recherche par utilisateur'
      };
    }
  }
};

export default searchService;