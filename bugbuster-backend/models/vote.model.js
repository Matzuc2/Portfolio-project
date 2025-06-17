import { DataTypes } from 'sequelize';
import BaseModel from './base.model.js';
import sequelize from '../config/db.js';

class Vote extends BaseModel {}

Vote.init({
  VoteType: {
    type: DataTypes.BOOLEAN,
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
      allowNull: true,
      references: {
        model: 'Questions',
        key: 'Id'
      }
    },
    AnswerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Answers',
        key: 'Id'
      }
    }
  },
  {
  sequelize,
  modelName: 'Vote',
  tableName: 'Votes',
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