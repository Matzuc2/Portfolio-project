import sequelize from '../config/db';
import { DataTypes } from 'sequelize/types';

const Question = sequelize.define('Question', {
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password_hash:{
    type: DataTypes.STRING,
    allowNull: false
  }
});

export default User;