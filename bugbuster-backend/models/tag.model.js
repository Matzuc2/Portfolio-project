import { DataTypes } from 'sequelize';
import BaseModel from './base.model.js';
import sequelize from '../config/db.js';

class Tag extends BaseModel {}

Tag.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  sequelize,
  modelName: 'Tag',
  tableName: 'Tags',
  timestamps: true,
  paranoid: true
});

export default Tag;