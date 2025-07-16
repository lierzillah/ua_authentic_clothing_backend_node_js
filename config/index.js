const dotenv = require('dotenv');
const Sequelize = require('sequelize');

dotenv.config();

const {
  USERNAME: username,
  PASSWORD: password,
  DATABASE: database,
  HOST: host,
} = process.env;

const baseConfig = {
  username,
  password,
  database,
  dialect: 'postgres',
};

const development = {
  ...baseConfig,
  host: host || 'localhost',
};

const production = {
  ...baseConfig,
  host: host || 'db',
};

const sequelize = new Sequelize(
  database,
  username,
  password,
  process.env.NODE_ENV === 'production' ? production : development,
);

module.exports = {
  development,
  production,
  sequelize,
};
