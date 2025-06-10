import sequelize from '../config/db';
import { DataTypes } from '../config/db';

const Vote = sequelize.define('Vote', {
  vote_type: {
    type: DataTypes.BOOL,
    allowNull: false
  }
});

export default Vote;