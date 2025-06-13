import { DataTypes } from 'sequelize';
import BaseModel from './base.model.js';
import sequelize from '../config/db.js';

class Vote extends BaseModel {}

Vote.init({
  vote_type: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Question',
        key: 'id'
      }
    },
    answerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Answer',
        key: 'id'
      }
    }
  },
  {
  sequelize,
  modelName: 'Vote',
  tableName: 'Vote',
  timestamps: true,
  paranoid: true,
  validate: {
    eitherQuestionOrAnswer() {
      if ((this.questionId === null && this.answerId === null) || 
          (this.questionId !== null && this.answerId !== null)) {
        throw new Error('Un vote doit être associé soit à une question, soit à une réponse, mais pas les deux ou aucun des deux');
      }
    }
  }
});

export default Vote;