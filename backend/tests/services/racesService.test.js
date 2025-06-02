// Import the racesService module
const { createRacesService } = require('../../services/racesService');

// Mock dependencies
jest.mock('../../services/dbService', () => ({
  processBatch: jest.fn()
}));

jest.mock('../../utils/validationUtils', () => ({
  validateYear: jest.fn(),
  validateDriverData: jest.fn(),
  validateRaceData: jest.fn()
}));

jest.mock('../../utils/commonUtils', () => ({
  formatTimingLog: jest.fn(() => 'mocked timing log'),
  logOperationStart: jest.fn()
}));

// Mock ergastClient
jest.mock('../../utils/ergastClient', () => ({
  fetchSeasonResults: jest.fn()
}));

// Mock caching utils
jest.mock('../../utils/cachingUtils', () => ({
  getFromCache: jest.fn(),
  setInCache: jest.fn().mockResolvedValue(true)
}));

// Mock constants
jest.mock('../../config/constants', () => ({
  CACHE_KEYS: {
    RACES: 'races',
    SEASONS: 'seasons'
  },
  CACHE_TTL: {
    RACES: 120
  }
}));

// Import the mocked dependencies to control their behavior
const { fetchSeasonResults } = require('../../utils/ergastClient');
const { validateYear, validateDriverData, validateRaceData } = require('../../utils/validationUtils');
const { logOperationStart } = require('../../utils/commonUtils');
const { getFromCache, setInCache } = require('../../utils/cachingUtils');

