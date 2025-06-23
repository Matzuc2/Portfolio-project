import User from './user.model.js';
import Question from './question.model.js';
import Answer from './answer.model.js';
import Tag from './tag.model.js';
import Vote from './vote.model.js';

// User associations
User.hasMany(Question, { 
  foreignKey: 'UserId',
  as: 'Questions',
  onDelete: 'CASCADE'
});

User.hasMany(Answer, { 
  foreignKey: 'UserId',
  as: 'Answers',
  onDelete: 'CASCADE'
});

User.hasMany(Vote, { 
  foreignKey: 'UserId',
  as: 'Votes',
  onDelete: 'CASCADE'
});

// Question associations
Question.belongsTo(User, { 
  foreignKey: 'UserId',
  as: 'User'
});

Question.hasMany(Answer, { 
  foreignKey: 'QuestionId',
  as: 'Answers',
  onDelete: 'CASCADE'
});

Question.hasMany(Vote, { 
  foreignKey: 'QuestionId',
  as: 'Votes',
  onDelete: 'CASCADE'
});

// Association many-to-many entre Questions et Tags
Question.belongsToMany(Tag, {
  through: 'QuestionTags',
  foreignKey: 'QuestionId',
  otherKey: 'TagId',
  as: 'Tags'
});

Tag.belongsToMany(Question, {
  through: 'QuestionTags',
  foreignKey: 'TagId',
  otherKey: 'QuestionId',
  as: 'Questions'
});

// Answer associations
Answer.belongsTo(User, { 
  foreignKey: 'UserId',
  as: 'User'
});

Answer.belongsTo(Question, { 
  foreignKey: 'QuestionId',
  as: 'Question' // IMPORTANT : Cette association est nécessaire pour l'acceptation
});

Answer.hasMany(Vote, { 
  foreignKey: 'AnswerId',
  as: 'Votes',
  onDelete: 'CASCADE'
});

// Vote associations
Vote.belongsTo(User, { 
  foreignKey: 'UserId',
  as: 'User'
});

Vote.belongsTo(Question, { 
  foreignKey: 'QuestionId',
  as: 'Question'
});

Vote.belongsTo(Answer, { 
  foreignKey: 'AnswerId',
  as: 'Answer'
});

export { User, Question, Answer, Tag, Vote };