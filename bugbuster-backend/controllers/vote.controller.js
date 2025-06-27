import Vote from '../models/vote.model.js';
import Question from '../models/question.model.js';
import Answer from '../models/answer.model.js';

/**
 * Récupérer tous les votes
 */
export const getAllVotes = async (req, res) => {
  try {
    const votes = await Vote.findAll();
    res.status(200).json(votes);
  } catch (error) {
    console.error('Erreur dans getAllVotes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des votes' });
  }
};

/**
 * Récupérer un vote par ID
 */
export const getVoteById = async (req, res) => {
  try {
    const vote = await Vote.findByPk(req.params.id);
    
    if (!vote) {
      return res.status(404).json({ error: 'Vote non trouvé' });
    }
    
    res.status(200).json(vote);
  } catch (error) {
    console.error('Erreur dans getVoteById:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du vote' });
  }
};

/**
 * Récupérer les votes d'une question
 */
export const getVotesByQuestionId = async (req, res) => {
  try {
    const votes = await Vote.findAll({
      where: { 
        QuestionId: req.params.questionId,
        AnswerId: null 
      }
    });
    
    res.status(200).json(votes);
  } catch (error) {
    console.error('Erreur dans getVotesByQuestionId:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des votes' });
  }
};

/**
 * Récupérer les votes d'une réponse
 */
export const getVotesByAnswerId = async (req, res) => {
  try {
    const votes = await Vote.findAll({
      where: { AnswerId: req.params.answerId }
    });
    
    res.status(200).json(votes);
  } catch (error) {
    console.error('Erreur dans getVotesByAnswerId:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des votes' });
  }
};

/**
 * Créer un vote pour une question
 */
export const voteQuestion = async (req, res) => {
  try {
    const { questionId, vote_type } = req.body;
    const userId = req.user.Id;

    console.log('Vote data:', { questionId, vote_type, userId });

    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    // VALIDATION : Vérifier que la question existe
    const question = await Question.findByPk(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question non trouvée' });
    }

    // VALIDATION : Empêcher l'auto-vote
    if (question.UserId === userId) {
      return res.status(400).json({ error: 'Vous ne pouvez pas voter pour votre propre question' });
    }

    // Vérifier si l'utilisateur a déjà voté pour cette question
    const existingVote = await Vote.findOne({
      where: { 
        UserId: userId,
        QuestionId: questionId,
        AnswerId: null
      }
    });

    if (existingVote) {
      // Si le vote est identique, on le supprime (annulation du vote)
      if (existingVote.VoteType === vote_type) {
        await existingVote.destroy();
        return res.status(200).json({ message: 'Vote annulé' });
      } else {
        // Si le vote est différent, on le met à jour
        await existingVote.update({ VoteType: vote_type });
        return res.status(200).json({ message: 'Vote mis à jour', vote: existingVote });
      }
    }

    // Créer un nouveau vote
    const newVote = await Vote.create({
      UserId: userId,
      QuestionId: questionId,
      AnswerId: null,
      VoteType: vote_type
    });

    res.status(201).json({
      message: 'Vote enregistré avec succès',
      vote: newVote
    });
  } catch (error) {
    console.error('Erreur dans voteQuestion:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du vote' });
  }
};

/**
 * Créer un vote pour une réponse
 */
export const voteAnswer = async (req, res) => {
  try {
    const { answerId, vote_type } = req.body;
    const userId = req.user.Id;

    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    // VALIDATION : Vérifier que la réponse existe
    const answer = await Answer.findByPk(answerId);
    if (!answer) {
      return res.status(404).json({ error: 'Réponse non trouvée' });
    }

    // VALIDATION : Empêcher l'auto-vote
    if (answer.UserId === userId) {
      return res.status(400).json({ error: 'Vous ne pouvez pas voter pour votre propre réponse' });
    }

    // Vérifier si l'utilisateur a déjà voté pour cette réponse
    const existingVote = await Vote.findOne({
      where: { 
        UserId: userId,
        AnswerId: answerId
      }
    });

    if (existingVote) {
      // Si le vote est identique, on le supprime (annulation du vote)
      if (existingVote.VoteType === vote_type) {
        await existingVote.destroy();
        return res.status(200).json({ message: 'Vote annulé' });
      } else {
        // Si le vote est différent, on le met à jour
        await existingVote.update({ VoteType: vote_type });
        return res.status(200).json({ message: 'Vote mis à jour', vote: existingVote });
      }
    }

    // Créer un nouveau vote
    const newVote = await Vote.create({
      UserId: userId,
      QuestionId: null,
      AnswerId: answerId,
      VoteType: vote_type
    });

    res.status(201).json({
      message: 'Vote enregistré avec succès',
      vote: newVote
    });
  } catch (error) {
    console.error('Erreur dans voteAnswer:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du vote' });
  }
};

/**
 * Supprimer un vote
 */
export const deleteVote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.Id; // CORRECTION

    const vote = await Vote.findByPk(id);
    
    if (!vote) {
      return res.status(404).json({ error: 'Vote non trouvé' });
    }
    
    // Vérifiez que l'utilisateur est bien le propriétaire du vote
    if (vote.UserId !== userId) { // CORRECTION
      return res.status(403).json({ error: 'Non autorisé à supprimer ce vote' });
    }
    
    await vote.destroy();
    
    res.status(200).json({
      message: 'Vote supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur dans deleteVote:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du vote' });
  }
};