import Question from '../models/question.model.js';
import Answer from '../models/answer.model.js';
import User from '../models/user.model.js';
import Vote from '../models/vote.model.js';
import Tag from '../models/tag.model.js';

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
          attributes: ['Id', 'Username']
        },
        {
          model: Tag,
          as: 'Tags',
          attributes: ['Id', 'name'], // CORRECTION : 'name' en minuscule
          through: { attributes: [] }
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
 * Récupérer toutes les questions avec statistiques
 */
export const getAllQuestions = async (req, res) => {
  try {
    console.log('=== RÉCUPÉRATION DES QUESTIONS AVEC TAGS ===');
    
    const questions = await Question.findAll({
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['Id', 'Username']
        },
        {
          model: Tag,
          as: 'Tags',
          attributes: ['Id', 'name'],
          through: { attributes: [] } // Exclure les attributs de QuestionTags
        }
      ],
      order: [['CreatedAt', 'DESC']]
    });

    console.log('Questions trouvées:', questions.length);
    if (questions.length > 0) {
      console.log('Premier exemple avec tags:', JSON.stringify({
        id: questions[0].Id,
        title: questions[0].Title,
        tags: questions[0].Tags?.map(tag => tag.name) || []
      }, null, 2));
    }

    // Calculer les statistiques pour chaque question
    const questionsWithStats = await Promise.all(questions.map(async (question) => {
      const answerCount = await Answer.count({
        where: { QuestionId: question.Id }
      });

      const questionVotes = await Vote.findAll({
        where: { 
          QuestionId: question.Id,
          AnswerId: null 
        }
      });

      const questionUpvotes = questionVotes.filter(vote => vote.VoteType === true).length;
      const questionDownvotes = questionVotes.filter(vote => vote.VoteType === false).length;

      const answers = await Answer.findAll({
        where: { QuestionId: question.Id },
        attributes: ['Id']
      });

      let totalAnswerVotes = 0;
      for (const answer of answers) {
        const answerVotes = await Vote.findAll({
          where: { AnswerId: answer.Id }
        });
        const answerUpvotes = answerVotes.filter(vote => vote.VoteType === true).length;
        const answerDownvotes = answerVotes.filter(vote => vote.VoteType === false).length;
        totalAnswerVotes += (answerUpvotes - answerDownvotes);
      }

      const hasAcceptedAnswer = await Answer.count({
        where: { 
          QuestionId: question.Id,
          IsAccepted: true 
        }
      }) > 0;

      const questionScore = questionUpvotes - questionDownvotes;
      const answerBonus = answerCount * 3;
      const totalScore = questionScore + answerBonus + totalAnswerVotes;

      const questionData = {
        ...question.toJSON(),
        stats: {
          answerCount,
          questionUpvotes,
          questionDownvotes,
          questionScore,
          totalAnswerVotes,
          totalScore,
          hasAcceptedAnswer
        }
      };

      console.log(`Question ${question.Id} - Tags:`, questionData.Tags?.map(t => t.name) || []);
      
      return questionData;
    }));

    questionsWithStats.sort((a, b) => b.stats.totalScore - a.stats.totalScore);
    
    console.log('=== RÉPONSE ENVOYÉE ===');
    res.status(200).json(questionsWithStats);
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
          attributes: ['Id', 'Username']
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
 * Créer une nouvelle question AVEC tags
 */
export const createQuestion = async (req, res) => {
  try {
    console.log('=== CRÉATION DE QUESTION AVEC TAGS ===');
    console.log('Données reçues:', req.body);

    const userId = req.user.Id;
    const title = req.body.title || req.body.Title;
    const content = req.body.content || req.body.Content;
    const codeSnippet = req.body.codeSnippet || req.body.CodeSnippet;
    const tags = req.body.tags || []; // AJOUT : Récupérer les tags

    console.log('Données extraites:', { userId, title, content, codeSnippet, tags });

    // Validation des données
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    if (!title || !content) {
      return res.status(400).json({ error: 'Le titre et le contenu sont obligatoires' });
    }

    // 1. CRÉER LA QUESTION
    const questionData = {
      Title: title,
      Content: content,
      UserId: userId,
      CodeSnippet: codeSnippet || null
    };

    console.log('Création de la question...');
    const question = await Question.create(questionData);
    console.log('Question créée avec ID:', question.Id);

    // 2. GÉRER LES TAGS
    if (tags && tags.length > 0) {
      console.log('Traitement des tags:', tags);
      
      const tagInstances = [];
      
      for (const tagName of tags) {
        // Trouver ou créer le tag
        const [tag, created] = await Tag.findOrCreate({
          where: { name: tagName },
          defaults: { name: tagName }
        });
        
        console.log(`Tag "${tagName}":`, created ? 'créé' : 'trouvé', 'ID:', tag.Id);
        tagInstances.push(tag);
      }
      
      // Associer les tags à la question
      await question.setTags(tagInstances);
      console.log('Tags associés à la question');
    }

    // 3. RÉCUPÉRER LA QUESTION COMPLÈTE AVEC TAGS
    const questionWithTags = await Question.findByPk(question.Id, {
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['Id', 'Username']
        },
        {
          model: Tag,
          as: 'Tags',
          attributes: ['Id', 'name'],
          through: { attributes: [] }
        }
      ]
    });

    console.log('Question créée avec tags:', {
      id: questionWithTags.Id,
      title: questionWithTags.Title,
      tags: questionWithTags.Tags.map(tag => tag.name)
    });

    res.status(201).json({
      message: 'Question créée avec succès',
      question: questionWithTags
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
    const { title, content, codeSnippet } = req.body;
    const userId = req.user.Id;

    console.log('Mise à jour de la question:', { id, userId, title, content, codeSnippet });

    const question = await Question.findByPk(id);
    
    if (!question) {
      return res.status(404).json({ error: 'Question non trouvée' });
    }
    
    // VÉRIFICATION: Seul l'auteur peut modifier
    if (question.UserId !== userId) {
      return res.status(403).json({ 
        error: 'Vous n\'êtes pas autorisé à modifier cette question' 
      });
    }

    // Validation des données
    if (!title || !content) {
      return res.status(400).json({ 
        error: 'Le titre et le contenu sont obligatoires' 
      });
    }
    
    await question.update({ 
      Title: title, 
      Content: content,
      CodeSnippet: codeSnippet || null
    });

    // Récupérer la question mise à jour avec les données utilisateur
    const updatedQuestion = await Question.findByPk(id, {
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['Id', 'Username']
        }
      ]
    });
    
    res.status(200).json({
      message: 'Question mise à jour avec succès',
      question: updatedQuestion
    });
  } catch (error) {
    console.error('Erreur dans updateQuestion:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour de la question',
      details: error.message 
    });
  }
};

/**
 * Supprimer une question
 */
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.Id;

    console.log('Suppression de la question:', { id, userId });

    const question = await Question.findByPk(id);
    
    if (!question) {
      return res.status(404).json({ error: 'Question non trouvée' });
    }
    
    // VÉRIFICATION: Seul l'auteur peut supprimer
    if (question.UserId !== userId) {
      return res.status(403).json({ 
        error: 'Vous n\'êtes pas autorisé à supprimer cette question' 
      });
    }
    
    await question.destroy();
    
    res.status(200).json({
      message: 'Question supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur dans deleteQuestion:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la suppression de la question',
      details: error.message 
    });
  }
};