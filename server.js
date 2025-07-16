require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const initSwagger = require('./config/swagger');
const upload = require('./app/middleware/upload');

const { userRoutes } = require('./app/routes/userRoutes');
const { exhibitRoutes } = require('./app/routes/exhibitsRoutes');
const {
  getInfoFromGoogleTableFile,
} = require('./app/integrations/googleDocs/sync');
const { statisticRoutes } = require('./app/routes/statisticRoutes');
const { exhibitUserImageRoutes } = require('./app/routes/exhibitsUsersRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.set('trust proxy', true);

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use('/images', express.static(path.join(__dirname, 'uploads/images')));
app.use('/models', express.static(path.join(__dirname, 'uploads/models')));

initSwagger(app);
userRoutes(app);
exhibitRoutes(app, upload);
statisticRoutes(app);
exhibitUserImageRoutes(app, upload);

if (process.env.SYNC_DATA === '1') {
  getInfoFromGoogleTableFile();
}

app.get('/', (req, res) => {
  res.json({ success: true, msg: `API is running on port ${port}` })
});

app.get('/admin', (req, res) => {
  res.render('index');
});

app.get('/admin/users', (req, res) => {
  res.render('users');
});

app.get('/admin/exhibits', (req, res) => {
  res.render('exhibits');
});

app.server = app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
