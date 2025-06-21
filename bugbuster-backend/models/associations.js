import User from './user.model.js';
import Question from './question.model.js';
import Answer from './answer.model.js';
import Vote from './vote.model.js';
import Tag from './tag.model.js';

// User associations
User.hasMany(Question, { 
  foreignKey: 'UserId',
  as: 'Questions'
});

User.hasMany(Answer, { 
  foreignKey: 'UserId',
  as: 'Answers'
});

User.hasMany(Vote, { 
  foreignKey: 'UserId',
  as: 'Votes'
});

// Question associations
Question.belongsTo(User, { 
  foreignKey: 'UserId',
  as: 'User'
});

Question.hasMany(Answer, { 
  foreignKey: 'QuestionId',
  as: 'Answers'
});

Question.hasMany(Vote, { 
  foreignKey: 'QuestionId',
  as: 'Votes'
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
  as: 'Question'
});

Answer.hasMany(Vote, { 
  foreignKey: 'AnswerId',
  as: 'Votes'
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

console.log('Associations configurées avec succès');

export {
  User,
  Question,
  Answer,
  Vote,
  Tag
};