const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const { Users, RefreshTokens } = require('../../models');
const {
  updateJwtToken,
  encryptPassword,
  verifyPassword,
  createError,
} = require('../utils');

const logger = require('../logger/logger');

const { REFRESH_TOKEN_DAYS } = process.env;

const VALID_ROLES = ['user', 'admin'];

const getRefreshTokenExpiresAt = () => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + Number(REFRESH_TOKEN_DAYS || 7));
  return expiresAt;
};

const createRefreshToken = async ({ id }) => {
  try {
    const { accessToken, refreshToken } = updateJwtToken(id);

    await RefreshTokens.create({
      userId: id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiresAt(),
    });

    return { accessToken, refreshToken };
  } catch (error) {
    logger.error('refresh_token_create_failed', {
      userId: id,
      message: error.message,
      stack: error.stack,
    });

    throw createError('Failed to create refresh token', 500);
  }
};

const logIn = async (args = {}) => {
  try {
    const { username, password } = args;

    if (!username || !password) {
      throw createError('Username and password are required');
    }

    const user = await Users.findOne({ where: { username } });

    if (!user) {
      throw createError('Invalid username or password', 401);
    }

    if (!user.active) {
      throw createError('User is inactive', 403);
    }

    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      throw createError('Invalid username or password', 401);
    }

    const tokens = await createRefreshToken({ id: user.id });

    const profile = await Users.findByPk(user.id, {
      attributes: { exclude: ['password'] },
    });

    return {
      user: profile,
      ...tokens,
    };
  } catch (error) {
    logger.error('log_in', {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

const register = async (args = {}, { allowPrivileged = false } = {}) => {
  try {
    const username = args.username?.trim();
    const { password } = args;

    let role = 'user';
    let active = true;

    if (allowPrivileged) {
      if (args.role !== undefined) {
        if (!VALID_ROLES.includes(args.role)) {
          throw createError('Invalid role');
        }
        role = args.role;
      }
      if (args.active !== undefined) {
        active = Boolean(args.active);
      }
    }

    if (!username || !password) {
      throw createError('Username and password are required');
    }

    const existing = await Users.findOne({ where: { username } });

    if (existing) {
      throw createError('User with this username already exists', 409);
    }

    const hashedPassword = await encryptPassword(password);

    const user = await Users.create({
      username,
      password: hashedPassword,
      role,
      active,
    });

    const tokens = await createRefreshToken({ id: user.id });

    const profile = await Users.findByPk(user.id, {
      attributes: { exclude: ['password'] },
    });

    return {
      user: profile,
      ...tokens,
    };
  } catch (error) {
    logger.error('register', {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

const refreshToken = async (token) => {
  try {
    if (!token) {
      throw createError('Refresh token is required');
    }

    let payload;

    try {
      payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      throw createError('Invalid or expired refresh token', 401);
    }

    const storedToken = await RefreshTokens.findOne({
      where: {
        token,
        userId: payload.id,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!storedToken) {
      throw createError('Refresh token not found or expired', 401);
    }

    const user = await Users.findByPk(payload.id);

    if (!user) {
      await storedToken.destroy();
      throw createError('User not found', 404);
    }

    if (!user.active) {
      await storedToken.destroy();
      throw createError('User is inactive', 403);
    }

    await storedToken.destroy();

    const tokens = await createRefreshToken({ id: user.id });

    const profile = await Users.findByPk(user.id, {
      attributes: { exclude: ['password'] },
    });

    return {
      user: profile,
      ...tokens,
    };
  } catch (error) {
    logger.error('refresh_token', {
      message: error.message,
      stack: error.stack,
    });

    throw error;
  }
};

module.exports = {
  logIn,
  register,
  refreshToken,
};
