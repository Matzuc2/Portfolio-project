import sequelize from '../config/db.js';
import { DataTypes } from 'sequelize';
import BaseModel from './base.model.js';
import bcrypt from 'bcrypt';

class User extends BaseModel {}

User.init({
  Username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  Email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  PasswordHash: {
    type: DataTypes.STRING,
    allowNull: false
  }
  // The id, createdAt, updatedAt, and deletedAt fields
  // will be automatically added by the BaseModel
},
{
  sequelize,
  modelName: 'User',
  tableName: 'Users',
  timestamps: true,
  paranoid: true
});

export default User;