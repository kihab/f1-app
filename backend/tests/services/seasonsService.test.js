// Import the seasonsService module
const { createSeasonsService } = require('../../services/seasonsService');

// Mock dependencies
jest.mock('../../utils/ergastClient', () => ({
  fetchChampionDriver: jest.fn()
}));

jest.mock('../../utils/validationUtils', () => ({
  validateYear: jest.fn(),
  validateDriverData: jest.fn()
}));

jest.mock('../../utils/commonUtils', () => ({
  sleep: jest.fn(() => Promise.resolve()),
  logOperationStart: jest.fn(),
  formatTimingLog: jest.fn(() => 'mocked timing log')
}));

jest.mock('../../config/constants', () => ({
  START_YEAR: 2005,
  CURRENT_YEAR: 2025,
  THROTTLE_MS: 100
}));

// Import the mocked dependencies to control their behavior
const { fetchChampionDriver } = require('../../utils/ergastClient');
const { validateYear, validateDriverData } = require('../../utils/validationUtils');
const { formatTimingLog, logOperationStart } = require('../../utils/commonUtils');

describe('seasonsService', () => {
  let mockDbService;
  let seasonsService;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create mock dbService
    mockDbService = {
      findSeasons: jest.fn(),
      upsertDriver: jest.fn(),
      upsertSeason: jest.fn(),
      processBatch: jest.fn(),
    };
    
    // Create seasonsService with mock dependencies
    seasonsService = createSeasonsService({
      dbService: mockDbService,
      // Other dependencies use the mocked modules
    });
  });

  describe('createSeasonsService', () => {
    test('should create service with provided dependencies', () => {
      // Create custom mock dependencies
      const customDeps = {
        dbService: { custom: true },
        ergastClient: { custom: true },
        constants: { custom: true },
        validationUtils: { custom: true },
        commonUtils: { custom: true }
      };
      
      // Create service with custom dependencies
      const customService = createSeasonsService(customDeps);
      
      // Create a minimal service to check if it initializes with our deps
      expect(customService).toBeDefined();
    });

    test('should create service with default dependencies if not provided', () => {
      // Create service with no dependencies
      const defaultService = createSeasonsService();
      
      // Should create a service with default dependencies
      expect(defaultService).toBeDefined();
      expect(defaultService.getAllSeasons).toBeInstanceOf(Function);
    });
  });

  describe('getAllSeasons', () => {
    test('should return seasons directly if all exist in database', async () => {
      // Setup mock database with all seasons
      const mockSeasons = [
        { year: 2005, champion: { name: 'Driver 1' } },
        { year: 2006, champion: { name: 'Driver 2' } },
      ];
      mockDbService.findSeasons.mockResolvedValue(mockSeasons);
      
      // Mock the processBatch to track if it's called
      mockDbService.processBatch.mockResolvedValue({
        processedCount: 0,
        errors: [],
        totalCount: 0
      });
      
      // Call the service
      const result = await seasonsService.getAllSeasons();
      
      // Should query the database
      expect(mockDbService.findSeasons).toHaveBeenCalledWith(2005, 2025);
      
      // Should return expected format
      expect(result).toHaveLength(21); // 21 years from 2005-2025
      expect(result[0].year).toBe(2005);
      expect(result[0].champion).toBeDefined();
    });

    test('should fetch missing seasons from API', async () => {
      // Setup mock database with missing seasons
      const mockExistingSeasons = [
        { year: 2005, champion: { name: 'Driver 1' } },
        // 2006 is missing
        { year: 2007, champion: { name: 'Driver 3' } },
      ];
      mockDbService.findSeasons.mockResolvedValue(mockExistingSeasons);
      
      // Setup mock API response for missing year
      const mockChampion = {
        driverRef: 'driver2',
        name: 'Driver 2'
      };
      fetchChampionDriver.mockResolvedValue(mockChampion);
      
      // Setup mock driver upsert
      const mockDriver = { id: 'driver-id', driverRef: 'driver2', name: 'Driver 2' };
      mockDbService.upsertDriver.mockResolvedValue(mockDriver);
      
      // Setup mock season upsert
      mockDbService.upsertSeason.mockResolvedValue({ year: 2006, championDriverId: 'driver-id' });
      
      // Setup mock batch processing
      mockDbService.processBatch.mockImplementation(async (items, processFn) => {
        // Execute the processFn for each item to simulate real behavior
        for (const item of items) {
          await processFn(item);
        }
        return {
          errors: [],
          processedCount: items.length,
          totalCount: items.length
        };
      });
      
      // Call the service
      const result = await seasonsService.getAllSeasons();
      
      // Should have called processBatch with missing years
      expect(mockDbService.processBatch).toHaveBeenCalled();
      const batchCall = mockDbService.processBatch.mock.calls[0];
      expect(batchCall[0]).toContain(2006); // First arg is array with missing years
      
      // Should have fetched champion for missing year
      expect(fetchChampionDriver).toHaveBeenCalledWith(2006);
      
      // Should have upserted driver and season
      expect(mockDbService.upsertDriver).toHaveBeenCalledWith(mockChampion);
      expect(mockDbService.upsertSeason).toHaveBeenCalledWith(2006, 'driver-id');
      
      // Should query the database again after updates
      expect(mockDbService.findSeasons).toHaveBeenCalledTimes(2);
      
      // Result should include all years
      expect(result).toHaveLength(21); // 21 years from 2005-2025
    });

    test('should handle seasons with no champion data', async () => {
      // Setup mock database with some seasons
      const mockExistingSeasons = [
        { year: 2005, champion: { name: 'Driver 1' } },
      ];
      mockDbService.findSeasons.mockResolvedValue(mockExistingSeasons);
      
      // Setup API to return null (no champion data)
      fetchChampionDriver.mockResolvedValue(null);
      
      // Setup batch processing
      mockDbService.processBatch.mockImplementation(async (items, processFn) => {
        // Execute the processFn for each item
        for (const item of items) {
          await processFn(item);
        }
        return {
          errors: [],
          processedCount: items.length,
          totalCount: items.length
        };
      });
      
      // Call the service
      const result = await seasonsService.getAllSeasons();
      
      // Should not have called upsertDriver or upsertSeason (null champion case)
      expect(mockDbService.upsertDriver).not.toHaveBeenCalled();
      expect(mockDbService.upsertSeason).not.toHaveBeenCalled();
      
      // Should have tried to fetch champions
      expect(fetchChampionDriver).toHaveBeenCalled();
      
      // Result should still include all years
      expect(result).toHaveLength(21);
    });

    test('should handle validation errors', async () => {
      // Setup mock database with some seasons
      const mockExistingSeasons = [];
      mockDbService.findSeasons.mockResolvedValue(mockExistingSeasons);
      
      // Setup validation to fail
      validateYear.mockImplementation(() => {
        throw new Error('Invalid year');
      });
      
      // Setup batch processing to record errors
      mockDbService.processBatch.mockResolvedValue({
        errors: [{ id: 2005, error: 'Invalid year' }],
        processedCount: 0,
        totalCount: 21
      });
      
      // Call the service
      const result = await seasonsService.getAllSeasons();
      
      // Should still return data for all years
      expect(result).toHaveLength(21);
      
      // Should have logged errors
      expect(mockDbService.processBatch).toHaveBeenCalled();
    });

    test('should handle driver validation errors', async () => {
      // Setup mock database with some seasons
      const mockExistingSeasons = [];
      mockDbService.findSeasons.mockResolvedValue(mockExistingSeasons);
      
      // Setup API to return data
      fetchChampionDriver.mockResolvedValue({ driverRef: 'driver', name: 'Driver' });
      
      // Setup driver validation to fail
      validateDriverData.mockImplementation(() => {
        throw new Error('Invalid driver data');
      });
      
      // Setup batch processing to simulate validation errors
      mockDbService.processBatch.mockImplementation(async (items, processFn) => {
        const errors = [];
        // Execute the processFn but catch errors
        for (const item of items) {
          try {
            await processFn(item);
          } catch (err) {
            errors.push({ id: item, error: err.message });
          }
        }
        return {
          errors,
          processedCount: items.length - errors.length,
          totalCount: items.length
        };
      });
      
      // Call the service
      const result = await seasonsService.getAllSeasons();
      
      // Should still return data for all years
      expect(result).toHaveLength(21);
    });

    test('should log completion with timing information', async () => {
      // Setup mock database
      mockDbService.findSeasons.mockResolvedValue([]);
      
      // Setup batch processing
      mockDbService.processBatch.mockResolvedValue({
        errors: [],
        processedCount: 21,
        totalCount: 21
      });
      
      // Call the service
      await seasonsService.getAllSeasons();
      
      // Should have logged operation start
      expect(logOperationStart).toHaveBeenCalledWith('getAllSeasons');
      
      // Should have logged completion
      expect(formatTimingLog).toHaveBeenCalled();
    });
  });
});
