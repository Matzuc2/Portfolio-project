import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite' // Spécifiez le chemin où votre base de données SQLite sera stockée.
});

export default sequelize;