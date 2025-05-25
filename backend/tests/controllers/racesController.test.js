// tests/racesController.test.js
const { getRaces } = require('../../controllers/racesController');
const { getRacesBySeason } = require('../../services/racesService');
const { validateYear } = require('../../utils/validationUtils');
const { sendBadRequestError, sendSuccessResponse } = require('../../utils/responseUtils');
const { transformRacesToDto } = require('../../utils/dtoUtils');
const { handleApiError } = require('../../utils/errorHandler');

// Mock all dependencies
jest.mock('../../services/racesService', () => ({
  getRacesBySeason: jest.fn(),
}));

jest.mock('../../utils/validationUtils', () => ({
  validateYear: jest.fn(),
}));

jest.mock('../../utils/responseUtils', () => ({
  sendBadRequestError: jest.fn(),
  sendSuccessResponse: jest.fn(),
}));

jest.mock('../../utils/dtoUtils', () => ({
  transformRacesToDto: jest.fn(),
}));

jest.mock('../../utils/errorHandler', () => ({
  handleApiError: jest.fn(),
}));

describe('racesController', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRaces', () => {
    // Mock Express req and res objects
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    test('should handle invalid year parameter (not a number)', async () => {
      // Setup mock request with invalid year
      const req = {
        params: { year: 'invalid' }
      };

      // Call the controller function
      await getRaces(req, res);

      // Assertions
      expect(sendBadRequestError).toHaveBeenCalledWith(res, 'Invalid season year');
      expect(getRacesBySeason).not.toHaveBeenCalled();
    });

    test('should handle year validation error', async () => {
      // Setup mock request with year that fails validation
      const req = {
        params: { year: '3000' }
      };
      
      // Setup validation to fail
      const validationError = new Error('Year 3000 is outside the valid range');
      validateYear.mockImplementation(() => {
        throw validationError;
      });

      // Call the controller function
      await getRaces(req, res);

      // Assertions
      expect(validateYear).toHaveBeenCalledWith(3000);
      expect(sendBadRequestError).toHaveBeenCalledWith(res, validationError.message);
      expect(getRacesBySeason).not.toHaveBeenCalled();
    });

    test('should return races data when available', async () => {
      // Setup mock request
      const req = {
        params: { year: '2023' }
      };
      
      // Setup mocks
      const mockRaces = [
        { round: 1, name: 'Race 1', winner: { id: 'driver1', name: 'Driver 1' } },
        { round: 2, name: 'Race 2', winner: { id: 'driver2', name: 'Driver 2' } },
      ];
      const mockRaceDtos = [
        { round: 1, name: 'Race 1', winner: { id: 'driver1', name: 'Driver 1', driverRef: 'driver-1' } },
        { round: 2, name: 'Race 2', winner: { id: 'driver2', name: 'Driver 2', driverRef: 'driver-2' } },
      ];
      
      validateYear.mockImplementation(() => true);
      getRacesBySeason.mockResolvedValue(mockRaces);
      transformRacesToDto.mockReturnValue(mockRaceDtos);

      // Call the controller function
      await getRaces(req, res);

      // Assertions
      expect(validateYear).toHaveBeenCalledWith(2023);
      expect(getRacesBySeason).toHaveBeenCalledWith(2023);
      expect(transformRacesToDto).toHaveBeenCalledWith(mockRaces);
      expect(sendSuccessResponse).toHaveBeenCalledWith(res, mockRaceDtos);
    });

    test('should handle empty races array', async () => {
      // Setup mock request
      const req = {
        params: { year: '2023' }
      };
      
      // Setup mocks
      validateYear.mockImplementation(() => true);
      getRacesBySeason.mockResolvedValue([]);

      // Call the controller function
      await getRaces(req, res);

      // Assertions
      expect(validateYear).toHaveBeenCalledWith(2023);
      expect(getRacesBySeason).toHaveBeenCalledWith(2023);
      expect(sendSuccessResponse).toHaveBeenCalledWith(
        res, 
        [], 
        'No race data available for 2023. The season may not have started or data is not yet available.'
      );
    });

    test('should handle error from service', async () => {
      // Setup mock request
      const req = {
        params: { year: '2023' }
      };
      
      // Setup mocks
      validateYear.mockImplementation(() => true);
      const mockError = new Error('Service error');
      getRacesBySeason.mockRejectedValue(mockError);

      // Call the controller function
      await getRaces(req, res);

      // Assertions
      expect(validateYear).toHaveBeenCalledWith(2023);
      expect(getRacesBySeason).toHaveBeenCalledWith(2023);
      expect(handleApiError).toHaveBeenCalledWith(mockError, res, 'fetching races');
    });
  });
});
