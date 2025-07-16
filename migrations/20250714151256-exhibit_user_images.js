module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('exhibit_user_images', {
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
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('exhibit_user_images', ['exhibit_id']);
    await queryInterface.addIndex('exhibit_user_images', ['user_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('exhibit_user_images');
  },
};
