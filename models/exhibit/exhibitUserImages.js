const Sequelize = require('sequelize');
const sequelize = require('../../config').sequelize;

const ExhibitUserImages = sequelize.define(
  'ExhibitUserImages',
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    exhibitId: {
      type: Sequelize.UUID,
      allowNull: false,
      field: 'exhibit_id',
      references: {
        model: 'exhibits',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    imageUrl: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'image_url',
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
      field: 'updated_at',
    },
  },
  {
    schema: 'public',
    tableName: 'exhibit_user_images',
    timestamps: true,
    underscored: true,
  },
);

module.exports = {
  ExhibitUserImages,
};
