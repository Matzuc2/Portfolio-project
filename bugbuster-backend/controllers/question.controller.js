import Question from '../models/question.model.js';
import Answer from '../models/answer.model.js';
import User from '../models/user.model.js';

/**
 * Récupérer toutes les questions
 */
export const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.findAll({
      include: [
        {
          model: User,
          as: 'User', // CORRECTION : Utiliser l'alias défini
          attributes: ['Id', 'Username']
        }
      ],
      order: [['CreatedAt', 'DESC']]
    });
    
    res.status(200).json(questions);
  } catch (error) {
    console.error('Erreur dans getAllQuestions:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des questions' });
  }
};

/**
 * Récupérer une question par ID
 */
export const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'User', // CORRECTION : Utiliser l'alias défini
          attributes: ['Id', 'Username']
        }
      ]
    });
    
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
      where: { QuestionId: req.params.questionId }, // CORRECTION : QuestionId avec majuscule
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['Id', 'Username']
        }
      ]
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
    const { title, content } = req.body;
    const userId = req.user.Id; // CORRECTION : Utiliser Id avec majuscule

    const question = await Question.create({
      Title: title, // CORRECTION : Mapper vers Title
      Content: content, // CORRECTION : Mapper vers Content
      UserId: userId, // CORRECTION : Utiliser UserId
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
 * Mettre à jour une question
 */
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.Id; // CORRECTION

    const question = await Question.findByPk(id);
    
    if (!question) {
      return res.status(404).json({ error: 'Question non trouvée' });
    }
    
    if (question.UserId !== userId) { // CORRECTION : Utiliser UserId
      return res.status(403).json({ error: 'Non autorisé à modifier cette question' });
    }
    
    await question.update({ 
      Title: title, 
      Content: content 
    });
    
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
 * Supprimer une question
 */
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.Id; // CORRECTION

    const question = await Question.findByPk(id);
    
    if (!question) {
      return res.status(404).json({ error: 'Question non trouvée' });
    }
    
    if (question.UserId !== userId) { // CORRECTION : Utiliser UserId
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