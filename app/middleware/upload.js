const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const rules = {
  images: {
    types: ['image/jpeg', 'image/png', 'image/webp'],
    dir: 'uploads/images',
  },
  model: {
    types: ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'],
    dir: 'uploads/models',
  },
  generations: {
    types: ['image/jpeg', 'image/png', 'image/webp'],
    dir: 'uploads/images/generations',
  },
};

const ensureDir = (dir) => {
  const fullPath = path.join(process.cwd(), dir);

  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  return fullPath;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const config = rules[file.fieldname];
    if (!config) return cb(new Error('Unknown file field'));

    const fullPath = ensureDir(config.dir);

    cb(null, fullPath);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const config = rules[file.fieldname];

  if (!config) return cb(new Error('Unknown file field'));

  if (config.types && !config.types.includes(file.mimetype)) {
    return cb(new Error(`Invalid file type for ${file.fieldname}`), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;
