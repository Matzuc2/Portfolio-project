import sequelize from '../config/db.js';
import '../models/associations.js';

async function resetDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie.');
    
    // Supprimer toutes les tables avec CASCADE pour éviter les erreurs de contraintes
    await sequelize.drop({ cascade: true });
    console.log('Tables supprimées avec CASCADE.');
    
    // Recréer les tables
    await sequelize.sync({ force: true });
    console.log('Tables recréées avec succès.');
    
    console.log('Base de données réinitialisée !');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    process.exit(1);
  }
}

resetDatabase();