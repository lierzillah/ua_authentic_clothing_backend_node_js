module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('exhibit_views', {
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
      user_type: {
        type: Sequelize.ENUM('USER', 'GUEST'),
        allowNull: false,
      },
      action: {
        type: Sequelize.ENUM('VIEW', 'CREATED_PHOTO'),
        allowNull: false,
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
      ip: {
        type: Sequelize.STRING(64),
        allowNull: true,
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

    await queryInterface.addIndex('exhibit_views', ['exhibit_id']);
    await queryInterface.addIndex('exhibit_views', ['user_id']);
    await queryInterface.addIndex('exhibit_views', ['user_type']);
    await queryInterface.addIndex('exhibit_views', ['exhibit_id', 'user_id']);
    await queryInterface.addIndex('exhibit_views', ['exhibit_id', 'ip']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('exhibit_views');

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_exhibit_views_user_type";',
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_exhibit_views_action";',
    );
  },
};
