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

    await queryInterface.createTable('exhibits', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'exhibit_categories',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      admin_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      title: { type: Sequelize.STRING, allowNull: false },
      google_spreadsheets_code: {
        type: Sequelize.STRING,
      },
      model_url: {
        type: Sequelize.STRING,
      },
      views: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_photo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      ...dateFields,
    });

    await queryInterface.addIndex('exhibits', ['category_id']);
    await queryInterface.addIndex('exhibits', ['title']);
    await queryInterface.addIndex('exhibits', ['views']);
    await queryInterface.addIndex('exhibits', ['created_at']);
    await queryInterface.addIndex('exhibits', ['category_id', 'created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('exhibits');
  },
};
