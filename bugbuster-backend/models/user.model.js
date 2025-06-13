import sequelize from '../config/db.js';
import { DataTypes } from 'sequelize';
import BaseModel from './base.model.js';
import bcrypt from 'bcrypt';

class User extends BaseModel {}

User.init({
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  }
  // The id, createdAt, updatedAt, and deletedAt fields
  // will be automatically added by the BaseModel
},
{
  sequelize,
  modelName: 'User',
  tableName: 'User',
  timestamps: true,
  paranoid: true
});

// Hash du mot de passe avant création
User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

export default User;