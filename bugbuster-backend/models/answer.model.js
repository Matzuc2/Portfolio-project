import { DataTypes } from 'sequelize';
import BaseModel from './base.model.js';
import sequelize from '../config/db.js';

class Answer extends BaseModel {}

Answer.init({
  Body: {
    type: DataTypes.TEXT,
    allowNull: false
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
  }
},
{
  sequelize,
  modelName: 'Answer',
  tableName: 'Answers',
  timestamps: true,
  paranoid: true
});

export default Answer;