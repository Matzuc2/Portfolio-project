import Question from '../models/question.model.js';
import Answer from '../models/answer.model.js';
import User from '../models/user.model.js';

/**
 * Récupérer une question par ID
 */
export const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['Id', 'Username'] // CORRECTION : Seulement Id et Username, PAS d'Email
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
 * Récupérer toutes les questions
 */
export const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.findAll({
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['Id', 'Username'] // CORRECTION : Seulement Username
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
 * Récupérer les réponses d'une question
 */
export const getAnswersByQuestionId = async (req, res) => {
  try {
    const answers = await Answer.findAll({
      where: { QuestionId: req.params.questionId },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['Id', 'Username'] // CORRECTION : Seulement Username
        }
      ],
      order: [
        ['IsAccepted', 'DESC'],
        ['CreatedAt', 'DESC']
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
    console.log('=== CRÉATION DE QUESTION ===');
    console.log('Données reçues pour créer une question:', req.body);
    console.log('Utilisateur authentifié:', req.user);

    // CORRECTION : Mapper dans l'ordre exact de la table
    const userId = req.user.Id;          // UserId en premier (nécessaire pour validation)
    const title = req.body.title || req.body.Title;
    const content = req.body.content || req.body.Content;
    const codeSnippet = req.body.codeSnippet || req.body.CodeSnippet;

    console.log('Champs extraits (ordre exact de la table):');
    console.log('- userId:', userId);
    console.log('- title:', title);
    console.log('- content:', content);
    console.log('- codeSnippet:', codeSnippet);

    // Validation des données
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    if (!title || !content) {
      return res.status(400).json({ error: 'Le titre et le contenu sont obligatoires' });
    }

    // CORRECTION : Créer avec l'ordre exact des champs de la table
    const questionData = {
      Title: title,           // 5ème position
      Content: content,       // 6ème position  
      UserId: userId,         // 7ème position
      CodeSnippet: codeSnippet || null  // 8ème position
    };

    console.log('Données pour la création en DB (ordre respecté):', questionData);

    const question = await Question.create(questionData);

    console.log('Question créée avec succès:', question.toJSON());

    res.status(201).json({
      message: 'Question créée avec succès',
      question
    });
  } catch (error) {
    console.error('Erreur dans createQuestion:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création de la question',
      details: error.message 
    });
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