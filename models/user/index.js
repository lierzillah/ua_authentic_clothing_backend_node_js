const { Users } = require('./user');
const { RefreshTokens } = require('./refreshToken');
const { ExhibitUserImages } = require('../exhibit/exhibitUserImages');

Users.hasMany(RefreshTokens, {
  foreignKey: 'userId',
  as: 'refreshTokens',
});

RefreshTokens.belongsTo(Users, {
  foreignKey: 'userId',
  as: 'user',
});

Users.hasMany(ExhibitUserImages, {
  foreignKey: 'user_id',
  as: 'exhibitImages',
});

ExhibitUserImages.belongsTo(Users, {
  foreignKey: 'user_id',
  as: 'user',
});

module.exports = { Users, RefreshTokens };
