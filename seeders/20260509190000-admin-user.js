const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const hashPassword = (password) => {
  return bcrypt.hashSync(password, 12);
};

module.exports = {
  async up(queryInterface) {
    const [users] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE username = 'admin' LIMIT 1;",
    );

    if (users.length) return;

    const now = new Date();

    await queryInterface.bulkInsert('users', [
      {
        id: crypto.randomUUID(),
        username: 'admin',
        password: hashPassword('1111'),
        role: 'admin',
        active: true,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { username: 'admin' });
  },
};
