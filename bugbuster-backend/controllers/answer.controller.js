import Answer from '../models/answer.model.js';
import User from '../models/user.model.js';
import Question from '../models/question.model.js';

/**
 * Récupérer toutes les réponses
 */
export const getAllAnswers = async (req, res) => {
  try {
    const answers = await Answer.findAll({
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['Id', 'Username']
        }
      ],
      order: [['CreatedAt', 'DESC']]
    });
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
    const answer = await Answer.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['Id', 'Username']
        }
      ]
    });
    
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
      where: { QuestionId: req.params.questionId }, // CORRECTION : Utiliser QuestionId avec majuscule
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['Id', 'Username']
        }
      ],
      order: [['CreatedAt', 'DESC']]
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
    console.log('Données reçues pour créer une réponse:', req.body);
    console.log('Utilisateur authentifié:', req.user);

    const { content, questionId, codeSnippet } = req.body;
    const userId = req.user.Id;

    // Validation des données
    if (!content || !questionId) {
      return res.status(400).json({ error: 'Le contenu et l\'ID de la question sont obligatoires' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    // CORRECTION : Créer la réponse avec CodeSnippet
    const answer = await Answer.create({
      Body: content,
      UserId: userId,
      QuestionId: questionId,
      CodeSnippet: codeSnippet || null, // AJOUT : Gérer le code snippet
      IsAccepted: false
    });

    console.log('Réponse créée avec succès:', answer);

    // Récupérer la réponse avec les données utilisateur
    const answerWithUser = await Answer.findByPk(answer.Id, {
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['Id', 'Username'] // CORRECTION : Seulement Username
        }
      ]
    });

    res.status(201).json({
      message: 'Réponse créée avec succès',
      answer: answerWithUser
    });
  } catch (error) {
    console.error('Erreur dans createAnswer:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création de la réponse',
      details: error.message 
    });
  }
};

/**
 * Mettre à jour une réponse
 */
export const updateAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, codeSnippet } = req.body; // AJOUT: codeSnippet
    const userId = req.user.Id;

    console.log('Mise à jour de la réponse:', { id, userId, content, codeSnippet });

    const answer = await Answer.findByPk(id);
    
    if (!answer) {
      return res.status(404).json({ error: 'Réponse non trouvée' });
    }
    
    // VÉRIFICATION: Seul l'auteur peut modifier
    if (answer.UserId !== userId) {
      return res.status(403).json({ 
        error: 'Vous n\'êtes pas autorisé à modifier cette réponse' 
      });
    }

    // Validation des données
    if (!content) {
      return res.status(400).json({ 
        error: 'Le contenu est obligatoire' 
      });
    }
    
    await answer.update({ 
      Body: content,
      CodeSnippet: codeSnippet || null // AJOUT: Mise à jour du code snippet
    });

    // Récupérer la réponse mise à jour avec les données utilisateur
    const updatedAnswer = await Answer.findByPk(id, {
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['Id', 'Username']
        }
      ]
    });
    
    res.status(200).json({
      message: 'Réponse mise à jour avec succès',
      answer: updatedAnswer
    });
  } catch (error) {
    console.error('Erreur dans updateAnswer:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour de la réponse',
      details: error.message 
    });
  }
};

/**
 * Supprimer une réponse
 */
export const deleteAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.Id;

    console.log('Suppression de la réponse:', { id, userId });

    const answer = await Answer.findByPk(id);
    
    if (!answer) {
      return res.status(404).json({ error: 'Réponse non trouvée' });
    }
    
    // VÉRIFICATION: Seul l'auteur peut supprimer
    if (answer.UserId !== userId) {
      return res.status(403).json({ 
        error: 'Vous n\'êtes pas autorisé à supprimer cette réponse' 
      });
    }
    
    await answer.destroy();
    
    res.status(200).json({
      message: 'Réponse supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur dans deleteAnswer:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la suppression de la réponse',
      details: error.message 
    });
  }
};

/**
 * Accepter une réponse (seul l'auteur de la question peut le faire)
 */
export const acceptAnswer = async (req, res) => {
  try {
    const { id } = req.params; // ID de la réponse
    const userId = req.user.Id;

    console.log('Tentative d\'acceptation de la réponse:', { answerId: id, userId });

    // Récupérer la réponse avec la question associée
    const answer = await Answer.findByPk(id, {
      include: [
        {
          model: Question,
          as: 'Question',
          attributes: ['Id', 'UserId']
        }
      ]
    });

    if (!answer) {
      return res.status(404).json({ error: 'Réponse non trouvée' });
    }

    // Vérifier que l'utilisateur connecté est bien l'auteur de la question
    if (answer.Question.UserId !== userId) {
      return res.status(403).json({ 
        error: 'Seul l\'auteur de la question peut accepter les réponses' 
      });
    }

    // Mettre à jour le statut d'acceptation
    await answer.update({ IsAccepted: true });

    console.log('Réponse acceptée avec succès:', answer.Id);

    // Récupérer la réponse mise à jour avec les données utilisateur
    const updatedAnswer = await Answer.findByPk(answer.Id, {
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['Id', 'Username'] // CORRECTION : Seulement Username
        }
      ]
    });

    res.status(200).json({
      message: 'Réponse acceptée avec succès',
      answer: updatedAnswer
    });
  } catch (error) {
    console.error('Erreur dans acceptAnswer:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'acceptation de la réponse',
      details: error.message 
    });
  }
};

/**
 * Désaccepter une réponse (seul l'auteur de la question peut le faire)
 */
export const unacceptAnswer = async (req, res) => {
  try {
    const { id } = req.params; // ID de la réponse
    const userId = req.user.Id;

    console.log('Tentative de désacceptation de la réponse:', { answerId: id, userId });

    // Récupérer la réponse avec la question associée
    const answer = await Answer.findByPk(id, {
      include: [
        {
          model: Question,
          as: 'Question',
          attributes: ['Id', 'UserId']
        }
      ]
    });

    if (!answer) {
      return res.status(404).json({ error: 'Réponse non trouvée' });
    }

    // Vérifier que l'utilisateur connecté est bien l'auteur de la question
    if (answer.Question.UserId !== userId) {
      return res.status(403).json({ 
        error: 'Seul l\'auteur de la question peut modifier l\'acceptation des réponses' 
      });
    }

    // Mettre à jour le statut d'acceptation
    await answer.update({ IsAccepted: false });

    console.log('Réponse désacceptée avec succès:', answer.Id);

    // Récupérer la réponse mise à jour avec les données utilisateur
    const updatedAnswer = await Answer.findByPk(answer.Id, {
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['Id', 'Username'] // CORRECTION : Seulement Username
        }
      ]
    });

    res.status(200).json({
      message: 'Acceptation de la réponse annulée',
      answer: updatedAnswer
    });
  } catch (error) {
    console.error('Erreur dans unacceptAnswer:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'annulation de l\'acceptation',
      details: error.message 
    });
  }
};