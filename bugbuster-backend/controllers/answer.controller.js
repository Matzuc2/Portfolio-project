import Answer from '../models/answer.model.js';


/**
 * Récupérer toutes les réponses
 */
export const getAllAnswers = async (req, res) => {
  try {
    const answers = await Answer.findAll();
    res.status(200).json(answers);
  } catch (error) {
    console.error('Erreur dans getAllAnswers:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des réponses' });
  }
};

/**
 * Récupérer une réponse par ID
 */
export const getAnswerById = async (req, res) => {
  try {
    const answer = await Answer.findByPk(req.params.id);
    
    if (!answer) {
      return res.status(404).json({ error: 'Réponse non trouvée' });
    }
    
    res.status(200).json(answer);
  } catch (error) {
    console.error('Erreur dans getAnswerById:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la réponse' });
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
 * Créer une nouvelle réponse
 */
export const createAnswer = async (req, res) => {
  try {
    const { content, questionId } = req.body;
    const userId = req.user.id; // Supposant que vous avez un middleware d'authentification

    const answer = await Answer.create({
      content,
      userId,
      questionId
    });

    res.status(201).json({
      message: 'Réponse créée avec succès',
      answer
    });
  } catch (error) {
    console.error('Erreur dans createAnswer:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la réponse' });
  }
};

/**
 * Mettre à jour une réponse
 */
export const updateAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id; // Supposant que vous avez un middleware d'authentification

    const answer = await Answer.findByPk(id);
    
    if (!answer) {
      return res.status(404).json({ error: 'Réponse non trouvée' });
    }
    
    // Vérifiez que l'utilisateur est bien le propriétaire de la réponse
    if (answer.userId !== userId) {
      return res.status(403).json({ error: 'Non autorisé à modifier cette réponse' });
    }
    
    await answer.update({ content });
    
    res.status(200).json({
      message: 'Réponse mise à jour avec succès',
      answer
    });
  } catch (error) {
    console.error('Erreur dans updateAnswer:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la réponse' });
  }
};

/**
 * Supprimer une réponse
 */
export const deleteAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Supposant que vous avez un middleware d'authentification

    const answer = await Answer.findByPk(id);
    
    if (!answer) {
      return res.status(404).json({ error: 'Réponse non trouvée' });
    }
    
    // Vérifiez que l'utilisateur est bien le propriétaire de la réponse
    if (answer.userId !== userId) {
      return res.status(403).json({ error: 'Non autorisé à supprimer cette réponse' });
    }
    
    await answer.destroy();
    
    res.status(200).json({
      message: 'Réponse supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur dans deleteAnswer:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la réponse' });
  }
};