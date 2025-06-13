import Question from '../models/question.model.js';
import Answer from '../models/answer.model.js';

/**
 * Récupérer une question par ID
 */
export const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id);
    
    if (!question) {
      return res.status(404).json({ error: 'Question non trouvée' });
    }
    
    res.status(200).json(question);
  } catch (error) {
    console.error('Erreur dans getQuestionById:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la question' });
  }
};

/**
 * Récupérer les réponses d'une question
 */
export const getAnswersByQuestionId = async (req, res) => {
  try {
    const answers = await Answer.findAll({
      where: { questionId: req.params.questionId }
    });
    
    res.status(200).json(answers);
  } catch (error) {
    console.error('Erreur dans getAnswersByQuestionId:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des réponses' });
  }
};

/**
 * Créer une nouvelle question
 */
export const createQuestion = async (req, res) => {
  try {
    const {title, content} = req.body;
    const userId = req.user.id; // Supposant que vous avez un middleware d'authentification

    const question = await Question.create({
      title,
      content,
      userId,
    });

    res.status(201).json({
      message: 'Question créée avec succès',
      question
    });
  } catch (error) {
    console.error('Erreur dans createQuestion:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la question' });
  }
};

/**
 * Mettre à jour une réponse
 */
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id; // Supposant que vous avez un middleware d'authentification

    const question = await Question.findByPk(id);
    
    if (!question) {
      return res.status(404).json({ error: 'Question non trouvée' });
    }
    
    // Vérifiez que l'utilisateur est bien le propriétaire de la réponse
    if (question.userId !== userId) {
      return res.status(403).json({ error: 'Non autorisé à modifier cette question' });
    }
    
    await question.update({ title, content });
    
    res.status(200).json({
      message: 'Question mise à jour avec succès',
      question
    });
  } catch (error) {
    console.error('Erreur dans updateQuestion:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la question' });
  }
};

/**
 * Supprimer une réponse
 */
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Supposant que vous avez un middleware d'authentification

    const question = await Question.findByPk(id);
    
    if (!question) {
      return res.status(404).json({ error: 'Question non trouvée' });
    }
    
    // Vérifiez que l'utilisateur est bien le propriétaire de la question
    if (question.userId !== userId) {
      return res.status(403).json({ error: 'Non autorisé à supprimer cette question' });
    }
    
    await question.destroy();
    
    res.status(200).json({
      message: 'Question supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur dans deleteQuestion:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la question' });
  }
};