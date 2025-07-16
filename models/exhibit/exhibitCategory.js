const Sequelize = require('sequelize');
const sequelize = require('../../config').sequelize;

const ExhibitCategories = sequelize.define(
  'ExhibitCategories',
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    slug: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
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
    tableName: 'exhibit_categories',
    timestamps: true,
    underscored: true,
  },
);

module.exports = { ExhibitCategories };
