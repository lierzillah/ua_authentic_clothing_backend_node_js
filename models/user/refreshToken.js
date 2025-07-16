const Sequelize = require('sequelize');
const sequelize = require('../../config').sequelize;

const RefreshTokens = sequelize.define(
  'RefreshTokens',
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: Sequelize.UUID,
      field: 'user_id',
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    token: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    expiresAt: {
      type: Sequelize.DATE,
      field: 'expires_at',
      allowNull: false,
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
    tableName: 'refresh_tokens',
    timestamps: true,
    underscored: true,
  },
);

module.exports = { RefreshTokens };
