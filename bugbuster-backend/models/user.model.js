import { DataTypes } from 'sequelize/types';
import { DataTypes } from '../config/db';

const User = sequelize.define('User', {
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