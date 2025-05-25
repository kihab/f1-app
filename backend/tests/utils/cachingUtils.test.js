// tests/utils/cachingUtils.test.js

// Set test environment before importing modules
process.env.NODE_ENV = 'test';

// Import the factory function for testing
const { createCachingUtils } = require('../../utils/cachingUtils');

describe('cachingUtils', () => {
  // Mock redisClient
  let mockRedisClient;
  let mockClientInstance;
  let cachingUtils;

  beforeEach(() => {
    // Create mock client instance
    mockClientInstance = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn()
    };

    // Create mock redisClient module
    mockRedisClient = {
      getClient: jest.fn(() => mockClientInstance),
      createRedisClient: jest.fn()
    };

    // Create cachingUtils with mocked dependencies
    cachingUtils = createCachingUtils({
      redisClient: mockRedisClient
    });

    // Reset console mock
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getFromCache', () => {
    test('should return parsed data when cache hit occurs', async () => {
      // Setup
      const testKey = 'test-key';
      const testData = { foo: 'bar' };
      mockClientInstance.get.mockResolvedValue(JSON.stringify(testData));

      // Execute
      const result = await cachingUtils.getFromCache(testKey);

      // Verify
      expect(mockClientInstance.get).toHaveBeenCalledWith(testKey);
      expect(result).toEqual(testData);
    });

    test('should return null when key does not exist in cache', async () => {
      // Setup
      mockClientInstance.get.mockResolvedValue(null);

      // Execute
      const result = await cachingUtils.getFromCache('non-existent-key');

      // Verify
      expect(result).toBeNull();
    });

    test('should return null and log warning when Redis error occurs', async () => {
      // Setup
      mockClientInstance.get.mockRejectedValue(new Error('Redis connection error'));

      // Execute
      const result = await cachingUtils.getFromCache('test-key');

      // Verify
      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Cache retrieval error for key \'test-key\':')
      );
    });
  });

  describe('setInCache', () => {
    test('should set data in cache with TTL and return true on success', async () => {
      // Setup
      const testKey = 'test-key';
      const testData = { foo: 'bar' };
      const ttl = 300;
      mockClientInstance.set.mockResolvedValue('OK');

      // Execute
      const result = await cachingUtils.setInCache(testKey, testData, ttl);

      // Verify
      expect(mockClientInstance.set).toHaveBeenCalledWith(
        testKey, 
        JSON.stringify(testData), 
        'EX', 
        ttl
      );
      expect(result).toBe(true);
    });

    test('should use default TTL if not provided', async () => {
      // Setup
      const testKey = 'test-key';
      const testData = { foo: 'bar' };
      mockClientInstance.set.mockResolvedValue('OK');

      // Execute
      const result = await cachingUtils.setInCache(testKey, testData);

      // Verify
      expect(mockClientInstance.set).toHaveBeenCalledWith(
        testKey, 
        JSON.stringify(testData), 
        'EX', 
        300 // Default TTL
      );
      expect(result).toBe(true);
    });

    test('should return false and log warning when Redis error occurs', async () => {
      // Setup
      mockClientInstance.set.mockRejectedValue(new Error('Redis connection error'));

      // Execute
      const result = await cachingUtils.setInCache('test-key', { foo: 'bar' });

      // Verify
      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Cache storage error for key \'test-key\':')
      );
    });
  });

  describe('invalidateCache', () => {
    test('should delete key from cache and return true on success', async () => {
      // Setup
      const testKey = 'test-key';
      mockClientInstance.del.mockResolvedValue(1); // 1 key deleted

      // Execute
      const result = await cachingUtils.invalidateCache(testKey);

      // Verify
      expect(mockClientInstance.del).toHaveBeenCalledWith(testKey);
      expect(result).toBe(true);
    });

    test('should return false and log warning when Redis error occurs', async () => {
      // Setup
      mockClientInstance.del.mockRejectedValue(new Error('Redis connection error'));

      // Execute
      const result = await cachingUtils.invalidateCache('test-key');

      // Verify
      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Cache invalidation error for key \'test-key\':')
      );
    });
  });
});
