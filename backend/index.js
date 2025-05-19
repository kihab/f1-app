// index.js

// Load environment variables from .env file for secure config/secrets
require('dotenv').config();

// Import dependencies
const express = require('express');         // Web framework for building APIs
const cors = require('cors');               // Middleware to enable cross-origin requests (for FE apps)
const { PrismaClient } = require('@prisma/client'); // ORM client for PostgreSQL

// Initialize Express app and Prisma database client
const app = express();
const prisma = new PrismaClient();

// Middleware setup
app.use(cors());            // Allow requests from any origin (adjust in prod for security)
app.use(express.json());    // Parse incoming JSON in request bodies

// Healthcheck endpoint (for uptime checks and sanity tests)
// - Confirms API is running and can connect to the database
app.get('/health', async (req, res) => {
  try {
    // Simple database check: count rows in "driver" table
    const driverCount = await prisma.driver.count();
    res.json({ status: 'ok', db: 'ok', driverCount });
  } catch (err) {
    // Return error details if DB connection/query fails
    res.status(500).json({ status: 'error', db: 'fail', message: err.message });
  }
});

// GET /api/seasons
// Returns all seasons with champion info
app.get('/api/seasons', async (req, res) => {
    try {
      // Query all seasons and include the related champion driver
      const seasons = await prisma.season.findMany({
        include: {
          champion: true, // gets full driver info for champion
        },
        orderBy: { year: 'desc' },
      });
  
      // Format response for frontend (example structure)
      const formatted = seasons.map(season => ({
        year: season.year,
        champion: {
          id: season.champion.id,
          name: season.champion.name,
          driverRef: season.champion.driverRef,
        },
      }));
  
      res.json(formatted);
    } catch (err) {
      // Handle server or DB errors
      res.status(500).json({ error: 'Failed to fetch seasons', details: err.message });
    }
  });
  

// Start the API server on the specified port (default: 3000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend API listening at http://localhost:${PORT}`);
});