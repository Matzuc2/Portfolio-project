// bugbuster-backend/scripts/delete-user.js
import sequelize from '../config/db.js';
import User from '../models/user.model.js';
import Question from '../models/question.model.js';
import Answer from '../models/answer.model.js';
import Vote from '../models/vote.model.js';
import '../models/associations.js';

async function deleteUser(userId) {
  try {
    await sequelize.authenticate();
    console.log(`=== SUPPRESSION DE L'UTILISATEUR ${userId} ===`);

    // 1. Vérifier que l'utilisateur existe
    const user = await User.findByPk(userId);
    if (!user) {
      console.log(`❌ Utilisateur avec ID ${userId} introuvable`);
      process.exit(1);
    }

    console.log(`👤 Utilisateur trouvé: ${user.Username} (${user.Email})`);

    // 2. Compter les données associées
    const questionCount = await Question.count({ where: { UserId: userId } });
    const answerCount = await Answer.count({ where: { UserId: userId } });
    const voteCount = await Vote.count({ where: { UserId: userId } });

    console.log(`📊 Données à supprimer:`);
    console.log(`   - Questions: ${questionCount}`);
    console.log(`   - Réponses: ${answerCount}`);
    console.log(`   - Votes: ${voteCount}`);

    // 3. Supprimer dans l'ordre (à cause des contraintes FK)
    
    // Supprimer les associations tags des questions de l'utilisateur
    console.log('🗑️ Suppression des associations tags...');
    await sequelize.query(`
      DELETE FROM "QuestionTags" 
      WHERE "QuestionId" IN (
        SELECT "Id" FROM "Questions" WHERE "UserId" = ?
      )
    `, { replacements: [userId] });

    // Supprimer les votes de l'utilisateur
    console.log('🗑️ Suppression des votes...');
    await Vote.destroy({ where: { UserId: userId } });

    // Supprimer les votes sur les réponses de l'utilisateur
    console.log('🗑️ Suppression des votes sur les réponses...');
    await sequelize.query(`
      DELETE FROM "Votes" 
      WHERE "AnswerId" IN (
        SELECT "Id" FROM "Answers" WHERE "UserId" = ?
      )
    `, { replacements: [userId] });

    // Supprimer les votes sur les questions de l'utilisateur
    console.log('🗑️ Suppression des votes sur les questions...');
    await sequelize.query(`
      DELETE FROM "Votes" 
      WHERE "QuestionId" IN (
        SELECT "Id" FROM "Questions" WHERE "UserId" = ?
      )
    `, { replacements: [userId] });

    // Supprimer les réponses de l'utilisateur
    console.log('🗑️ Suppression des réponses...');
    await Answer.destroy({ where: { UserId: userId } });

    // Supprimer les réponses aux questions de l'utilisateur
    console.log('🗑️ Suppression des réponses aux questions...');
    await sequelize.query(`
      DELETE FROM "Answers" 
      WHERE "QuestionId" IN (
        SELECT "Id" FROM "Questions" WHERE "UserId" = ?
      )
    `, { replacements: [userId] });

    // Supprimer les questions de l'utilisateur
    console.log('🗑️ Suppression des questions...');
    await Question.destroy({ where: { UserId: userId } });

    // Supprimer l'utilisateur
    console.log('🗑️ Suppression de l\'utilisateur...');
    await User.destroy({ where: { Id: userId } });

    console.log(`✅ Utilisateur ${userId} et toutes ses données supprimés avec succès !`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
    process.exit(1);
  }
}

// Supprimer l'utilisateur ID 1
deleteUser(5);