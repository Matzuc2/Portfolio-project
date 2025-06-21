import apiClient from './apiClient';

class VoteService {
  async getVotesByQuestionId(questionId) {
    try {
      const response = await apiClient.get(`/votes/questions/${questionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la récupération des votes'
      };
    }
  }

  async getVotesByAnswerId(answerId) {
    try {
      const response = await apiClient.get(`/votes/answers/${answerId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la récupération des votes'
      };
    }
  }

  async voteQuestion(questionId, voteType) {
    try {
      const response = await apiClient.post('/votes/questions', {
        questionId,
        vote_type: voteType
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors du vote'
      };
    }
  }

  async voteAnswer(answerId, voteType) {
    try {
      const response = await apiClient.post('/votes/answers', {
        answerId,
        vote_type: voteType
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors du vote'
      };
    }
  }

  async deleteVote(voteId) {
    try {
      await apiClient.delete(`/votes/${voteId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de l\'annulation du vote'
      };
    }
  }
}

export default new VoteService();