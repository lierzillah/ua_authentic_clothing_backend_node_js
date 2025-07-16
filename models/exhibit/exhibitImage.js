const Sequelize = require('sequelize');
const sequelize = require('../../config').sequelize;

const ExhibitsImages = sequelize.define(
  'ExhibitsImages',
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
    imageUrl: {
      type: Sequelize.STRING,
      field: 'image_url',
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
    tableName: 'exhibit_images',
    timestamps: true,
    underscored: true,
  },
);

module.exports = { ExhibitsImages };
