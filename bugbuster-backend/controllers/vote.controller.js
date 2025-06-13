import Vote from '../models/vote.model.js';


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
        questionId: req.params.questionId,
        answerId: null 
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
      where: { answerId: req.params.answerId }
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
    const userId = req.user.id; // Supposant que vous avez un middleware d'authentification

    // Vérifier si l'utilisateur a déjà voté pour cette question
    const existingVote = await Vote.findOne({
      where: { 
        userId,
        questionId,
        answerId: null
      }
    });

    if (existingVote) {
      // Si le vote est identique, on le supprime (annulation du vote)
      if (existingVote.vote_type === vote_type) {
        await existingVote.destroy();
        return res.status(200).json({ message: 'Vote annulé' });
      } else {
        // Si le vote est différent, on le met à jour
        await existingVote.update({ vote_type });
        return res.status(200).json({ message: 'Vote mis à jour', vote: existingVote });
      }
    }

    // Créer un nouveau vote
    const newVote = await Vote.create({
      userId,
      questionId,
      answerId: null,
      vote_type
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
    const userId = req.user.id; // Supposant que vous avez un middleware d'authentification

    // Vérifier si l'utilisateur a déjà voté pour cette réponse
    const existingVote = await Vote.findOne({
      where: { 
        userId,
        answerId
      }
    });

    if (existingVote) {
      // Si le vote est identique, on le supprime (annulation du vote)
      if (existingVote.vote_type === vote_type) {
        await existingVote.destroy();
        return res.status(200).json({ message: 'Vote annulé' });
      } else {
        // Si le vote est différent, on le met à jour
        await existingVote.update({ vote_type });
        return res.status(200).json({ message: 'Vote mis à jour', vote: existingVote });
      }
    }

    // Créer un nouveau vote
    const newVote = await Vote.create({
      userId,
      questionId: null,
      answerId,
      vote_type
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
    const userId = req.user.id; // Supposant que vous avez un middleware d'authentification

    const vote = await Vote.findByPk(id);
    
    if (!vote) {
      return res.status(404).json({ error: 'Vote non trouvé' });
    }
    
    // Vérifiez que l'utilisateur est bien le propriétaire du vote
    if (vote.userId !== userId) {
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