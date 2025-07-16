const fs = require('fs');
const path = require('path');

const { google } = require('googleapis');

const {
  Exhibits,
  ExhibitsImages,
  ExhibitCategories,
  ExhibitCategoryTranslations,
  ExhibitTranslations,
} = require('../../../models');

const {
  GOOGLE_SPREADSHEET_ID: spreadsheetId,
  GOOGLE_SPREADSHEET_RANGE: rangeValue = 'A2:J',
} = process.env;

const auth = new google.auth.GoogleAuth({
  keyFile: 'app/integrations/config/creds.json',
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
  ],
});

const getLocaleFromTitle = (title) => {
  if (title.startsWith('UA_')) return 'ua';
  if (title.startsWith('EN_')) return 'en';

  return 'ua';
};

const createCategory = async (title, locale) => {
  const baseTitle = title.replace(/^UA_/, '').replace(/^EN_/, '').trim();

  const baseSlug = baseTitle
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-zа-яіїєґ0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '');

  const [category] = await ExhibitCategories.findOrCreate({
    where: {
      slug: baseSlug,
    },

    defaults: {
      slug: baseSlug,
    },
  });

  await ExhibitCategoryTranslations.findOrCreate({
    where: {
      categoryId: category.id,
      locale,
    },

    defaults: {
      categoryId: category.id,
      locale,
      title: baseTitle,
      localeSlug: `${locale}-${baseSlug}`,
    },
  });

  return category;
};

const getLocalImages = (rowId, folderName) => {
  const dirPath = path.join(__dirname, 'images', folderName);

  if (!fs.existsSync(dirPath)) {
    return [];
  }

  return fs
    .readdirSync(dirPath)
    .filter((file) => file.startsWith(`${rowId}_`))
    .map((file) => path.join('images', folderName, file));
};

const importExhibits = async (rows = [], category, folderName, locale) => {
  for (const row of rows) {
    const [
      googleSpreadsheetsCode,
      title,
      location,
      owner,
      creationPeriod,
      author,
      materials,
      creationMethod,
      description,
      fact,
    ] = row;

    if (!title || !googleSpreadsheetsCode) {
      continue;
    }

    let exhibit = await Exhibits.findOne({
      where: {
        googleSpreadsheetsCode,
      },
    });

    if (!exhibit) {
      exhibit = await Exhibits.create({
        categoryId: category.id,
        modelUrl: null,
        title,
        googleSpreadsheetsCode,
      });

      const images = getLocalImages(googleSpreadsheetsCode, folderName);

      if (images.length) {
        await ExhibitsImages.bulkCreate(
          images.map((imageUrl) => ({
            exhibitId: exhibit.id,
            imageUrl,
          })),
        );
      }
    }

    const existingTranslation = await ExhibitTranslations.findOne({
      where: {
        exhibitId: exhibit.id,
        locale,
      },
    });

    if (!existingTranslation) {
      await ExhibitTranslations.create({
        exhibitId: exhibit.id,
        locale,
        title,
        description,
        creationPeriod,
        author,
        materials,
        creationMethod,
        fact,
        location,
        owner,
      });
    }
  }
};

const clearExhibits = async () => {
  await ExhibitsImages.destroy({ where: {} });

  await ExhibitTranslations.destroy({ where: {} });

  await Exhibits.destroy({ where: {} });

  await ExhibitCategoryTranslations.destroy({
    where: {},
  });

  await ExhibitCategories.destroy({ where: {} });
};

const getInfoFromGoogleTableFile = async () => {
  const client = await auth.getClient();

  const sheets = google.sheets({
    version: 'v4',
    auth: client,
  });

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties.title',
  });

  const sheetTitles = spreadsheet.data.sheets.map(
    (sheet) => sheet.properties.title,
  );

  const res = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,

    ranges: sheetTitles.map((title) => `${title}!${rangeValue}`),
  });

  await clearExhibits();

  for (const [index, sheetTitle] of sheetTitles.entries()) {
    const locale = getLocaleFromTitle(sheetTitle);

    const category = await createCategory(sheetTitle, locale);

    const rows = res.data.valueRanges[index]?.values || [];

    await importExhibits(rows, category, String(index + 1), locale);
  }

  return {
    text: 'Дані успішно синхронізовані',
  };
};

module.exports = {
  getInfoFromGoogleTableFile,
};
