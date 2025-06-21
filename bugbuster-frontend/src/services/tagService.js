import apiClient from './apiClient';

class TagService {
  async getAllTags() {
    try {
      const response = await apiClient.get('/tags');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la récupération des tags'
      };
    }
  }

  async createTag(name) {
    try {
      const response = await apiClient.post('/tags', { name });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la création du tag'
      };
    }
  }

  async getQuestionsByTag(tagId) {
    try {
      const response = await apiClient.get(`/tags/${tagId}/questions`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la récupération des questions'
      };
    }
  }
}

export default new TagService();