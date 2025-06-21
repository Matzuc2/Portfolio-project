import sequelize from '../config/db.js';
import { DataTypes } from 'sequelize';
import BaseModel from './base.model.js';

class Question extends BaseModel {}

Question.init({
  Title: { // CORRECTION : Utiliser Title avec majuscule
    type: DataTypes.STRING,
    allowNull: false
  },
  Content: { // CORRECTION : Utiliser Content avec majuscule
    type: DataTypes.TEXT,
    allowNull: false
  },
  UserId: { // CORRECTION : Utiliser UserId avec majuscule pour cohérence
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'Id'
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
