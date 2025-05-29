// tests/jobs/syncSeasonsJob.test.js

// Mock dependencies
jest.mock('node-cron', () => ({
  schedule: jest.fn().mockReturnValue({
    start: jest.fn(),
    stop: jest.fn()
  })
}));

// Mock console methods to avoid noise during tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Import constants
const { CURRENT_YEAR, SEASON_SYNC_CRON } = require('../../config/constants');
const cron = require('node-cron');

describe('syncSeasonsJob', () => {
  // Setup mock services
  const mockDbService = {
    upsertDriver: jest.fn().mockResolvedValue({ id: 123, name: 'Test Driver' }),
    upsertSeason: jest.fn().mockResolvedValue({ year: CURRENT_YEAR, championId: 123 })
  };

  const mockErgastClient = {
    fetchChampionDriver: jest.fn().mockResolvedValue({
      driverId: 'test_driver',
      givenName: 'Test',
      familyName: 'Driver',
      nationality: 'Test',
      name: 'Test Driver'
    })
  };

  const mockCachingUtils = {
    invalidateCache: jest.fn().mockResolvedValue(true)
  };

  // Import the factory function
  const { createSyncSeasonsJob } = require('../../jobs/syncSeasonsJob');
  
  // Create the job with mocked dependencies
  let syncSeasonsJob;

  beforeAll(() => {
    // Silence console output during tests
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterAll(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    syncSeasonsJob = createSyncSeasonsJob({
      dbService: mockDbService,
      ergastClient: mockErgastClient,
      cachingUtils: mockCachingUtils
    });
  });

  describe('Factory Function', () => {
    test('should create job with default dependencies when none provided', () => {
      const defaultJob = createSyncSeasonsJob();
      expect(defaultJob).toHaveProperty('refreshCurrentSeason');
      expect(defaultJob).toHaveProperty('runSeasonSyncJob');
      expect(defaultJob).toHaveProperty('startCronJob');
    });

    test('should create job with provided dependencies', () => {
      expect(syncSeasonsJob).toHaveProperty('refreshCurrentSeason');
      expect(syncSeasonsJob).toHaveProperty('runSeasonSyncJob');
      expect(syncSeasonsJob).toHaveProperty('startCronJob');
    });
  });

  describe('refreshCurrentSeason', () => {
    test('should fetch champion data and update the database', async () => {
      const result = await syncSeasonsJob.refreshCurrentSeason();
      
      expect(mockErgastClient.fetchChampionDriver).toHaveBeenCalledWith(CURRENT_YEAR);
      expect(mockDbService.upsertDriver).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Driver'
      }));
      expect(mockDbService.upsertSeason).toHaveBeenCalledWith(CURRENT_YEAR, 123);
      expect(mockCachingUtils.invalidateCache).toHaveBeenCalledWith('seasons');
      
      expect(result).toEqual(expect.objectContaining({
        status: 'success',
        operation: 'refreshCurrentSeason',
        year: CURRENT_YEAR,
        championFound: true,
        championUpdated: true,
        cacheInvalidated: true
      }));
    });
    
    test('should handle no champion found', async () => {
      // Temporarily change the mock to return null
      mockErgastClient.fetchChampionDriver.mockResolvedValueOnce(null);
      
      const result = await syncSeasonsJob.refreshCurrentSeason();
      
      expect(mockDbService.upsertDriver).not.toHaveBeenCalled();
      expect(mockDbService.upsertSeason).toHaveBeenCalledWith(CURRENT_YEAR, null);
      expect(mockCachingUtils.invalidateCache).toHaveBeenCalledWith('seasons');
      
      expect(result).toEqual(expect.objectContaining({
        status: 'success',
        operation: 'refreshCurrentSeason',
        year: CURRENT_YEAR,
        championFound: false,
        championUpdated: false,
        cacheInvalidated: true
      }));
    });

    test('should handle API error', async () => {
      // Setup API error
      const apiError = new Error('API connection failed');
      mockErgastClient.fetchChampionDriver.mockRejectedValueOnce(apiError);
      
      const result = await syncSeasonsJob.refreshCurrentSeason();
      
      expect(mockErgastClient.fetchChampionDriver).toHaveBeenCalledWith(CURRENT_YEAR);
      expect(mockDbService.upsertDriver).not.toHaveBeenCalled();
      expect(mockDbService.upsertSeason).not.toHaveBeenCalled();
      
      expect(result).toEqual(expect.objectContaining({
        status: 'error',
        operation: 'refreshCurrentSeason',
        year: CURRENT_YEAR,
        error: 'API connection failed',
        championUpdated: false
      }));
    });

    test('should handle database error', async () => {
      // Setup DB error
      const dbError = new Error('Database connection failed');
      mockDbService.upsertDriver.mockRejectedValueOnce(dbError);
      
      const result = await syncSeasonsJob.refreshCurrentSeason();
      
      expect(mockErgastClient.fetchChampionDriver).toHaveBeenCalledWith(CURRENT_YEAR);
      expect(mockDbService.upsertDriver).toHaveBeenCalled();
      expect(mockDbService.upsertSeason).not.toHaveBeenCalled();
      
      expect(result).toEqual(expect.objectContaining({
        status: 'error',
        operation: 'refreshCurrentSeason',
        error: 'Database connection failed',
        championUpdated: false
      }));
    });

    test('should handle cache invalidation failure', async () => {
      // Setup cache invalidation failure
      mockCachingUtils.invalidateCache.mockResolvedValueOnce(false);
      
      const result = await syncSeasonsJob.refreshCurrentSeason();
      
      expect(mockErgastClient.fetchChampionDriver).toHaveBeenCalledWith(CURRENT_YEAR);
      expect(mockDbService.upsertDriver).toHaveBeenCalled();
      expect(mockDbService.upsertSeason).toHaveBeenCalled();
      expect(mockCachingUtils.invalidateCache).toHaveBeenCalledWith('seasons');
      
      expect(result).toEqual(expect.objectContaining({
        status: 'success',
        operation: 'refreshCurrentSeason',
        championFound: true,
        championUpdated: true,
        cacheInvalidated: false
      }));
    });

    test('should handle cache error', async () => {
      // Setup cache error
      const cacheError = new Error('Cache operation failed');
      mockCachingUtils.invalidateCache.mockRejectedValueOnce(cacheError);
      
      const result = await syncSeasonsJob.refreshCurrentSeason();
      
      expect(mockErgastClient.fetchChampionDriver).toHaveBeenCalledWith(CURRENT_YEAR);
      expect(mockDbService.upsertDriver).toHaveBeenCalled();
      expect(mockDbService.upsertSeason).toHaveBeenCalled();
      expect(mockCachingUtils.invalidateCache).toHaveBeenCalledWith('seasons');
      
      expect(result).toEqual(expect.objectContaining({
        status: 'error',
        operation: 'refreshCurrentSeason',
        error: 'Cache operation failed',
        championUpdated: true,
        cacheInvalidated: false
      }));
    });
  });
  
  describe('runSeasonSyncJob', () => {
    test('should call refreshCurrentSeason and return success result', async () => {
      const result = await syncSeasonsJob.runSeasonSyncJob();
      
      expect(mockErgastClient.fetchChampionDriver).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        status: 'success',
        duration: expect.any(Number),
        result: expect.objectContaining({
          status: 'success'
        })
      }));
    });

    test('should handle error in refreshCurrentSeason', async () => {
      // Setup error in refreshCurrentSeason
      mockErgastClient.fetchChampionDriver.mockRejectedValueOnce(new Error('API error'));
      
      const result = await syncSeasonsJob.runSeasonSyncJob();
      
      expect(result).toEqual(expect.objectContaining({
        status: 'error',
        duration: expect.any(Number),
        result: expect.objectContaining({
          status: 'error',
          error: 'API error'
        })
      }));
    });

    test('should handle unexpected errors', async () => {
      // Create a job with a broken dependency that will throw an unexpected error
      const brokenJob = createSyncSeasonsJob({
        dbService: null,
        ergastClient: {
          fetchChampionDriver: () => { throw new Error('Unexpected error'); }
        },
        cachingUtils: mockCachingUtils
      });
      
      const result = await brokenJob.runSeasonSyncJob();
      
      expect(result).toEqual(expect.objectContaining({
        status: 'error',
        error: 'Unexpected error',
        duration: expect.any(Number)
      }));
    });
  });
  
  describe('startCronJob', () => {
    test('should schedule a cron job', () => {
      const job = syncSeasonsJob.startCronJob();
      
      expect(cron.schedule).toHaveBeenCalledWith(SEASON_SYNC_CRON, expect.any(Function));
      expect(job).toBeDefined();
    });
    
    test('should run job immediately when specified', () => {
      // Mock setTimeout
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn();
      
      syncSeasonsJob.startCronJob(true);
      
      expect(global.setTimeout).toHaveBeenCalledWith(expect.any(Function), 2000);
      
      // Restore setTimeout
      global.setTimeout = originalSetTimeout;
    });

    test('should handle errors in immediate execution', () => {
      // Mock setTimeout to execute the callback function immediately
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn().mockImplementation((fn) => fn());
      
      // Make runSeasonSyncJob throw an error
      syncSeasonsJob.runSeasonSyncJob = jest.fn().mockImplementation(() => {
        throw new Error('Execution error');
      });
      
      // This should not throw due to error handling in setTimeout callback
      expect(() => {
        syncSeasonsJob.startCronJob(true);
      }).not.toThrow();
      
      expect(console.error).toHaveBeenCalled();
      
      // Restore setTimeout
      global.setTimeout = originalSetTimeout;
    });
  });

  describe('Module exports', () => {
    test('should export factory function and default instance', () => {
      const jobModule = require('../../jobs/syncSeasonsJob');
      
      expect(jobModule).toHaveProperty('createSyncSeasonsJob');
      expect(jobModule).toHaveProperty('refreshCurrentSeason');
      expect(jobModule).toHaveProperty('runSeasonSyncJob');
      expect(jobModule).toHaveProperty('startCronJob');
    });
  });
});
