import { DataTypes } from 'sequelize';
import BaseModel from './base.model.js';
import sequelize from '../config/db.js';

class Answer extends BaseModel {}

Answer.init({
  Body: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  CodeSnippet: { // AJOUT : Champ pour le code
    type: DataTypes.TEXT,
    allowNull: true
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'Id'
    }
  },
  QuestionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Questions',
      key: 'Id'
    }
  },
  IsAccepted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'Answer',
  tableName: 'Answers',
  timestamps: true,
  paranoid: true
});

export default Answer;