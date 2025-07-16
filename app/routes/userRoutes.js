const { getUser, updateUser, getUsers } = require('../resolvers/userResolver');
const { logIn, register, refreshToken } = require('../resolvers/authResolver');
const { tokenValidator, requireRole } = require('../middleware/auth');

const userRoutes = async (app) => {
  app.post('/auth/login', async (req, res) => {
    try {
      const user = await logIn(req.body);
      return res.json(user);
    } catch (error) {
      return res.status(error.status || 400).json({
        error: error.message,
      });
    }
  });

  app.post('/auth/refresh-token', async (req, res) => {
    try {
      const authHeader = req.headers['authorization'];
      const token =
        req.body?.refreshToken || (authHeader && authHeader.split(' ')[1]);
      const user = await refreshToken(token);
      return res.json(user);
    } catch (error) {
      return res.status(error.status || 400).json({
        error: error.message,
      });
    }
  });

  app.get('/user', tokenValidator, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await getUser({ userId });
      return res.json(user);
    } catch (error) {
      return res.status(error.status || 400).json({
        error: error.message,
      });
    }
  });

  app.get(
    '/user/:id',
    tokenValidator,
    requireRole('admin'),
    async (req, res) => {
      try {
        const user = await getUser({ userId: req.params.id });
        return res.json(user);
      } catch (error) {
        return res.status(error.status || 400).json({
          error: error.message,
        });
      }
    },
  );

  app.get('/users', tokenValidator, requireRole('admin'), async (req, res) => {
    try {
      const user = await getUsers(req.query);
      return res.json(user);
    } catch (error) {
      return res.status(error.status || 400).json({
        error: error.message,
      });
    }
  });

  app.post('/auth/register', async (req, res) => {
    try {
      const user = await register(req.body);
      return res.json(user);
    } catch (error) {
      return res.status(error.status || 400).json({
        error: error.message,
      });
    }
  });

  app.post(
    '/user',
    tokenValidator,
    requireRole('admin'),
    async (req, res) => {
      try {
        const user = await register(req.body, { allowPrivileged: true });
        return res.json(user);
      } catch (error) {
        return res.status(error.status || 400).json({
          error: error.message,
        });
      }
    },
  );

  app.put('/user', tokenValidator, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await updateUser({ userId, data: req.body });
      return res.json(user);
    } catch (error) {
      return res.status(error.status || 400).json({
        error: error.message,
      });
    }
  });

  app.put(
    '/user/:id',
    tokenValidator,
    requireRole('admin'),
    async (req, res) => {
      try {
        const userId = req.params.id;
        const user = await updateUser({
          userId,
          data: req.body,
          allowPrivileged: true,
        });
        return res.json(user);
      } catch (error) {
        return res.status(error.status || 400).json({
          error: error.message,
        });
      }
    },
  );
};

module.exports = {
  userRoutes,
};
