const moment = require('moment');
const { Sequelize, Op } = require('sequelize');
const { Exhibits, ExhibitViews } = require('../../models');
const { createError } = require('../utils');
const logger = require('../logger/logger');

const getDateRange = (range) => {
  if (!range) return null;

  const match = range.match(/^(\d+)(m|d)$/);
  if (!match) return null;

  const value = Number(match[1]);
  const type = match[2];

  if (type === 'm') return moment().subtract(value, 'months').toDate();
  if (type === 'd') return moment().subtract(value, 'days').toDate();

  return null;
};

const getGlobalStatistic = async ({
  range,
  sort = 'views',
  limit = 20,
} = {}) => {
  try {
    const dateFilter = getDateRange(range);

    const where = {};

    if (dateFilter) {
      where.createdAt = {
        [Op.gte]: dateFilter,
      };
    }

    const orderField = sort === 'createdPhoto' ? 'createdPhoto' : 'views';

    return Exhibits.findAll({
      attributes: [
        'id',
        'title',
        'categoryId',
        'modelUrl',
        'views',
        'createdPhoto',
        'createdAt',
        'updatedAt',
        [Sequelize.fn('COUNT', Sequelize.col('viewsLog.id')), 'count'],
      ],
      include: [
        {
          model: ExhibitViews,
          as: 'viewsLog',
          attributes: [],
          required: false,
          where,
        },
      ],
      group: ['Exhibits.id'],
      order: [[orderField, 'DESC']],
      limit,
      subQuery: false,
    });
  } catch (error) {
    logger.error('get_global_statistic', {
      range,
      sort,
      limit,
      message: error.message,
      stack: error.stack,
    });
    throw createError(
      error.message || 'Failed to get global statistics',
      error.status || 500,
    );
  }
};

const getExhibitStatistic = async (exhibitId, { range } = {}) => {
  try {
    const dateFilter = getDateRange(range);

    const where = {
      exhibitId,
    };

    if (dateFilter) {
      where.createdAt = { [Op.gte]: dateFilter };
    }

    const stats = await ExhibitViews.findAll({
      where,
      attributes: [
        'action',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
      ],
      group: ['action'],
      raw: true,
    });

    const result = {
      views: 0,
      createdPhoto: 0,
    };

    for (const row of stats) {
      if (row.action === 'VIEW') result.views = Number(row.count);
      if (row.action === 'CREATED_PHOTO')
        result.createdPhoto = Number(row.count);
    }

    return result;
  } catch (error) {
    logger.error('get_exhibit_statistic', {
      exhibitId,
      range,
      message: error.message,
      stack: error.stack,
    });
    throw createError(
      error.message || 'Failed to get global statistics',
      error.status || 500,
    );
  }
};

const addToStatistic = async (exhibitId, data = {}) => {
  const { action = 'VIEW', userType = 'GUEST', userId, ip } = data;
  try {
    const exhibit = await Exhibits.findByPk(exhibitId);

    if (!exhibit) {
      throw createError('Exhibit not found', 404);
    }

    const isView = action === 'VIEW';

    if (isView) {
      const lastView = await ExhibitViews.findOne({
        where: {
          exhibitId,
          action: 'VIEW',
          ...(userId ? { userId } : { ip }),
          createdAt: {
            [Op.gte]: moment().subtract(24, 'hours').toDate(),
          },
        },
      });

      if (lastView) {
        return {
          views: exhibit.views,
          createdPhoto: exhibit.createdPhoto,
          skipped: true,
        };
      }
    }

    await ExhibitViews.create({
      exhibitId,
      action,
      userType,
      userId: userId || null,
      ip: ip || null,
    });

    if (isView) {
      await Exhibits.update(
        { views: Sequelize.literal('views + 1') },
        { where: { id: exhibitId } },
      );
    }

    if (action === 'CREATED_PHOTO') {
      await Exhibits.update(
        { createdPhoto: Sequelize.literal('created_photo + 1') },
        { where: { id: exhibitId } },
      );
    }

    const updated = await Exhibits.findByPk(exhibitId);

    return {
      views: updated.views,
      createdPhoto: updated.createdPhoto,
    };
  } catch (error) {
    logger.error('add_to_statistic', {
      exhibitId,
      data,
      message: error.message,
      stack: error.stack,
    });
    throw createError(
      error.message || 'Failed to add to statistics',
      error.status || 500,
    );
  }
};

module.exports = { getExhibitStatistic, getGlobalStatistic, addToStatistic };
