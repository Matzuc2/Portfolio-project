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
      // Token expiré ou invalide
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const questionService = {
  // Récupérer toutes les questions
  getAllQuestions: async () => {
    try {
      const response = await api.get('/questions');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des questions:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la récupération des questions'
      };
    }
  },

  // Récupérer une question par ID
  getQuestionById: async (id) => {
    try {
      const response = await api.get(`/questions/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la question:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Question non trouvée'
      };
    }
  },

  // Créer une nouvelle question
  createQuestion: async (questionData) => {
    try {
      const response = await api.post('/questions', questionData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors de la création de la question:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la création de la question'
      };
    }
  },

  // Mettre à jour une question
  updateQuestion: async (id, questionData) => {
    try {
      const response = await api.put(`/questions/${id}`, questionData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la question:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la mise à jour de la question'
      };
    }
  },

  // Supprimer une question
  deleteQuestion: async (id) => {
    try {
      const response = await api.delete(`/questions/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de la question:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la suppression de la question'
      };
    }
  },

  // Récupérer les réponses d'une question
  getAnswersByQuestionId: async (questionId) => {
    try {
      const response = await api.get(`/questions/${questionId}/answers`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des réponses:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la récupération des réponses'
      };
    }
  }
};

export default questionService;