describe('racesService', () => {
  let mockDbService;
  let racesService;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create mock dbService
    mockDbService = {
      findRacesBySeason: jest.fn(),
      upsertDriver: jest.fn(),
      upsertRace: jest.fn(),
      processBatch: jest.fn(),
    };
    
    // Set validateYear to succeed by default
    validateYear.mockImplementation(() => {});
    
    // Setup cache to miss by default (return null)
    getFromCache.mockResolvedValue(null);
    setInCache.mockResolvedValue(true);
    
    // Create racesService with mock dependencies
    racesService = createRacesService({
      dbService: mockDbService,
      // Other dependencies use the mocked modules
    });
  });

  describe('createRacesService', () => {
    test('should create service with provided dependencies', () => {
      // Create custom mock dependencies
      const customDeps = {
        dbService: { custom: true },
        ergastClient: { custom: true },
        validationUtils: { custom: true },
        commonUtils: { custom: true }
      };
      
      // Create service with custom dependencies
      const customService = createRacesService(customDeps);
      
      // Create a minimal service to check if it initializes with our deps
      expect(customService).toBeDefined();
    });

    test('should create service with default dependencies if not provided', () => {
      // Create service with no dependencies
      const defaultService = createRacesService();
      
      // Should create a service with default dependencies
      expect(defaultService).toBeDefined();
      expect(defaultService.getRacesBySeason).toBeInstanceOf(Function);
    });
  });

  describe('getRacesBySeason', () => {
    test('should return data from cache when available', async () => {
      // Setup mock cached data
      const cachedRaces = [
        { round: 1, name: 'Race 1', winner: { name: 'Driver 1' } },
        { round: 2, name: 'Race 2', winner: { name: 'Driver 2' } }
      ];
      
      // Configure getFromCache to return data
      getFromCache.mockResolvedValue(cachedRaces);
      
      // Call the service
      const result = await racesService.getRacesBySeason(2023);
      
      // Should have checked cache with correct key
      expect(getFromCache).toHaveBeenCalledWith('races:2023');
      
      // Should NOT query the database
      expect(mockDbService.findRacesBySeason).not.toHaveBeenCalled();
      
      // Should return cached data
      expect(result).toEqual(cachedRaces);
    });

    test('should validate the year parameter', async () => {
      // Mock database to return empty array to avoid null reference
      mockDbService.findRacesBySeason.mockResolvedValue([]);
      
      // We need to mock the batch processor since it's called but not mocked properly
      mockDbService.processBatch.mockResolvedValue({
        errors: [],
        processedCount: 0,
        totalCount: 0
      });
      
      // Also mock the fetchSeasonResults to return empty array
      fetchSeasonResults.mockResolvedValue([]);
      
      // Call the service
      await racesService.getRacesBySeason(2023);
      
      // Should have validated the year
      expect(validateYear).toHaveBeenCalledWith(2023);
      
      // Should have checked cache first
      expect(getFromCache).toHaveBeenCalledWith('races:2023');
    });

    test('should throw error if year validation fails', async () => {
      // Setup validation to fail
      validateYear.mockImplementation(() => {
        throw new Error('Year out of range');
      });
      
      // Call the service and expect error
      await expect(racesService.getRacesBySeason(9999))
        .rejects.toThrow('Invalid year: Year out of range');
      
      // Should have validated but not queried DB
      expect(validateYear).toHaveBeenCalledWith(9999);
      expect(mockDbService.findRacesBySeason).not.toHaveBeenCalled();
    });

    test('should return races directly if they exist in database', async () => {
      // Setup mock database with races
      const mockRaces = [
        { round: 1, name: 'Race 1', winner: { name: 'Driver 1' } },
        { round: 2, name: 'Race 2', winner: { name: 'Driver 2' } },
      ];
      mockDbService.findRacesBySeason.mockResolvedValue(mockRaces);
      
      // Call the service
      const result = await racesService.getRacesBySeason(2023);
      
      // Should query the database
      expect(mockDbService.findRacesBySeason).toHaveBeenCalledWith(2023);
      
      // Should not call the API
      expect(fetchSeasonResults).not.toHaveBeenCalled();
      
      // Should return the database results directly
      expect(result).toBe(mockRaces);
      
      // Should have checked cache first
      expect(getFromCache).toHaveBeenCalledWith('races:2023');
      
      // Should update the cache with the result
      expect(setInCache).toHaveBeenCalledWith('races:2023', mockRaces, 120);
    });

    test('should fetch races from API when not in database', async () => {
      // Setup empty database for first call, populated for second call
      const mockUpdatedRaces = [
        { round: 1, name: 'Race 1', winner: { name: 'Driver 1' } },
        { round: 2, name: 'Race 2', winner: { name: 'Driver 2' } },
      ];
      mockDbService.findRacesBySeason.mockResolvedValueOnce([])
        .mockResolvedValueOnce(mockUpdatedRaces);
      
      // Setup mock API response
      const mockApiRaces = [
        {
          round: 1,
          name: 'Race 1',
          date: '2023-03-05',
          time: '15:00:00Z',
          winner: {
            driverRef: 'driver1',
            name: 'Driver 1'
          }
        },
        {
          round: 2,
          name: 'Race 2',
          date: '2023-03-19',
          time: '17:00:00Z',
          winner: {
            driverRef: 'driver2',
            name: 'Driver 2'
          }
        }
      ];
      fetchSeasonResults.mockResolvedValue(mockApiRaces);
      
      // Setup mock driver upsert
      mockDbService.upsertDriver.mockImplementation(driver => {
        return { id: `${driver.driverRef}-id`, ...driver };
      });
      
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
      const result = await racesService.getRacesBySeason(2023);
      
      // Should have called the API
      expect(fetchSeasonResults).toHaveBeenCalledWith(2023);
      
      // Should have processed the batch
      expect(mockDbService.processBatch).toHaveBeenCalled();
      expect(mockDbService.processBatch.mock.calls[0][0]).toEqual(mockApiRaces.filter(r => r.winner));
      
      // Should have validated race and driver data
      expect(validateRaceData).toHaveBeenCalled();
      expect(validateDriverData).toHaveBeenCalled();
      
      // Should have upserted drivers and races
      expect(mockDbService.upsertDriver).toHaveBeenCalledTimes(2);
      expect(mockDbService.upsertRace).toHaveBeenCalledTimes(2);
      
      // Should have queried the database again
      expect(mockDbService.findRacesBySeason).toHaveBeenCalledTimes(2);
      
      // Should return the updated database results
      expect(result).toBe(mockUpdatedRaces);
      
      // Should have checked cache first
      expect(getFromCache).toHaveBeenCalledWith('races:2023');
      
      // Should update the cache with the result after API fetch
      expect(setInCache).toHaveBeenCalledWith('races:2023', mockUpdatedRaces, 120);
    });

    test('should filter out races with no winner data', async () => {
      // Setup empty database for first call, populated for second call
      mockDbService.findRacesBySeason.mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ round: 1, name: 'Race 1' }]);
      
      // Setup mock API response with some races missing winner data
      const mockApiRaces = [
        {
          round: 1,
          name: 'Race 1',
          date: '2023-03-05',
          time: '15:00:00Z',
          winner: {
            driverRef: 'driver1',
            name: 'Driver 1'
          }
        },
        {
          round: 2,
          name: 'Race 2',
          date: '2023-03-19',
          time: '17:00:00Z',
          winner: null // No winner
        }
      ];
      fetchSeasonResults.mockResolvedValue(mockApiRaces);
      
      // Setup mock batch processing to record processing
      mockDbService.processBatch.mockImplementation((items) => {
        return {
          errors: [],
          processedCount: items.length,
          totalCount: items.length
        };
      });
      
      // Call the service
      await racesService.getRacesBySeason(2023);
      
      // Should have filtered out the race with no winner
      expect(mockDbService.processBatch.mock.calls[0][0]).toHaveLength(1);
      expect(mockDbService.processBatch.mock.calls[0][0][0].round).toBe(1);
    });

    test('should handle validation errors during batch processing', async () => {
      // Setup empty database for first call, populated for second call
      mockDbService.findRacesBySeason.mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      
      // Setup mock API response
      const mockApiRaces = [
        {
          round: 1,
          name: 'Race 1',
          winner: { driverRef: 'driver1', name: 'Driver 1' }
        }
      ];
      fetchSeasonResults.mockResolvedValue(mockApiRaces);
      
      // Setup validation to fail
      validateRaceData.mockImplementation(() => {
        throw new Error('Invalid race data');
      });
      
      // Setup batch processing to record errors
      mockDbService.processBatch.mockImplementation(async (items, processFn) => {
        const errors = [];
        // Execute the processFn but catch errors
        for (const item of items) {
          try {
            await processFn(item);
          } catch (err) {
            errors.push({ id: item.round, error: err.message });
          }
        }
        return {
          errors,
          processedCount: 0,
          totalCount: items.length
        };
      });
      
      // Call the service
      await racesService.getRacesBySeason(2023);
      
      // Should have called processBatch
      expect(mockDbService.processBatch).toHaveBeenCalled();
      
      // Should have validated race data
      expect(validateRaceData).toHaveBeenCalled();
      
      // Should not have upserted any races (validation failed)
      expect(mockDbService.upsertRace).not.toHaveBeenCalled();
    });

    test('should throw error if API fetch fails', async () => {
      // Setup empty database
      mockDbService.findRacesBySeason.mockResolvedValue([]);
      
      // Setup API to fail
      const apiError = new Error('API unavailable');
      fetchSeasonResults.mockRejectedValue(apiError);
      
      // Call the service and expect error
      await expect(racesService.getRacesBySeason(2023))
        .rejects.toThrow('Failed to fetch race data for 2023');
      
      // Should have tried to call the API
      expect(fetchSeasonResults).toHaveBeenCalledWith(2023);
      
      // Should not have processed any batches
      expect(mockDbService.processBatch).not.toHaveBeenCalled();
    });

    test('should log operation start', async () => {
      // Setup mock database with races
      const mockRaces = [
        { round: 1, name: 'Race 1', winner: { name: 'Driver 1' } },
      ];
      mockDbService.findRacesBySeason.mockResolvedValue(mockRaces);
      
      // Clear any previous calls
      logOperationStart.mockClear();
      
      // Call the service
      await racesService.getRacesBySeason(2023);
      
      // Should have logged operation start
      expect(logOperationStart).toHaveBeenCalledWith('getRacesBySeason', { year: 2023 });
    });
    
    // This test is separate as the formatTimingLog mock is challenging to verify
    test('should complete the operation successfully', async () => {
      // Setup mock database with races
      const mockRaces = [
        { round: 1, name: 'Race 1', winner: { name: 'Driver 1' } },
      ];
      mockDbService.findRacesBySeason.mockResolvedValue(mockRaces);
      
      // Call the service and verify it completes without error
      const result = await racesService.getRacesBySeason(2023);
      
      // Should return the expected result
      expect(result).toBe(mockRaces);
    });
  });
});
