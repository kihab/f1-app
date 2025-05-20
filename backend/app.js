// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerModule = require('./swagger');
const swaggerUi = swaggerModule.swaggerUi;
const swaggerSpec = swaggerModule.swaggerSpec;

const seasonsRoutes = require('./routes/seasons');
const racesRoutes  = require('./routes/races');

const app = express();
app.use(cors());
app.use(express.json());

// Healthcheck (kept simple here)
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Mount routes
app.use('/api/seasons', seasonsRoutes);
// Races for a given season (path parameter)
app.use('/api/seasons/:year/races', racesRoutes);

// Serve OpenAPI docs at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;