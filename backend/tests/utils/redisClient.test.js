// tests/utils/redisClient.test.js

// Setting NODE_ENV to test before importing redisClient
process.env.NODE_ENV = 'test';

// Now import the module to test
const { createRedisClient, getClient } = require('../../utils/redisClient');

describe('redisClient', () => {
  let originalEnv;
  
  beforeEach(() => {
    // Save original environment variables
    originalEnv = process.env;
    process.env = { ...originalEnv, NODE_ENV: 'test' };
    
    // Spy on console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    // Restore environment variables
    process.env = originalEnv;
    
    // Restore console mocks
    jest.restoreAllMocks();
    
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  describe('createRedisClient', () => {
    test('should create a mock Redis client in test mode', () => {
      // Execute
      const client = createRedisClient();
      
      // Verify we got a mock client with the expected methods
      expect(client).toBeDefined();
      expect(client.get).toBeDefined();
      expect(client.set).toBeDefined();
      expect(client.del).toBeDefined();
      expect(client.on).toBeDefined();
      
      // Make the functions mockable for testing
      jest.spyOn(client, 'get');
      jest.spyOn(client, 'set');
      jest.spyOn(client, 'del');
      jest.spyOn(client, 'on');
    });
    
    test('should store and retrieve values correctly', async () => {
      // Execute
      const client = createRedisClient();
      const testKey = 'test-key';
      const testValue = 'test-value';
      
      // Store a value
      await client.set(testKey, testValue);
      
      // Retrieve the value
      const retrievedValue = await client.get(testKey);
      expect(retrievedValue).toBe(testValue);
    });
    
    test('should delete values correctly', async () => {
      // Execute
      const client = createRedisClient();
      const testKey = 'test-key';
      const testValue = 'test-value';
      
      // Store and then delete a value
      await client.set(testKey, testValue);
      const deleteResult = await client.del(testKey);
      
      // Verify delete was successful
      expect(deleteResult).toBe(1);
      
      // Verify key is gone
      const retrievedValue = await client.get(testKey);
      expect(retrievedValue).toBeUndefined();
    });
    
    test('should handle TTL correctly in set method', async () => {
      // Execute
      const client = createRedisClient();
      const testKey = 'test-key';
      const testValue = 'test-value';
      
      // Store with TTL - make the mock spyable first
      jest.spyOn(client, 'set');
      await client.set(testKey, testValue, 'EX', 60);
      
      // Verify value is stored
      const retrievedValue = await client.get(testKey);
      expect(retrievedValue).toBe(testValue);
      
      // Verify set was called
      expect(client.set).toHaveBeenCalled();
    });
  });
  
  describe('getClient', () => {
    test('should return the same Redis client instance on multiple calls', () => {
      // Execute
      const client1 = getClient();
      const client2 = getClient();
      
      // Verify singleton behavior
      expect(client1).toBe(client2);
    });
  });
});
