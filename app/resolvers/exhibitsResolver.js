const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const {
  Exhibits,
  ExhibitsImages,
  ExhibitCategories,
  ExhibitCategoryTranslations,
  ExhibitTranslations,
} = require('../../models');

const { createError, deleteLocalFile } = require('../utils');

const logger = require('../logger/logger');

const TRANSLATION_FIELDS = [
  'title',
  'description',
  'creationPeriod',
  'author',
  'materials',
  'creationMethod',
  'fact',
  'location',
  'owner',
];

const buildTranslationPayload = (data = {}) => {
  const payload = {};
  for (const field of TRANSLATION_FIELDS) {
    if (data[field] !== undefined) payload[field] = data[field] || null;
  }
  return payload;
};

const getOrCreateDefaultCategory = async () => {
  const [category] = await ExhibitCategories.findOrCreate({
    where: { slug: 'general' },
    defaults: { slug: 'general' },
  });

  await ExhibitCategoryTranslations.findOrCreate({
    where: { categoryId: category.id, locale: 'ua' },
    defaults: {
      categoryId: category.id,
      locale: 'ua',
      title: 'Загальна',
      localeSlug: 'ua-general',
    },
  });

  return category.id;
};

const resolveCategoryId = async (data) => {
  const category = data.categoryId || data.category_id || data.category;

  if (!category) throw createError('Category is required');

  const categoryById = await ExhibitCategories.findByPk(category);

  if (categoryById) return categoryById.id;

  const categoryBySlug = await ExhibitCategories.findOne({
    where: { slug: category },
  });

  if (categoryBySlug) return categoryBySlug.id;

  const categoryTranslation = await ExhibitCategoryTranslations.findOne({
    where: {
      [Op.or]: [{ localeSlug: category }, { title: category }],
    },
  });

  if (categoryTranslation) return categoryTranslation.categoryId;

  throw createError('Category not found', 404);
};

const getExhibitIncludes = (translationWhere = null, categoryWhere = null) => [
  {
    model: ExhibitsImages,
    as: 'images',
    separate: true,
    order: [['createdAt', 'ASC']],
  },
  {
    model: ExhibitTranslations,
    as: 'translations',
    required: Boolean(translationWhere),
    where: translationWhere || undefined,
  },
  {
    model: ExhibitCategories,
    as: 'category',
    required: Boolean(categoryWhere),
    where: categoryWhere || undefined,
    include: [
      {
        model: ExhibitCategoryTranslations,
        as: 'translations',
      },
    ],
  },
];

const getPreferredTranslation = (translations = [], locale = 'ua') => {
  return (
    translations.find((translation) => translation.locale === locale) ||
    translations.find((translation) => translation.locale === 'ua') ||
    translations[0] ||
    null
  );
};

