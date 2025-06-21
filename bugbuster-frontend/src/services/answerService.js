import apiClient from './apiClient';

class AnswerService {
  async getAnswersByQuestionId(questionId) {
    try {
      const response = await apiClient.get(`/answers/question/${questionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la récupération des réponses'
      };
    }
  }

  async createAnswer(answerData) {
    try {
      const response = await apiClient.post('/answers', {
        content: answerData.content,
        questionId: answerData.questionId,
        code_snippet: answerData.codeContent || null
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la création de la réponse'
      };
    }
  }

  async updateAnswer(id, answerData) {
    try {
      const response = await apiClient.put(`/answers/${id}`, answerData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la mise à jour'
      };
    }
  }

  async deleteAnswer(id) {
    try {
      await apiClient.delete(`/answers/${id}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la suppression'
      };
    }
  }

  async acceptAnswer(answerId) {
    try {
      const response = await apiClient.post(`/answers/${answerId}/accept`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de l\'acceptation'
      };
    }
  }
}

export default new AnswerService();