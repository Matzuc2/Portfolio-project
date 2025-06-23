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

const answerService = {
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
  },

  // Créer une nouvelle réponse
  createAnswer: async (answerData) => {
    try {
      // CORRECTION : Utiliser les bons noms de champs
      const response = await api.post('/answers', {
        content: answerData.content,        // Le backend attend 'content' (minuscule)
        questionId: answerData.questionId,  // Le backend attend 'questionId' (minuscule)
        codeSnippet: answerData.codeContent || null // Le backend attend 'codeSnippet'
      });
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      console.error('Erreur lors de la création de la réponse:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la création de la réponse'
      };
    }
  },

  // Mettre à jour une réponse
  updateAnswer: async (id, answerData) => {
    try {
      const response = await api.put(`/answers/${id}`, answerData);
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la réponse:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la mise à jour de la réponse'
      };
    }
  },

  // Supprimer une réponse
  deleteAnswer: async (id) => {
    try {
      const response = await api.delete(`/answers/${id}`);
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de la réponse:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la suppression de la réponse'
      };
    }
  },

  // Accepter une réponse
  acceptAnswer: async (answerId) => {
    try {
      const response = await api.patch(`/answers/${answerId}/accept`);
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de la réponse:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de l\'acceptation de la réponse'
      };
    }
  },

  // Désaccepter une réponse
  unacceptAnswer: async (answerId) => {
    try {
      const response = await api.patch(`/answers/${answerId}/unaccept`);
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      console.error('Erreur lors de la désacceptation de la réponse:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la désacceptation de la réponse'
      };
    }
  }
};

export default answerService;