const getExhibits = async (query = {}) => {
  try {
    const {
      locale,
      search,
      category,
      owner,
      ownerEn,
      location,
      locationEn,
      page = 1,
      limit = 20,
    } = query;

    const translationWhere = {};
    const categoryWhere = {};

    if (search?.trim()) {
      translationWhere[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { author: { [Op.iLike]: `%${search}%` } },
        { materials: { [Op.iLike]: `%${search}%` } },
        { fact: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
        { owner: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const owners = [owner, ownerEn].flat().filter(Boolean);

    if (owners.length) {
      translationWhere.owner = {
        [Op.in]: owners,
      };
    }

    const locations = [location, locationEn].flat().filter(Boolean);

    if (locations.length) {
      translationWhere.location = {
        [Op.in]: locations,
      };
    }

    if (locale) {
      translationWhere.locale = locale;
    }

    if (category) {
      categoryWhere[Op.or] = [{ id: category }, { slug: category }];
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { rows, count } = await Exhibits.findAndCountAll({
      limit: Number(limit),
      offset,
      distinct: true,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: ExhibitTranslations,
          as: 'translations',
          where: {
            ...translationWhere,
          },
          required: true,
        },
        {
          model: ExhibitCategories,
          as: 'category',
          where: Object.keys(categoryWhere).length ? categoryWhere : undefined,
          required: !!category,
        },
        {
          model: ExhibitsImages,
          as: 'images',
        },
      ],
    });

    return {
      total: count,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(count / Number(limit)),
      items: rows,
    };
  } catch (error) {
    logger.error('get_exhibits', {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

const getExhibitById = async ({ id, locale = null }) => {
  try {
    const whereLocale = locale ? { locale } : {};

    const exhibit = await Exhibits.findOne({
      where: { id },
      include: [
        {
          model: ExhibitTranslations,
          as: 'translations',
          where: whereLocale,
          required: false,
        },
        {
          model: ExhibitCategories,
          as: 'category',
          include: [
            {
              model: ExhibitCategoryTranslations,
              as: 'translations',
              required: true,
            },
          ],
        },
        {
          model: ExhibitsImages,
          as: 'images',
        },
      ],
    });

    if (!exhibit) {
      throw createError('Exhibit not found', 404);
    }

    return exhibit;
  } catch (error) {
    throw error;
  }
};

const createExhibit = async ({ adminId, data = {}, modelUrl, images = [] }) => {
  try {
    const hasCategory = data.categoryId || data.category_id || data.category;
    const categoryId = hasCategory
      ? await resolveCategoryId(data)
      : await getOrCreateDefaultCategory();

    const locale = data.locale || 'ua';
    const translationPayload = buildTranslationPayload(data);

    const exhibit = await Exhibits.create({
      title: data.title,
      categoryId,
      adminId,
      modelUrl: modelUrl || null,
    });

    await ExhibitTranslations.create({
      exhibitId: exhibit.id,
      locale,
      ...translationPayload,
      title: translationPayload.title || data.title || 'Без назви',
    });

    if (images.length) {
      await ExhibitsImages.bulkCreate(
        images.map((imageUrl) => ({
          exhibitId: exhibit.id,
          imageUrl,
        })),
      );
    }

    return getExhibitById({ id: exhibit.id });
  } catch (error) {
    logger.error('create_exhibit', {
      adminId,
      data,
      modelUrl,
      images,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

const addExhibitTranslation = async ({ exhibitId, locale, data }) => {
  try {
    if (!exhibitId || !locale) {
      throw createError('exhibitId and locale are required');
    }

    const existing = await ExhibitTranslations.findOne({
      where: {
        exhibitId,
        locale,
      },
    });

    if (existing) {
      throw createError('Translation for this locale already exists', 409);
    }

    await ExhibitTranslations.create({
      exhibitId,
      locale,
      title: data.title || null,
      description: data.description || null,
      creationPeriod: data.creationPeriod || null,
      author: data.author || null,
      materials: data.materials || null,
      creationMethod: data.creationMethod || null,
      fact: data.fact || null,
      location: data.location || null,
      owner: data.owner || null,
    });

    return getExhibitById({ id: exhibitId, locale });
  } catch (error) {
    logger.error('add_exhibit_translation', {
      exhibitId,
      locale,
      data,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

const updateExhibit = async ({ id, data = {}, modelUrl, images = [] }) => {
  try {
    const existingPhotoIds = [
      data.existingPhotoIds || data['existingPhotoIds[]'],
    ]
      .flat()
      .filter(Boolean)
      .map(String);

    const exhibit = await Exhibits.findByPk(id);

    if (!exhibit) {
      throw createError('Exhibit not found', 404);
    }

    const updates = {};

    if (data.title !== undefined) {
      updates.title = data.title;
    }

    if (data.categoryId || data.category_id || data.category) {
      updates.categoryId = await resolveCategoryId(data);
    }

    if (modelUrl) {
      if (exhibit.modelUrl) {
        deleteLocalFile(exhibit.modelUrl);
      }

      updates.modelUrl = modelUrl;
    }

    if (Object.keys(updates).length) {
      await exhibit.update(updates);
    }

    const locale = data.locale || 'ua';
    const translationPayload = buildTranslationPayload(data);

    if (Object.keys(translationPayload).length) {
      const translation = await ExhibitTranslations.findOne({
        where: { exhibitId: id, locale },
      });

      if (translation) {
        await translation.update(translationPayload);
      } else {
        await ExhibitTranslations.create({
          exhibitId: id,
          locale,
          ...translationPayload,
          title: translationPayload.title || data.title || 'Без назви',
        });
      }
    }

    const oldImages = await ExhibitsImages.findAll({
      where: { exhibitId: id },
    });

    const shouldReplaceImages = images.length > 0;

    if (shouldReplaceImages) {
      for (const image of oldImages) {
        deleteLocalFile(image.imageUrl);
        await image.destroy();
      }

      await ExhibitsImages.bulkCreate(
        images.map((imageUrl) => ({
          exhibitId: id,
          imageUrl,
        })),
      );
    } else {
      for (const image of oldImages) {
        if (!existingPhotoIds.includes(String(image.id))) {
          deleteLocalFile(image.imageUrl);
          await image.destroy();
        }
      }
    }

    return getExhibitById({ id });
  } catch (error) {
    logger.error('update_exhibit', {
      id,
      data,
      modelUrl,
      images,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

const updateExhibitTranslation = async ({ exhibitId, locale, data }) => {
  try {
    if (!exhibitId || !locale) {
      throw createError('exhibitId and locale are required');
    }

    const translation = await ExhibitTranslations.findOne({
      where: {
        exhibitId,
        locale,
      },
    });

    if (!translation) {
      throw createError('exhibitId and locale are required');
    }

    if (translation) {
      await translation.update(data);
    }

    return getExhibitById({ id: exhibitId, locale });
  } catch (error) {
    logger.error('update_exhibit_translation', {
      exhibitId,
      locale,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

const deleteExhibit = async (id) => {
  try {
    const exhibit = await Exhibits.findByPk(id, {
      include: [{ model: ExhibitsImages, as: 'images' }],
    });

    if (!exhibit)
      throw createError('Exhibit not found or already deleted', 404);

    for (const image of exhibit.images || []) {
      deleteLocalFile(image.imageUrl);
    }

    if (exhibit.modelUrl) {
      deleteLocalFile(exhibit.modelUrl);
    }

    await ExhibitsImages.destroy({ where: { exhibitId: id } });
    await ExhibitTranslations.destroy({ where: { exhibitId: id } });
    await exhibit.destroy();

    return { status: 'deleted' };
  } catch (error) {
    logger.error('delete_exhibit', {
      id,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

const deleteExhibitTranslation = async ({ exhibitId, locale }) => {
  try {
    if (!exhibitId || !locale) {
      throw createError('exhibitId and locale are required');
    }

    const exhibitTranslation = await ExhibitTranslations.findOne({
      where: { exhibitId, locale },
    });

    if (!exhibitTranslation)
      throw createError(
        'Exhibit translation not found or already deleted',
        404,
      );

    await exhibitTranslation.destroy();

    return { status: 'deleted' };
  } catch (error) {
    logger.error('delete_exhibit_translation', {
      exhibitId,
      locale,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

module.exports = {
  getExhibitById,
  createExhibit,
  updateExhibit,
  deleteExhibit,
  getExhibits,
  addExhibitTranslation,
  updateExhibitTranslation,
  deleteExhibitTranslation,
};
