const { Users, RefreshTokens } = require('./user');
const {
  Exhibits,
  ExhibitsImages,
  ExhibitCategories,
  ExhibitCategoryTranslations,
  ExhibitTranslations,
  ExhibitViews,
  ExhibitUserImages,
} = require('./exhibit');
const { Statistic } = require('./statistics');

module.exports = {
  Users,
  RefreshTokens,
  Statistic,
  Exhibits,
  ExhibitsImages,
  ExhibitCategories,
  ExhibitCategoryTranslations,
  ExhibitTranslations,
  ExhibitViews,
  ExhibitUserImages,
};
