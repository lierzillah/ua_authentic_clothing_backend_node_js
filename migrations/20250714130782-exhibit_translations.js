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

    await queryInterface.createTable('exhibit_translations', {
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
      creation_period: {
        type: Sequelize.STRING,
      },
      author: {
        type: Sequelize.STRING,
      },
      materials: {
        type: Sequelize.STRING,
      },
      creation_method: {
        type: Sequelize.STRING,
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
      ...dateFields,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('exhibit_translations');
  },
};
