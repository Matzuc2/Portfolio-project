import { Model, DataTypes } from 'sequelize';

// This is a base class that other models can extend
export default class BaseModel extends Model {
  static init(attributes = {}, options = {}) {
    // Common attributes all models will have
    const baseAttributes = {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      ...attributes  // Fusionner avec les attributs spécifiques au modèle
    };

    return super.init(baseAttributes, options);
  }
  }