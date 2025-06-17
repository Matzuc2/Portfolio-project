import { Model, DataTypes } from 'sequelize';

// This is a base class that other models can extend
export default class BaseModel extends Model {
  static init(attributes = {}, options = {}) {
    // Common attributes all models will have
    const baseAttributes = {
      Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'Id'
      },
      CreatedAt: {
        type: DataTypes.DATE,
      },
      UpdatedAt: {
        type: DataTypes.DATE,
      },
      DeletedAt: {
        type: DataTypes.DATE,
      },
      ...attributes  // Fusionner avec les attributs spécifiques au modèle
    };

    // Configurer les options avec les bons noms de champs
    const completeOptions = {
      ...options,
      timestamps: true,
      paranoid: true,
      createdAt: 'CreatedAt',
      updatedAt: 'UpdatedAt',
      deletedAt: 'DeletedAt'
    };

    return super.init(baseAttributes, completeOptions);
  }
  }