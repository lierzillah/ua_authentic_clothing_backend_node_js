const Sequelize = require('sequelize');
const sequelize = require('../../config').sequelize;

const Statistic = sequelize.define(
  'Statistic',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    exhibitsId: {
      type: Sequelize.INTEGER,
      field: 'exhibits_id',
    },
    userType: {
      type: Sequelize.ENUM('USER', 'GUEST'),
      field: 'user_type',
    },
    userId: {
      type: Sequelize.STRING,
      field: 'user_id',
    },
    ip: {
      type: Sequelize.STRING,
    },
    createdAt: {
      type: Sequelize.DATE,
      field: 'created_at',
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      type: Sequelize.DATE,
      field: 'updated_at',
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    schema: 'public',
    tableName: 'exhibits_views',
    timestamps: true,
    underscored: true,
  },
);

module.exports = { Statistic };
