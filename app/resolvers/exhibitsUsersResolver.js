const Sequelize = require('sequelize');
const { Op } = require('sequelize');

const {
  Exhibits,
  ExhibitTranslations,
  ExhibitsImages,
  ExhibitUserImages,
} = require('../../models');

const { createError, deleteLocalFile } = require('../utils');
const logger = require('../logger/logger');

const getUserImagesByExhibitId = async ({
  userId,
  exhibitId,
  page = 1,
  limit = 20,
  search,
}) => {
  try {
    if (!userId) throw createError('userId is required');
    if (!exhibitId) throw createError('exhibitId is required');

    const offset = (Number(page) - 1) * Number(limit);

    const exhibit = await Exhibits.findOne({
      where: { id: exhibitId },
      include: [
        {
          model: ExhibitTranslations,
          as: 'translations',
          required: !!search,
          where: search
            ? {
                title: { [Op.iLike]: `%${search}%` },
              }
            : undefined,
        },
        {
          model: ExhibitsImages,
          as: 'images',
        },
        {
          model: ExhibitUserImages,
          as: 'userImages',
          where: { userId },
          limit: Number(limit),
          offset,
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (!exhibit) throw createError('Exhibit not found', 404);

    return exhibit;
  } catch (error) {
    logger.error('get_user_images_by_exhibit_id', {
      userId,
      exhibitId,
      page,
      limit,
      search,
      message: error.message,
      stack: error.stack,
    });
    throw createError(
      error.message || 'Failed to get user exhibit images',
      error.status || 500,
    );
  }
};

const getAllUserImages = async ({ userId, page = 1, limit = 20, search }) => {
  try {
    if (!userId) throw createError('userId is required');

    const offset = (Number(page) - 1) * Number(limit);

    return await Exhibits.findAndCountAll({
      distinct: true,
      include: [
        {
          model: ExhibitTranslations,
          as: 'translations',
          required: !!search,
          where: search
            ? {
                title: { [Op.iLike]: `%${search}%` },
              }
            : undefined,
        },
        {
          model: ExhibitsImages,
          as: 'images',
        },
        {
          model: ExhibitUserImages,
          as: 'userImages',
          required: true,
          where: { userId },
        },
      ],
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });
  } catch (error) {
    logger.error('get_all_user_images', {
      userId,
      page,
      limit,
      search,
      message: error.message,
      stack: error.stack,
    });
    throw createError(
      error.message || 'Failed to get all user images',
      error.status || 500,
    );
  }
};

const createUserImageExhibit = async ({ userId, exhibitId, image }) => {
  try {
    if (!userId) throw createError('userId is required');
    if (!exhibitId) throw createError('exhibitId is required');
    if (!image) throw createError('image is required');

    const exhibit = await Exhibits.findByPk(exhibitId);

    if (!exhibit) throw createError('Exhibit not found', 404);

    const imageUrl = `/images/generations/${image.filename}`;

    await Exhibits.update(
      {
        createdPhoto: Sequelize.literal('created_photo + 1'),
      },
      {
        where: { id: exhibitId },
      },
    );

    return await ExhibitUserImages.create({
      userId,
      exhibitId,
      imageUrl,
    });
  } catch (error) {
    logger.error('create_user_image_exhibit', {
      userId,
      exhibitId,
      image: image?.filename,
      message: error.message,
      stack: error.stack,
    });
    throw createError(
      error.message || 'Failed to create user exhibit image',
      error.status || 500,
    );
  }
};

const updateUserExhibit = async ({ id, userId, exhibitId, image }) => {
  try {
    if (!id) throw createError('id is required');
    if (!userId) throw createError('userId is required');

    const userImage = await ExhibitUserImages.findOne({
      where: { id, userId },
    });

    if (!userImage) throw createError('User exhibit image not found', 404);

    if (exhibitId) userImage.exhibitId = exhibitId;

    if (image) {
      deleteLocalFile(userImage.imageUrl);
      userImage.imageUrl = `/images/generations/${image.filename}`;
    }

    await userImage.save();

    return userImage;
  } catch (error) {
    logger.error('update_user_exhibit', {
      id,
      userId,
      exhibitId,
      image: image?.filename,
      message: error.message,
      stack: error.stack,
    });
    throw createError(
      error.message || 'Failed to update user exhibit image',
      error.status || 500,
    );
  }
};

const deleteUserExhibit = async ({ exhibitId, userId }) => {
  try {
    if (!exhibitId) throw createError('exhibitId is required');
    if (!userId) throw createError('userId is required');

    const userImages = await ExhibitUserImages.findAll({
      where: { exhibitId, userId },
    });

    if (!userImages.length) {
      throw createError('User exhibit images not found', 404);
    }

    for (const image of userImages) {
      deleteLocalFile(image.imageUrl);
      await image.destroy();
    }

    await Exhibits.update(
      {
        createdPhoto: Sequelize.literal(`created_photo - ${userImages.length}`),
      },
      {
        where: { id: exhibitId },
      },
    );

    return { success: true };
  } catch (error) {
    logger.error('delete_user_exhibit', {
      exhibitId,
      message: error.message,
      stack: error.stack,
    });

    throw createError(
      error.message || 'Failed to delete user exhibit images',
      error.status || 500,
    );
  }
};

const deleteUserExhibitImage = async ({ exhibitId, imageId, userId }) => {
  try {
    if (!exhibitId) throw createError('exhibitId is required');
    if (!imageId) throw createError('imageId is required');
    if (!userId) throw createError('userId is required');

    const userImage = await ExhibitUserImages.findOne({
      where: { exhibitId, id: imageId, userId },
    });

    if (!userImage) throw createError('User exhibit image not found', 404);

    deleteLocalFile(userImage.imageUrl);

    await userImage.destroy();

    await Exhibits.update(
      {
        createdPhoto: Sequelize.literal('created_photo - 1'),
      },
      {
        where: { id: exhibitId },
      },
    );

    return { success: true };
  } catch (error) {
    logger.error('delete_user_exhibit_image', {
      exhibitId,
      imageId,
      message: error.message,
      stack: error.stack,
    });

    throw createError(
      error.message || 'Failed to delete user exhibit image',
      error.status || 500,
    );
  }
};

module.exports = {
  getUserImagesByExhibitId,
  getAllUserImages,
  createUserImageExhibit,
  updateUserExhibit,
  deleteUserExhibit,
  deleteUserExhibitImage,
};
