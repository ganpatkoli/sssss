const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Travel Platform API',
      version: '1.0.0',
      description: 'Documentation for all API endpoints (User, Booking, Trip, Admin, Reviews, Audit, etc.).'
    },
    servers: [
      { url: 'http://localhost:5000' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./routes/*.js', './models/*.js'], // aapke code folders ke path
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
