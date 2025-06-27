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
    console.log('voteService - Token utilisé:', token ? 'Présent' : 'Absent');
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
    console.error('voteService - Erreur de réponse:', error.response?.status, error.response?.data);
    
    // NE PAS rediriger automatiquement ici, laisser le composant gérer
    return Promise.reject(error);
  }
);

const voteService = {
  // Récupérer les votes d'une question
  getVotesByQuestionId: async (questionId) => {
    try {
      console.log('voteService - Récupération des votes pour la question:', questionId);
      const response = await api.get(`/votes/questions/${questionId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des votes de la question:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la récupération des votes'
      };
    }
  },

  // Récupérer les votes d'une réponse
  getVotesByAnswerId: async (answerId) => {
    try {
      console.log('voteService - Récupération des votes pour la réponse:', answerId);
      const response = await api.get(`/votes/answers/${answerId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des votes de la réponse:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la récupération des votes'
      };
    }
  },

  // Voter pour une question
  voteQuestion: async (questionId, voteType) => {
    try {
      console.log('voteService - Vote pour question:', { questionId, voteType });
      
      // VÉRIFICATION : S'assurer que le token est présent
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('voteService - Pas de token disponible');
        return {
          success: false,
          error: 'Non authentifié'
        };
      }

      const response = await api.post('/votes/questions', {
        questionId: questionId,
        vote_type: voteType
      });
      
      console.log('voteService - Réponse du vote:', response.data);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors du vote sur la question:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      
      // Gestion spécifique des erreurs d'authentification
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Session expirée',
          requiresAuth: true
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors du vote'
      };
    }
  },

  // Voter pour une réponse
  voteAnswer: async (answerId, voteType) => {
    try {
      console.log('voteService - Vote pour réponse:', { answerId, voteType });
      
      // VÉRIFICATION : S'assurer que le token est présent
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('voteService - Pas de token disponible');
        return {
          success: false,
          error: 'Non authentifié'
        };
      }

      const response = await api.post('/votes/answers', {
        answerId: answerId,
        vote_type: voteType
      });
      
      console.log('voteService - Réponse du vote:', response.data);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors du vote sur la réponse:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      
      // Gestion spécifique des erreurs d'authentification
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Session expirée',
          requiresAuth: true
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors du vote'
      };
    }
  },

  // Supprimer un vote
  deleteVote: async (voteId) => {
    try {
      const response = await api.delete(`/votes/${voteId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors de la suppression du vote:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la suppression du vote'
      };
    }
  }
};

export default voteService;