import sequelize from '../config/db.js';
import { DataTypes } from 'sequelize';
import BaseModel from './base.model.js';

class Tag extends BaseModel {}

Tag.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
  // The id, createdAt, updatedAt, and deletedAt fields
  // will be automatically added by the BaseModel
}, {
  sequelize,
  modelName: 'Tag',
  tableName: 'Tags',
  timestamps: true,
  paranoid: true
});

export default Tag;