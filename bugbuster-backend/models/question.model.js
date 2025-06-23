import { DataTypes } from 'sequelize';
import BaseModel from './base.model.js';
import sequelize from '../config/db.js';

class Question extends BaseModel {}

Question.init({
  // Ordre exact selon votre table
  Title: {                    // 5ème colonne
    type: DataTypes.STRING,
    allowNull: false
  },
  Content: {                  // 6ème colonne
    type: DataTypes.TEXT,
    allowNull: false
  },
  UserId: {                   // 7ème colonne
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'Id'
    }
  },
  CodeSnippet: {              // 8ème colonne
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Question',
  tableName: 'Questions',
  timestamps: true,
  paranoid: true
});

export default Question;
