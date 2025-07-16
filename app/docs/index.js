const users = require('./users.json');
const exhibit = require('./exhibit.json');
const statistic = require('./statistic.json');
const exhibitUserImage = require('./exhibit-user.json');

const paths = {
  ...users,
  ...exhibit,
  ...statistic,
  ...exhibitUserImage,
};

module.exports = { paths };
