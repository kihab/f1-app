// utils/redisClient.js
// ------------------------------------------------------------
// Redis client singleton for caching
// ------------------------------------------------------------

const Redis = require('ioredis');

/**
 * Create a Redis client instance using environment variables for configuration
 * @returns {Redis} Configured Redis client instance or mock for testing
 */
function createRedisClient() {
  // Skip actual Redis connection in test environment
  if (process.env.NODE_ENV === 'test') {
    // Return a mock client for testing
    return createMockRedisClient();
  }
  
  // Get Redis connection information from environment variables
  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = process.env.REDIS_PORT || 6379;

  // Create Redis client instance
  const client = new Redis({
    host: redisHost,
    port: redisPort,
    // Enable automatic reconnection with exponential backoff
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      console.warn(`Redis connection attempt ${times} failed. Retrying in ${delay}ms...`);
      return delay;
    }
  });

  // Log Redis connection events
  client.on('connect', () => {
    console.log(`Connected to Redis at ${redisHost}:${redisPort}`);
  });

  client.on('error', (err) => {
    console.warn(`Redis error: ${err.message}`);
  });

  client.on('reconnecting', () => {
    console.warn('Reconnecting to Redis...');
  });

  return client;
}

/**
 * Creates a mock Redis client for testing purposes
 * @returns {Object} A mock Redis client with the same interface
 */
function createMockRedisClient() {
  // Create a mock client with the same interface but no actual connection
  const mockClient = {
    // Storage for testing
    _storage: new Map(),
    
    // Basic Redis methods
    get: async (key) => mockClient._storage.get(key),
    set: async (key, value) => {
      mockClient._storage.set(key, value);
      return 'OK';
    },
    del: async (key) => {
      return mockClient._storage.delete(key) ? 1 : 0;
    },
    
    // Event emitter methods
    on: function() { return this; },
    
    // Additional methods for testing
    disconnect: async () => true
  };
  
  // For test environment with Jest (avoiding direct reference to Jest)
  // ESLint safe approach to mock functions
  if (process.env.NODE_ENV === 'test') {
    // Make a backup of the methods
    const originalGet = mockClient.get;
    const originalSet = mockClient.set;
    const originalDel = mockClient.del;
    const originalOn = mockClient.on;
    const originalDisconnect = mockClient.disconnect;
    
    // Replace with functions that can be spied on in tests
    mockClient.get = function() { return originalGet.apply(this, arguments); };
    mockClient.set = function() { return originalSet.apply(this, arguments); };
    mockClient.del = function() { return originalDel.apply(this, arguments); };
    mockClient.on = function() { return originalOn.apply(this, arguments); };
    mockClient.disconnect = function() { return originalDisconnect.apply(this, arguments); };
  }
  
  // We don't need to simulate events in tests
  // Just log that mock client was created
  console.log('Mock Redis client created');
  
  return mockClient;
}

// Create a singleton instance
const redisClient = createRedisClient();

module.exports = {
  getClient: () => redisClient, // Export a function to get the singleton instance
  createRedisClient // Export factory function for testing with mock Redis
};
