const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logger = require('./logger/logger');

const BCRYPT_ROUNDS = 12;

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

const BASE_UPLOAD_DIR = 'uploads';

const checkJwtToken = (authHeader) => {
  try {
    const token = authHeader && authHeader.split(' ')[1];

    const { id } = jwt.verify(token, ACCESS_TOKEN_SECRET);

    return { status: 200, response: { id } };
  } catch (error) {
    return { status: 404, response: error };
  }
};

const updateJwtToken = (id) => {
  return {
    refreshToken: jwt.sign({ id }, REFRESH_TOKEN_SECRET, {
      expiresIn: '7d',
    }),
    accessToken: jwt.sign({ id }, ACCESS_TOKEN_SECRET, {
      expiresIn: '30m',
    }),
  };
};

const encryptPassword = (text) => {
  return bcrypt.hash(text, BCRYPT_ROUNDS);
};

const verifyPassword = (text, hashedText) => {
  if (!hashedText) return Promise.resolve(false);
  return bcrypt.compare(text, hashedText);
};

const createError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const deleteLocalFile = (url) => {
  if (!url) return;

  try {
    const cleanPath = url.startsWith('/') ? url.slice(1) : url;

    const filePath = path.join(process.cwd(), BASE_UPLOAD_DIR, cleanPath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    logger.error('delete_local_file', {
      url,
      message: error.message,
      stack: error.stack,
    });
  }
};

module.exports = {
  checkJwtToken,
  updateJwtToken,
  encryptPassword,
  verifyPassword,
  createError,
  deleteLocalFile,
};
