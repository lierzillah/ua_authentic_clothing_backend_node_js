const {
  getUserImagesByExhibitId,
  getAllUserImages,
  createUserImageExhibit,
  updateUserExhibit,
  deleteUserExhibit,
  deleteUserExhibitImage,
} = require('../resolvers/exhibitsUsersResolver');

const { tokenValidator } = require('../middleware/auth');
const { createError } = require('../utils');

const exhibitUserImageRoutes = async (app, upload) => {
  app.get('/user-exhibits/images', tokenValidator, async (req, res) => {
    try {
      const { limit, page, search } = req.query;
      const data = await getAllUserImages({
        userId: req.user.id,
        page,
        limit,
        search,
      });

      return res.json(data);
    } catch (error) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  });

  app.get(
    '/user-exhibits/images/:exhibitId',
    tokenValidator,
    async (req, res) => {
      try {
        const { limit, page, search } = req.query;
        const data = await getUserImagesByExhibitId({
          userId: req.user.id,
          exhibitId: req.params.exhibitId,
          page,
          limit,
          search,
        });

        return res.json(data);
      } catch (error) {
        return res.status(error.status || 500).json({
          error: error.message,
        });
      }
    },
  );

  app.post(
    '/user-exhibits/images/:exhibitId',
    tokenValidator,
    upload.single('generations'),
    async (req, res) => {
      try {
        const data = await createUserImageExhibit({
          userId: req.user.id,
          exhibitId: req.params.exhibitId,
          image: req.file,
        });

        return res.json(data);
      } catch (error) {
        return res.status(error.status || 500).json({
          error: error.message,
        });
      }
    },
  );

  app.put(
    '/user-exhibits/images/:exhibitId',
    tokenValidator,
    upload.single('generations'),
    async (req, res) => {
      try {
        const data = await updateUserExhibit({
          id: req.body.id,
          userId: req.user.id,
          exhibitId: req.body.exhibitId,
          image: req.file,
        });

        return res.json(data);
      } catch (error) {
        return res.status(error.status || 500).json({
          error: error.message,
        });
      }
    },
  );

  app.delete(
    '/user-exhibits/images/:exhibitId',
    tokenValidator,
    async (req, res) => {
      try {
        const data = await deleteUserExhibit({
          exhibitId: req.params.exhibitId,
          userId: req.user.id,
        });
        return res.json(data);
      } catch (error) {
        return res.status(error.status || 500).json({
          error: error.message,
        });
      }
    },
  );

  app.delete(
    '/user-exhibits/images/:exhibitId/:imageId',
    tokenValidator,
    async (req, res) => {
      try {
        const data = await deleteUserExhibitImage({
          exhibitId: req.params.exhibitId,
          imageId: req.params.imageId,
          userId: req.user.id,
        });
        return res.json(data);
      } catch (error) {
        return res.status(error.status || 500).json({
          error: error.message,
        });
      }
    },
  );
};

module.exports = {
  exhibitUserImageRoutes,
};
