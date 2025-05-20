// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Basic OpenAPI definition
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'F1 App API',
      version: '1.0.0',
      description: 'API for Formula 1 seasons & races',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local dev server' }
    ],
  },
  // Point to the route files for JSDoc annotations
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    swaggerSpec
  };
  