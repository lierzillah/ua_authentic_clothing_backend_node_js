const Sequelize = require('sequelize');
const sequelize = require('../../config').sequelize;

const ExhibitViews = sequelize.define(
  'ExhibitViews',
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    exhibitId: {
      type: Sequelize.UUID,
      field: 'exhibit_id',
      allowNull: false,
      references: {
        model: 'exhibits',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    userType: {
      type: Sequelize.ENUM('USER', 'GUEST'),
      field: 'user_type',
      allowNull: false,
    },
    action: {
      type: Sequelize.ENUM('VIEW', 'CREATED_PHOTO'),
      allowNull: false,
    },
    userId: {
      type: Sequelize.UUID,
      field: 'user_id',
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    ip: {
      type: Sequelize.STRING(64),
      allowNull: true,
    },
    createdAt: {
      type: Sequelize.DATE,
      field: 'created_at',
      allowNull: false,
      defaultValue: Sequelize.literal('NOW()'),
    },
    updatedAt: {
      type: Sequelize.DATE,
      field: 'updated_at',
      allowNull: false,
      defaultValue: Sequelize.literal('NOW()'),
    },
  },
  {
    tableName: 'exhibit_views',
    schema: 'public',
    timestamps: true,
    underscored: true,
  },
);

module.exports = { ExhibitViews };
