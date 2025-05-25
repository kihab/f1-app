// tests/routes/races.test.js
const request = require('supertest');
const express = require('express');
const racesRouter = require('../../routes/races');
const racesController = require('../../controllers/racesController');

// Mock the controller functions
jest.mock('../../controllers/racesController', () => ({
  getRaces: jest.fn()
}));

// Create a test Express app
const app = express();
// We need to set up a parent route for seasons with a parameter
app.use('/api/seasons/:year/races', racesRouter);

describe('Races Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/seasons/:year/races', () => {
    test('should respond with 200 status and races data for a valid year', async () => {
      // Setup the mock controller to send a successful response
      racesController.getRaces.mockImplementation((req, res) => {
        res.status(200).json([
          { round: 1, name: 'Australian Grand Prix', winner: { name: 'Lando Norris' } },
          { round: 2, name: 'Bahrain Grand Prix', winner: { name: 'Max Verstappen' } }
        ]);
      });

      // Make the API call
      const response = await request(app).get('/api/seasons/2023/races');

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].round).toBe(1);
      expect(racesController.getRaces).toHaveBeenCalled();
    });

    test('should respond with 400 status when an invalid year is provided', async () => {
      // Setup the mock controller to send an error response for invalid year
      racesController.getRaces.mockImplementation((req, res) => {
        res.status(400).json({ error: 'Invalid year parameter' });
      });

      // Make the API call
      const response = await request(app).get('/api/seasons/invalid/races');

      // Assertions
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid year parameter');
      expect(racesController.getRaces).toHaveBeenCalled();
    });

    test('should respond with 404 status when no races are found for the year', async () => {
      // Setup the mock controller to send a 404 response
      racesController.getRaces.mockImplementation((req, res) => {
        res.status(404).json({ error: 'No races found for year 2023' });
      });

      // Make the API call
      const response = await request(app).get('/api/seasons/2023/races');

      // Assertions
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('No races found for year 2023');
      expect(racesController.getRaces).toHaveBeenCalled();
    });

    test('should respond with 500 status when an internal server error occurs', async () => {
      // Setup the mock controller to send a 500 response
      racesController.getRaces.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal Server Error' });
      });

      // Make the API call
      const response = await request(app).get('/api/seasons/2023/races');

      // Assertions
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
      expect(racesController.getRaces).toHaveBeenCalled();
    });

    test('should pass the year parameter to the controller', async () => {
      // Setup the mock controller to capture and validate the request parameters
      racesController.getRaces.mockImplementation((req, res) => {
        expect(req.params.year).toBe('2023');
        res.status(200).json([]);
      });

      // Make the API call
      await request(app).get('/api/seasons/2023/races');

      // Verify controller was called
      expect(racesController.getRaces).toHaveBeenCalled();
    });
  });
});
