import sequelize from '../config/db.js';
import { DataTypes } from 'sequelize';
import BaseModel from './base.model.js';

class Question extends BaseModel {}

Question.init({
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // nom de la table
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Question',
  tableName: 'Questions',
  timestamps: true,
  paranoid: true
});

export default Question;
