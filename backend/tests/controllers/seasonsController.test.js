// tests/seasonsController.test.js
const { getSeasons } = require('../../controllers/seasonsController');
const { getAllSeasons } = require('../../services/seasonsService');
const { sendSuccessResponse } = require('../../utils/responseUtils');
const { transformSeasonsToDto } = require('../../utils/dtoUtils');
const { handleApiError } = require('../../utils/errorHandler');

// Mock all dependencies
jest.mock('../../services/seasonsService', () => ({
  getAllSeasons: jest.fn(),
}));

jest.mock('../../utils/responseUtils', () => ({
  sendSuccessResponse: jest.fn(),
}));

jest.mock('../../utils/dtoUtils', () => ({
  transformSeasonsToDto: jest.fn(),
}));

jest.mock('../../utils/errorHandler', () => ({
  handleApiError: jest.fn(),
}));

describe('seasonsController', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSeasons', () => {
    // Mock Express req and res objects
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    test('should return seasons data when available', async () => {
      // Setup mocks
      const mockSeasons = [
        { year: 2023, champion: { id: 'driver1', name: 'Driver 1' } },
        { year: 2022, champion: { id: 'driver2', name: 'Driver 2' } },
      ];
      const mockSeasonDtos = [
        { year: 2023, champion: { id: 'driver1', name: 'Driver 1', driverRef: 'driver-1' } },
        { year: 2022, champion: { id: 'driver2', name: 'Driver 2', driverRef: 'driver-2' } },
      ];
      
      getAllSeasons.mockResolvedValue(mockSeasons);
      transformSeasonsToDto.mockReturnValue(mockSeasonDtos);

      // Call the controller function
      await getSeasons(req, res);

      // Assertions
      expect(getAllSeasons).toHaveBeenCalledTimes(1);
      expect(transformSeasonsToDto).toHaveBeenCalledWith(mockSeasons);
      expect(sendSuccessResponse).toHaveBeenCalledWith(res, mockSeasonDtos);
    });

    test('should handle empty seasons array', async () => {
      // Setup mocks
      getAllSeasons.mockResolvedValue([]);

      // Call the controller function
      await getSeasons(req, res);

      // Assertions
      expect(getAllSeasons).toHaveBeenCalledTimes(1);
      expect(sendSuccessResponse).toHaveBeenCalledWith(
        res, 
        [], 
        'No season data available. Our systems may be experiencing temporary issues.'
      );
    });

    test('should handle null seasons result', async () => {
      // Setup mocks
      getAllSeasons.mockResolvedValue(null);

      // Call the controller function
      await getSeasons(req, res);

      // Assertions
      expect(getAllSeasons).toHaveBeenCalledTimes(1);
      expect(sendSuccessResponse).toHaveBeenCalledWith(
        res, 
        [], 
        'No season data available. Our systems may be experiencing temporary issues.'
      );
    });

    test('should handle error from service', async () => {
      // Setup mocks
      const mockError = new Error('Service error');
      getAllSeasons.mockRejectedValue(mockError);

      // Call the controller function
      await getSeasons(req, res);

      // Assertions
      expect(getAllSeasons).toHaveBeenCalledTimes(1);
      expect(handleApiError).toHaveBeenCalledWith(mockError, res, 'fetching seasons');
    });
  });
});
