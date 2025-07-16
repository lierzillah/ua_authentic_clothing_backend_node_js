const { Op } = require('sequelize');
const { Users } = require('../../models');
const { encryptPassword, createError } = require('../utils');
const logger = require('../logger/logger');

const getUser = async ({ userId }) => {
  try {
    const user = await Users.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    return user;
  } catch (error) {
    logger.error('get_user', {
      userId,
      message: error.message,
      stack: error.stack,
    });
    throw createError(
      error.message || 'Failed to get user',
      error.status || 500,
    );
  }
};

const getUsers = async ({ page = 1, limit = 20, search, role } = {}) => {
  try {
    const normalizedPage = Math.max(parseInt(page, 10) || 1, 1);
    const normalizedLimit = Math.min(
      Math.max(parseInt(limit, 10) || 20, 1),
      100,
    );
    const where = {};

    if (search?.trim()) {
      where.username = {
        [Op.iLike]: `%${search.trim()}%`,
      };
    }

    if (role) {
      where.role = role;
    }

    const { rows, count } = await Users.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: normalizedLimit,
      offset: (normalizedPage - 1) * normalizedLimit,
      order: [['createdAt', 'DESC']],
    });

    return {
      data: rows,
      pagination: {
        page: normalizedPage,
        limit: normalizedLimit,
        total: count,
        totalPages: Math.ceil(count / normalizedLimit),
      },
    };
  } catch (error) {
    logger.error('get_users', {
      page,
      limit,
      search,
      role,
      message: error.message,
      stack: error.stack,
    });
    throw createError(
      error.message || 'Failed to get users',
      error.status || 500,
    );
  }
};

const updateUser = async ({ userId, data = {}, allowPrivileged = false }) => {
  try {
    const user = await Users.findByPk(userId);

    if (!user) throw createError('User not found', 404);

    const allowedFields = allowPrivileged
      ? ['username', 'password', 'role', 'active']
      : ['username', 'password'];

    const payload = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) payload[field] = data[field];
    }

    if (payload.role !== undefined && !['user', 'admin'].includes(payload.role)) {
      throw createError('Invalid role');
    }

    if (payload.username) {
      const username = payload.username.trim();
      const existing = await Users.findOne({
        where: {
          id: { [Op.ne]: userId },
          username,
        },
      });

      if (existing) {
        throw createError('User with this username already exists', 409);
      }

      payload.username = username;
    }

    if (payload.password) {
      payload.password = await encryptPassword(payload.password);
    }

    await user.update(payload);

    return Users.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });
  } catch (error) {
    logger.error('update_user', {
      userId,
      data,
      message: error.message,
      stack: error.stack,
    });
    throw createError(
      error.message || 'Failed to update user',
      error.status || 500,
    );
  }
};

module.exports = {
  getUser,
  updateUser,
  getUsers,
};
