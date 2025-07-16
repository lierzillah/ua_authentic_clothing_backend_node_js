const swaggerUi = require('swagger-ui-express');
const { paths } = require('../app/docs');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'API',
    version: '1.0.0',
    title: 'Exhibit and User API',
  },
  servers: [
    {
      url:
        process.env.NODE_ENV === 'production'
          ? `https://${process.env.API_HOST}`
          : `http://localhost:${process.env.PORT || 3000}`,
    },
  ],
  paths,
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};
module.exports = (app) => {
  if (process.env.NODE_ENV !== 'production') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }
};
