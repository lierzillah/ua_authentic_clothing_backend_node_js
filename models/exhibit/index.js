const { Exhibits } = require('./exhibit');
const { ExhibitsImages } = require('./exhibitImage');
const { ExhibitCategories } = require('./exhibitCategory');
const { ExhibitCategoryTranslations } = require('./exhibitCategoryTranslation');
const { ExhibitTranslations } = require('./exhibitTranslation');
const { ExhibitViews } = require('./ExhibitViews');
const { ExhibitUserImages } = require('./exhibitUserImages');

ExhibitCategories.hasMany(Exhibits, {
  foreignKey: 'categoryId',
  as: 'exhibits',
});

Exhibits.belongsTo(ExhibitCategories, {
  foreignKey: 'categoryId',
  as: 'category',
});

Exhibits.hasMany(ExhibitsImages, {
  foreignKey: 'exhibitId',
  as: 'images',
});

ExhibitsImages.belongsTo(Exhibits, {
  foreignKey: 'exhibitId',
  as: 'exhibit',
});

Exhibits.hasMany(ExhibitTranslations, {
  foreignKey: 'exhibitId',
  as: 'translations',
});

ExhibitTranslations.belongsTo(Exhibits, {
  foreignKey: 'exhibitId',
  as: 'exhibit',
});

ExhibitCategories.hasMany(ExhibitCategoryTranslations, {
  foreignKey: 'categoryId',
  as: 'translations',
});

ExhibitCategoryTranslations.belongsTo(ExhibitCategories, {
  foreignKey: 'categoryId',
  as: 'category',
});

Exhibits.hasMany(ExhibitViews, {
  foreignKey: 'exhibit_id',
  as: 'viewsLog',
});

ExhibitViews.belongsTo(Exhibits, {
  foreignKey: 'exhibit_id',
  as: 'exhibit',
});

Exhibits.hasMany(ExhibitUserImages, {
  foreignKey: 'exhibit_id',
  as: 'userImages',
});

ExhibitUserImages.belongsTo(Exhibits, {
  foreignKey: 'exhibit_id',
  as: 'exhibit',
});

module.exports = {
  Exhibits,
  ExhibitsImages,
  ExhibitCategories,
  ExhibitCategoryTranslations,
  ExhibitTranslations,
  ExhibitViews,
  ExhibitUserImages,
};
