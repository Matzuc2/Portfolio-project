// bugbuster-backend/scripts/create-tag-associations.js
import sequelize from '../config/db.js';
import Question from '../models/question.model.js';
import Tag from '../models/tag.model.js';
import '../models/associations.js';

async function createTagAssociations() {
  try {
    await sequelize.authenticate();
    console.log('=== CRÉATION DES ASSOCIATIONS TAGS ===');

    // 1. S'assurer que la table QuestionTags existe
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "QuestionTags" (
        "QuestionId" INTEGER NOT NULL,
        "TagId" INTEGER NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        PRIMARY KEY ("QuestionId", "TagId"),
        FOREIGN KEY ("QuestionId") REFERENCES "Questions"("Id") ON DELETE CASCADE,
        FOREIGN KEY ("TagId") REFERENCES "Tags"("Id") ON DELETE CASCADE
      );
    `);
    console.log('✅ Table QuestionTags vérifiée/créée');

    // 2. Créer des tags par défaut
    const defaultTags = [
      'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go',
      'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Django', 'Flask',
      'HTML', 'CSS', 'SASS', 'Bootstrap', 'Tailwind',
      'MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Redis',
      'Git', 'Docker', 'AWS', 'Azure', 'Linux', 'Windows',
      'API', 'REST', 'GraphQL', 'JSON', 'XML',
      'Debug', 'Performance', 'Security', 'Testing', 'Deployment'
    ];

    const createdTags = [];
    for (const tagName of defaultTags) {
      const [tag, created] = await Tag.findOrCreate({
        where: { name: tagName },
        defaults: { name: tagName }
      });
      createdTags.push(tag);
      if (created) {
        console.log(`✅ Tag créé: ${tagName}`);
      }
    }
    console.log(`✅ ${createdTags.length} tags disponibles`);

    // 3. Nettoyer les associations existantes
    await sequelize.query('DELETE FROM "QuestionTags";');
    console.log('🧹 Associations existantes supprimées');

    // 4. Associer des tags à TOUTES les questions existantes
    const questions = await Question.findAll();
    console.log(`📋 ${questions.length} questions trouvées`);

    for (const question of questions) {
      // Choisir 2-4 tags aléatoires
      const numTags = Math.floor(Math.random() * 3) + 2; // 2 à 4 tags
      const selectedTags = [];
      
      // Sélection aléatoire de tags uniques
      while (selectedTags.length < numTags && selectedTags.length < createdTags.length) {
        const randomTag = createdTags[Math.floor(Math.random() * createdTags.length)];
        if (!selectedTags.find(t => t.Id === randomTag.Id)) {
          selectedTags.push(randomTag);
        }
      }

      // Créer les associations avec setTags (méthode Sequelize)
      try {
        await question.setTags(selectedTags);
        console.log(`🏷️ Question ${question.Id}: ${selectedTags.map(t => t.name).join(', ')}`);
      } catch (error) {
        console.error(`❌ Erreur pour Question ${question.Id}:`, error.message);
        
        // Fallback : insertion directe
        for (const tag of selectedTags) {
          try {
            await sequelize.query(
              'INSERT INTO "QuestionTags" ("QuestionId", "TagId", "createdAt", "updatedAt") VALUES (?, ?, NOW(), NOW())',
              { replacements: [question.Id, tag.Id] }
            );
          } catch (insertError) {
            if (!insertError.message.includes('duplicate key')) {
              console.error(`❌ Erreur insertion Q${question.Id}-T${tag.Id}:`, insertError.message);
            }
          }
        }
      }
    }

    // 5. Vérification finale
    const [count] = await sequelize.query('SELECT COUNT(*) as count FROM "QuestionTags";');
    console.log(`\n✅ ${count[0].count} associations créées`);

    // 6. Test d'une question
    const testQuestion = await Question.findByPk(questions[0]?.Id, {
      include: [
        {
          model: Tag,
          as: 'Tags',
          attributes: ['Id', 'name'],
          through: { attributes: [] }
        }
      ]
    });
    
    console.log(`\n🧪 TEST - Question ${testQuestion.Id}:`);
    console.log(`Tags: ${testQuestion.Tags.map(t => t.name).join(', ')}`);

    console.log('\n🎉 Associations des tags créées avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createTagAssociations();