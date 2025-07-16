module.exports = {
  async up(queryInterface, Sequelize) {
    const dateFields = {
      createdAt: {
        type: Sequelize.DATE,
        field: 'created_at',
        defaultValue: Sequelize.literal('NOW()'),
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        field: 'updated_at',
        defaultValue: Sequelize.literal('NOW()'),
        allowNull: false,
      },
    };

    await queryInterface.createTable('exhibit_images', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      exhibit_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'exhibits',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      ...dateFields,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('exhibit_images');
  },
};
