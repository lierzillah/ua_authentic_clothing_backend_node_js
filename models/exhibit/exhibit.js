const Sequelize = require('sequelize');
const sequelize = require('../../config').sequelize;

const Exhibits = sequelize.define(
  'Exhibits',
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    categoryId: {
      type: Sequelize.UUID,
      field: 'category_id',
      allowNull: false,
      references: {
        model: 'exhibit_categories',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    adminId: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    title: { type: Sequelize.STRING },
    googleSpreadsheetsCode: { type: Sequelize.STRING },
    modelUrl: {
      type: Sequelize.STRING,
      field: 'model_url',
    },
    views: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    createdPhoto: {
      type: Sequelize.INTEGER,
      field: 'created_photo',
      allowNull: false,
      defaultValue: 0,
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
    tableName: 'exhibits',
    timestamps: true,
    underscored: true,
  },
);

module.exports = { Exhibits };
