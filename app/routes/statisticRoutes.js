const {
  getExhibitStatistic,
  getGlobalStatistic,
  addToStatistic,
} = require('../resolvers/statisticResolver');

const { optionalTokenValidator } = require('../middleware/auth');

const statisticRoutes = async (app) => {
  app.get('/statistics', async (req, res) => {
    try {
      const statistic = await getGlobalStatistic({
        range: req.query.range,
        sort: req.query.sort,
        limit: req.query.limit,
      });

      return res.json(statistic);
    } catch (error) {
      return res.status(error.status || 400).json({
        error: error.message,
      });
    }
  });

  app.get('/statistics/exhibits/:id', async (req, res) => {
    try {
      const statistic = await getExhibitStatistic(req.params.id, {
        range: req.query.range,
      });

      return res.json(statistic);
    } catch (error) {
      return res.status(error.status || 400).json({
        error: error.message,
      });
    }
  });

  app.post('/statistics/exhibits/:id', optionalTokenValidator, async (req, res) => {
    try {
      const statistic = await addToStatistic(req.params.id, {
        action: req.body.action,
        userType: req.user ? 'USER' : 'GUEST',
        userId: req.user?.id || null,
        ip: req.ip,
      });

      return res.json(statistic);
    } catch (error) {
      return res.status(error.status || 400).json({
        error: error.message,
      });
    }
  });
};

module.exports = {
  statisticRoutes,
};
