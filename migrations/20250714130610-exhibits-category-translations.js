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

    await queryInterface.createTable('exhibit_category_translations', {
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
      locale_slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      ...dateFields,
    });

    await queryInterface.addIndex(
      'exhibit_category_translations',
      ['category_id', 'locale'],
      {
        unique: true,
        name: 'exhibit_category_translations_unique_locale',
      },
    );

    await queryInterface.addIndex('exhibit_category_translations', ['locale']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('exhibit_category_translations');
  },
};
