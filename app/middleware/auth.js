const jwt = require('jsonwebtoken');
const { Users } = require('../../models');
const { checkJwtToken } = require('../utils');

const tokenValidator = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await Users.findOne({
      where: { id: decoded.id },
      attributes: { exclude: ['password'] },
    });

    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const optionalTokenValidator = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await Users.findOne({
      where: { id: decoded.id },
      attributes: { exclude: ['password'] },
    });

    if (user) req.user = user;
  } catch {
    req.user = undefined;
  }

  next();
};

const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };

module.exports = { tokenValidator, optionalTokenValidator, requireRole };
