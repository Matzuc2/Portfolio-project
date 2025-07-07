// bugbuster-backend/models/questionTag.model.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

class QuestionTag {}

QuestionTag.init = () => {
  // Ce modèle est géré automatiquement par Sequelize pour les associations Many-to-Many
};

// Table de liaison simple
const QuestionTagTable = sequelize.define('QuestionTag', {
  QuestionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Questions',
      key: 'Id'
    }
  },
  TagId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Tags', 
      key: 'Id'
    }
  }
}, {
  tableName: 'QuestionTags',
  timestamps: true,
  paranoid: true
});

export default QuestionTagTable;