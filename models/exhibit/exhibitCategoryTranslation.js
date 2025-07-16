const Sequelize = require('sequelize');
const sequelize = require('../../config').sequelize;

const ExhibitCategoryTranslations = sequelize.define(
  'ExhibitCategoryTranslations',
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
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    locale: {
      type: Sequelize.ENUM('ua', 'en', 'pl', 'de'),
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    localeSlug: {
      type: Sequelize.STRING,
      field: 'locale_slug',
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
    tableName: 'exhibit_category_translations',
    timestamps: true,
    underscored: true,
  },
);

module.exports = { ExhibitCategoryTranslations };
