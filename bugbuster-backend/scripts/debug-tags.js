// bugbuster-backend/scripts/debug-tags.js
import sequelize from '../config/db.js';
import Question from '../models/question.model.js';
import Tag from '../models/tag.model.js';
import '../models/associations.js';

async function debugTags() {
  try {
    await sequelize.authenticate();
    console.log('=== DIAGNOSTIC COMPLET DES TAGS ===');

    // 1. Vérifier les tables
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('Tags', 'QuestionTags', 'Questions');
    `);
    console.log('Tables existantes:', tables.map(t => t.table_name));

    // 2. Vérifier le contenu de la table Tags
    const tags = await Tag.findAll();
    console.log(`\n=== TAGS DANS LA DB (${tags.length}) ===`);
    tags.forEach(tag => {
      console.log(`- Tag ID ${tag.Id}: "${tag.name}"`);
    });

    // 3. Vérifier le contenu de QuestionTags
    const [questionTags] = await sequelize.query('SELECT * FROM "QuestionTags" LIMIT 10;');
    console.log(`\n=== QUESTION_TAGS RELATIONS (${questionTags.length}) ===`);
    questionTags.forEach(qt => {
      console.log(`- Question ${qt.QuestionId} -> Tag ${qt.TagId}`);
    });

    // 4. Test d'association directe
    console.log('\n=== TEST ASSOCIATION DIRECTE ===');
    const questionWithTags = await Question.findByPk(15, {
      include: [
        {
          model: Tag,
          as: 'Tags',
          attributes: ['Id', 'name'],
          through: { attributes: [] }
        }
      ]
    });
    
    if (questionWithTags) {
      console.log(`Question 15 - Tags trouvés: ${questionWithTags.Tags?.length || 0}`);
      questionWithTags.Tags?.forEach(tag => {
        console.log(`  - ${tag.name}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

debugTags();