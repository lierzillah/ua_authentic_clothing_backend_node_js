const {
  getExhibits,
  getExhibitById,
  getExhibitTranslations,
  createExhibit,
  updateExhibit,
  deleteExhibit,
  addExhibitTranslation,
  updateExhibitTranslation,
  deleteExhibitTranslation,
} = require('../resolvers/exhibitsResolver');

const { tokenValidator, requireRole } = require('../middleware/auth');

const exhibitRoutes = async (app, upload) => {
  app.get('/exhibits', async (req, res) => {
    try {
      const exhibits = await getExhibits(req.query);

      return res.json(exhibits);
    } catch (error) {
      return res.status(error.status || 400).json({
        error: error.message,
      });
    }
  });

  app.get('/exhibits/:id', async (req, res) => {
    try {
      const exhibit = await getExhibitById({
        id: req.params.id,
        locale: req.query.locale,
      });

      return res.json(exhibit);
    } catch (error) {
      return res.status(error.status || 404).json({
        error: error.message,
      });
    }
  });

  app.get('/exhibits/:id/translations', async (req, res) => {
    try {
      const translations = await getExhibitTranslations({
        exhibitId: req.params.id,
      });

      return res.json(translations);
    } catch (error) {
      return res.status(error.status || 404).json({
        error: error.message,
      });
    }
  });

  app.post(
    '/exhibits',
    tokenValidator,
    requireRole('admin'),
    upload.fields([
      { name: 'images', maxCount: 10 },
      { name: 'model', maxCount: 1 },
    ]),
    async (req, res) => {
      try {
        const imageUrls = Array.isArray(req.files?.images)
          ? req.files.images.map((file) => `/images/${file.filename}`)
          : [];

        const modelUrl = req.files?.model?.[0]
          ? `/models/${req.files.model[0].filename}`
          : null;

        const exhibit = await createExhibit({
          adminId: req.user.id,
          data: req.body,
          images: imageUrls,
          modelUrl,
        });

        return res.json(exhibit);
      } catch (error) {
        return res.status(error.status || 400).json({
          error: error.message,
        });
      }
    },
  );

  app.post(
    '/exhibits/:id/translation',
    tokenValidator,
    requireRole('admin'),
    async (req, res) => {
      try {
        const result = await addExhibitTranslation({
          exhibitId: req.params.id,
          locale: req.body.locale,
          data: req.body,
        });

        return res.json(result);
      } catch (error) {
        return res.status(error.status || 400).json({
          error: error.message,
        });
      }
    },
  );

  app.put(
    '/exhibits/:id',
    tokenValidator,
    requireRole('admin'),
    upload.fields([
      { name: 'images', maxCount: 10 },
      { name: 'model', maxCount: 1 },
    ]),
    async (req, res) => {
      try {
        const imageUrls = Array.isArray(req.files?.images)
          ? req.files.images.map((file) => `/images/${file.filename}`)
          : [];

        const modelUrl = req.files?.model?.[0]
          ? `/models/${req.files.model[0].filename}`
          : null;

        const exhibit = await updateExhibit({
          id: req.params.id,
          data: req.body,
          images: imageUrls,
          modelUrl,
        });

        return res.json(exhibit);
      } catch (error) {
        return res.status(error.status || 400).json({
          error: error.message,
        });
      }
    },
  );

  app.put(
    '/exhibits/:id/translation/:locale',
    tokenValidator,
    requireRole('admin'),
    async (req, res) => {
      try {
        const result = await updateExhibitTranslation({
          exhibitId: req.params.id,
          locale: req.params.locale,
          data: req.body,
        });

        return res.json(result);
      } catch (error) {
        return res.status(error.status || 400).json({
          error: error.message,
        });
      }
    },
  );

  app.delete(
    '/exhibits/:id/translation/:locale',
    tokenValidator,
    requireRole('admin'),
    async (req, res) => {
      try {
        const result = await deleteExhibitTranslation({
          exhibitId: req.params.id,
          locale: req.params.locale,
        });

        return res.json(result);
      } catch (error) {
        return res.status(error.status || 400).json({
          error: error.message,
        });
      }
    },
  );

  app.delete(
    '/exhibits/:id',
    tokenValidator,
    requireRole('admin'),
    async (req, res) => {
      try {
        const exhibit = await deleteExhibit(req.params.id);

        return res.json(exhibit);
      } catch (error) {
        return res.status(error.status || 400).json({
          error: error.message,
        });
      }
    },
  );
};

module.exports = {
  exhibitRoutes,
};
