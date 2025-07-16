const Sequelize = require('sequelize');
const sequelize = require('../../config').sequelize;

const ExhibitTranslations = sequelize.define(
  'ExhibitTranslations',
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
    locale: {
      type: Sequelize.ENUM('ua', 'en', 'pl', 'de'),
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
    },
    creationPeriod: {
      type: Sequelize.STRING,
      field: 'creation_period',
    },
    author: {
      type: Sequelize.STRING,
    },
    materials: {
      type: Sequelize.STRING,
    },
    creationMethod: {
      type: Sequelize.STRING,
      field: 'creation_method',
    },
    fact: {
      type: Sequelize.TEXT,
    },
    location: {
      type: Sequelize.STRING,
    },
    owner: {
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
    tableName: 'exhibit_translations',
    timestamps: true,
    underscored: true,
  },
);

module.exports = { ExhibitTranslations };
