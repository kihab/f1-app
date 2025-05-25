// Import the dbService module
const { createDbService } = require('../../services/dbService');

// Mock the Prisma client
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => {
      // Return a mock client
      return {
        driver: {
          upsert: jest.fn(),
          findMany: jest.fn(),
        },
        season: {
          upsert: jest.fn(),
          findMany: jest.fn(),
        },
        race: {
          upsert: jest.fn(),
          findMany: jest.fn(),
        },
        $connect: jest.fn(),
        $disconnect: jest.fn(),
      };
    })
  };
});
// Mock the commonUtils module for sleep function
jest.mock('../../utils/commonUtils', () => ({
  sleep: jest.fn(() => Promise.resolve())
}));

// Mock the constants module
jest.mock('../../config/constants', () => ({
  THROTTLE_MS: 100
}));

// Import the sleep function to verify calls
const { sleep } = require('../../utils/commonUtils');

describe('dbService', () => {
  let dbService;
  let mockPrisma;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Create mock Prisma instance
    mockPrisma = new (require('@prisma/client').PrismaClient)();
    
    // Create dbService instance with the mock
    dbService = createDbService({ prisma: mockPrisma });
  });

  describe('createDbService', () => {
    test('should create service with provided prisma client', () => {
      // Create a custom mock Prisma client
      const customPrisma = { customField: 'test' };
      
      // Create service with custom client
      const customService = createDbService({ prisma: customPrisma });
      
      // Verify the service is using the custom client
      expect(customService.prisma).toBe(customPrisma);
    });

    test('should create service with default prisma client if not provided', () => {
      // Get the PrismaClient constructor
      const { PrismaClient } = require('@prisma/client');
      
      // Record how many times it's been called so far
      const callCountBefore = PrismaClient.mock.calls.length;
      
      // Create service without specifying a client
      const defaultService = createDbService();
      
      // Should have created a new Prisma client
      expect(defaultService.prisma).toBeDefined();
      expect(PrismaClient).toHaveBeenCalledTimes(callCountBefore + 1);
    });
  });

  describe('upsertDriver', () => {
    test('should call prisma.driver.upsert with correct parameters', async () => {
      // Setup mock return value
      const mockDriver = { id: 'driver1', driverRef: 'lewis', name: 'Lewis Hamilton' };
      mockPrisma.driver.upsert.mockResolvedValue(mockDriver);
      
      // Test data
      const driverData = { driverRef: 'lewis', name: 'Lewis Hamilton' };
      
      // Call the function
      const result = await dbService.upsertDriver(driverData);
      
      // Verify prisma was called correctly
      expect(mockPrisma.driver.upsert).toHaveBeenCalledWith({
        where: { driverRef: 'lewis' },
        update: { name: 'Lewis Hamilton' },
        create: { driverRef: 'lewis', name: 'Lewis Hamilton' },
      });
      
      // Verify the result
      expect(result).toBe(mockDriver);
    });

    test('should propagate errors from prisma.driver.upsert', async () => {
      // Setup mock to throw an error
      const mockError = new Error('Database error');
      mockPrisma.driver.upsert.mockRejectedValue(mockError);
      
      // Test data
      const driverData = { driverRef: 'lewis', name: 'Lewis Hamilton' };
      
      // Call the function and expect it to throw
      await expect(dbService.upsertDriver(driverData)).rejects.toThrow('Database error');
    });
  });

  describe('upsertSeason', () => {
    test('should call prisma.season.upsert with correct parameters', async () => {
      // Setup mock return value
      const mockSeason = { id: 'season1', year: 2023, championDriverId: 'driver1' };
      mockPrisma.season.upsert.mockResolvedValue(mockSeason);
      
      // Call the function
      const result = await dbService.upsertSeason(2023, 'driver1');
      
      // Verify prisma was called correctly
      expect(mockPrisma.season.upsert).toHaveBeenCalledWith({
        where: { year: 2023 },
        update: { championDriverId: 'driver1' },
        create: { year: 2023, championDriverId: 'driver1' },
      });
      
      // Verify the result
      expect(result).toBe(mockSeason);
    });

    test('should handle null championDriverId', async () => {
      // Setup mock return value
      const mockSeason = { id: 'season1', year: 2023, championDriverId: null };
      mockPrisma.season.upsert.mockResolvedValue(mockSeason);
      
      // Call the function with null championDriverId
      const result = await dbService.upsertSeason(2023, null);
      
      // Verify prisma was called correctly with null
      expect(mockPrisma.season.upsert).toHaveBeenCalledWith({
        where: { year: 2023 },
        update: { championDriverId: null },
        create: { year: 2023, championDriverId: null },
      });
      
      // Verify the result
      expect(result).toBe(mockSeason);
    });

    test('should propagate errors from prisma.season.upsert', async () => {
      // Setup mock to throw an error
      const mockError = new Error('Database error');
      mockPrisma.season.upsert.mockRejectedValue(mockError);
      
      // Call the function and expect it to throw
      await expect(dbService.upsertSeason(2023, 'driver1')).rejects.toThrow('Database error');
    });
  });

  describe('upsertRace', () => {
    test('should call prisma.race.upsert with correct parameters', async () => {
      // Setup mock return value
      const mockRace = {
        id: 'race1',
        seasonYear: 2023,
        round: 1,
        name: 'Bahrain Grand Prix',
        winnerDriverId: 'driver1'
      };
      mockPrisma.race.upsert.mockResolvedValue(mockRace);
      
      // Call the function
      const result = await dbService.upsertRace(2023, 1, 'Bahrain Grand Prix', 'driver1');
      
      // Verify prisma was called correctly
      expect(mockPrisma.race.upsert).toHaveBeenCalledWith({
        where: { seasonYear_round: { seasonYear: 2023, round: 1 } },
        update: { name: 'Bahrain Grand Prix', winnerDriverId: 'driver1' },
        create: {
          seasonYear: 2023,
          round: 1,
          name: 'Bahrain Grand Prix',
          winnerDriverId: 'driver1',
        },
      });
      
      // Verify the result
      expect(result).toBe(mockRace);
    });

    test('should propagate errors from prisma.race.upsert', async () => {
      // Setup mock to throw an error
      const mockError = new Error('Database error');
      mockPrisma.race.upsert.mockRejectedValue(mockError);
      
      // Call the function and expect it to throw
      await expect(dbService.upsertRace(2023, 1, 'Bahrain Grand Prix', 'driver1'))
        .rejects.toThrow('Database error');
    });
  });

  describe('findSeasons', () => {
    test('should call prisma.season.findMany with correct parameters', async () => {
      // Setup mock return value
      const mockSeasons = [
        { id: 'season1', year: 2023, championDriverId: 'driver1', champion: { name: 'Driver 1' } },
        { id: 'season2', year: 2024, championDriverId: 'driver2', champion: { name: 'Driver 2' } },
      ];
      mockPrisma.season.findMany.mockResolvedValue(mockSeasons);
      
      // Call the function
      const result = await dbService.findSeasons(2023, 2024);
      
      // Verify prisma was called correctly
      expect(mockPrisma.season.findMany).toHaveBeenCalledWith({
        where: { year: { gte: 2023, lte: 2024 } },
        include: { champion: true },
      });
      
      // Verify the result
      expect(result).toBe(mockSeasons);
    });

    test('should respect includeChampion parameter', async () => {
      // Call the function with includeChampion = false
      await dbService.findSeasons(2023, 2024, false);
      
      // Verify prisma was called without include
      expect(mockPrisma.season.findMany).toHaveBeenCalledWith({
        where: { year: { gte: 2023, lte: 2024 } },
        include: undefined,
      });
    });

    test('should propagate errors from prisma.season.findMany', async () => {
      // Setup mock to throw an error
      const mockError = new Error('Database error');
      mockPrisma.season.findMany.mockRejectedValue(mockError);
      
      // Call the function and expect it to throw
      await expect(dbService.findSeasons(2023, 2024)).rejects.toThrow('Database error');
    });
  });

  describe('findRacesBySeason', () => {
    test('should call prisma.race.findMany with correct parameters', async () => {
      // Setup mock return value
      const mockRaces = [
        { id: 'race1', seasonYear: 2023, round: 1, name: 'Race 1', winner: { name: 'Driver 1' } },
        { id: 'race2', seasonYear: 2023, round: 2, name: 'Race 2', winner: { name: 'Driver 2' } },
      ];
      mockPrisma.race.findMany.mockResolvedValue(mockRaces);
      
      // Call the function
      const result = await dbService.findRacesBySeason(2023);
      
      // Verify prisma was called correctly
      expect(mockPrisma.race.findMany).toHaveBeenCalledWith({
        where: { seasonYear: 2023 },
        include: {
          winner: true,
          season: {
            select: { championDriverId: true }
          },
        },
        orderBy: { round: 'asc' },
      });
      
      // Verify the result
      expect(result).toBe(mockRaces);
    });

    test('should respect includeWinner parameter', async () => {
      // Call the function with includeWinner = false
      await dbService.findRacesBySeason(2023, false);
      
      // Verify prisma was called with includeWinner = false
      expect(mockPrisma.race.findMany).toHaveBeenCalledWith({
        where: { seasonYear: 2023 },
        include: {
          winner: false,
          season: {
            select: { championDriverId: true }
          },
        },
        orderBy: { round: 'asc' },
      });
    });

    test('should propagate errors from prisma.race.findMany', async () => {
      // Setup mock to throw an error
      const mockError = new Error('Database error');
      mockPrisma.race.findMany.mockRejectedValue(mockError);
      
      // Call the function and expect it to throw
      await expect(dbService.findRacesBySeason(2023)).rejects.toThrow('Database error');
    });
  });

  describe('processBatch', () => {
    test('should process all items successfully', async () => {
      // Test items to process
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
      
      // Mock process function that always succeeds
      const processFn = jest.fn().mockResolvedValue(undefined);
      
      // Process the batch
      const result = await dbService.processBatch(items, processFn, 'test-item');
      
      // Verify all items were processed
      expect(processFn).toHaveBeenCalledTimes(3);
      expect(processFn).toHaveBeenNthCalledWith(1, { id: 1 });
      expect(processFn).toHaveBeenNthCalledWith(2, { id: 2 });
      expect(processFn).toHaveBeenNthCalledWith(3, { id: 3 });
      
      // Verify throttling was applied between operations
      expect(sleep).toHaveBeenCalledTimes(3);
      expect(sleep).toHaveBeenCalledWith(100); // THROTTLE_MS from mocked constants
      
      // Verify the result contains correct counts
      expect(result).toEqual({
        errors: [],
        processedCount: 3,
        totalCount: 3
      });
    });

    test('should handle and collect errors during processing', async () => {
      // Test items to process
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
      
      // Mock process function that fails for the second item
      const processFn = jest.fn()
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Process error'))
        .mockResolvedValueOnce(undefined);
      
      // Process the batch
      const result = await dbService.processBatch(items, processFn, 'test-item');
      
      // Verify all items were attempted
      expect(processFn).toHaveBeenCalledTimes(3);
      
      // Verify throttling was still applied even after errors
      expect(sleep).toHaveBeenCalledTimes(3);
      
      // Verify the result contains error information
      expect(result).toEqual({
        errors: [{ id: 2, error: 'Process error' }],
        processedCount: 2,
        totalCount: 3
      });
    });

    test('should handle items with round property as identifier', async () => {
      // Test items with round property instead of id
      const items = [{ round: 1 }, { round: 2 }];
      
      // Mock process function that fails for all items
      const processFn = jest.fn().mockRejectedValue(new Error('Process error'));
      
      // Process the batch
      const result = await dbService.processBatch(items, processFn, 'race');
      
      // Verify error objects use the round property
      expect(result.errors).toEqual([
        { id: 1, error: 'Process error' },
        { id: 2, error: 'Process error' }
      ]);
    });

    test('should handle items with year property as identifier', async () => {
      // Test items with year property
      const items = [{ year: 2023 }, { year: 2024 }];
      
      // Mock process function that fails for all items
      const processFn = jest.fn().mockRejectedValue(new Error('Process error'));
      
      // Process the batch
      const result = await dbService.processBatch(items, processFn, 'season');
      
      // Verify error objects use the year property
      expect(result.errors).toEqual([
        { id: 2023, error: 'Process error' },
        { id: 2024, error: 'Process error' }
      ]);
    });

    test('should handle unknown item identifier', async () => {
      // Test item with no identifiable property
      const items = [{ someProperty: 'value' }];
      
      // Mock process function that fails
      const processFn = jest.fn().mockRejectedValue(new Error('Process error'));
      
      // Process the batch
      const result = await dbService.processBatch(items, processFn, 'item');
      
      // Verify error object uses 'unknown' as id
      expect(result.errors).toEqual([{ id: 'unknown', error: 'Process error' }]);
    });
  });
});
