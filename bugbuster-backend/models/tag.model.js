import { DataTypes } from 'sequelize/types';
import sequelize from '../config/db';
import { DataTypes } from 'sequelize';

const Tag = sequelize.define('Tag', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

export default Tag;