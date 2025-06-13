import { DataTypes } from 'sequelize';
import BaseModel from './base.model.js';
import sequelize from '../config/db.js';

class Answer extends BaseModel {}

Answer.init(sequelize, 'Answer', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Questions',
      key: 'id'
    }
  }
},
{
  sequelize,
  modelName: 'Answer',
  tableName: 'Answer',
  timestamps: true,
  paranoid: true
});

export default Answer;