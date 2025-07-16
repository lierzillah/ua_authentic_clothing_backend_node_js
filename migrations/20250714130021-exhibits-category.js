module.exports = {
  async up(queryInterface, Sequelize) {
    const dateFields = {
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
    };

    await queryInterface.createTable('exhibit_categories', {
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
      ...dateFields,
    });

    await queryInterface.addIndex('exhibit_categories', ['slug']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('exhibit_categories');
  },
};
