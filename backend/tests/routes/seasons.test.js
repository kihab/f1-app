// tests/routes/seasons.test.js
const request = require('supertest');
const express = require('express');
const seasonsRouter = require('../../routes/seasons');
const seasonsController = require('../../controllers/seasonsController');

// Mock the controller functions
jest.mock('../../controllers/seasonsController', () => ({
  getSeasons: jest.fn()
}));

// Create a test Express app
const app = express();
app.use('/api/seasons', seasonsRouter);

describe('Seasons Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/seasons', () => {
    test('should respond with 200 status and seasons data', async () => {
      // Setup the mock controller to send a successful response
      seasonsController.getSeasons.mockImplementation((req, res) => {
        res.status(200).json([
          { year: 2023, champion: { name: 'Max Verstappen' } },
          { year: 2022, champion: { name: 'Max Verstappen' } }
        ]);
      });

      // Make the API call
      const response = await request(app).get('/api/seasons');

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].year).toBe(2023);
      expect(seasonsController.getSeasons).toHaveBeenCalled();
    });

    test('should respond with 500 status when an error occurs', async () => {
      // Setup the mock controller to send an error response
      seasonsController.getSeasons.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal Server Error' });
      });

      // Make the API call
      const response = await request(app).get('/api/seasons');

      // Assertions
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
      expect(seasonsController.getSeasons).toHaveBeenCalled();
    });

    test('should respond with 404 status when no seasons are found', async () => {
      // Setup the mock controller to send a 404 response
      seasonsController.getSeasons.mockImplementation((req, res) => {
        res.status(404).json({ error: 'No seasons found' });
      });

      // Make the API call
      const response = await request(app).get('/api/seasons');

      // Assertions
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('No seasons found');
      expect(seasonsController.getSeasons).toHaveBeenCalled();
    });
  });
});
