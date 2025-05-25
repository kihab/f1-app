# Redis Caching Strategy

## Overview

This document outlines the caching strategy implemented in the F1 application backend. Caching is used to improve performance by storing frequently accessed data in Redis, reducing database queries and external API calls.

## Technology

- **Library**: [ioredis](https://github.com/luin/ioredis) - A robust, feature-rich Redis client for Node.js
- **Cache Store**: Redis - An in-memory data structure store used as a database, cache, and message broker

## Architecture

### Caching Flow

1. **Request Handling**: When a request is received for seasons or races data
2. **Cache Check**: System first checks if data exists in Redis cache
3. **Cache Hit**: If data is found in cache, it's returned immediately with a log message
4. **Cache Miss**: If data is not in cache:
   - Check database for data
   - If found in database, return data and update cache
   - If not found in database, fetch from external API, store in database, and then cache
5. **Response**: Return data to client

```
┌───────────┐     ┌───────┐     ┌─────────┐     ┌────────────┐
│  Request  │────▶│ Redis │────▶│ Success │────▶│ Return Data│
└───────────┘     └───┬───┘     └─────────┘     └────────────┘
                      │
                      │ Cache Miss
                      ▼
                  ┌───────┐     ┌─────────┐     ┌────────┐     ┌────────────┐
                  │  DB   │────▶│ Success │────▶│ Cache  │────▶│ Return Data│
                  └───┬───┘     └─────────┘     └────────┘     └────────────┘
                      │
                      │ Not Found
                      ▼
                  ┌───────┐     ┌─────────┐     ┌────────┐     ┌────────┐     ┌────────────┐
                  │  API  │────▶│ Success │────▶│   DB   │────▶│ Cache  │────▶│ Return Data│
                  └───────┘     └─────────┘     └────────┘     └────────┘     └────────────┘
```

## Implementation

### Utility Modules

#### 1. `redisClient.js`

Provides a unified interface for Redis operations:

- **Features**:
  - Singleton pattern for Redis client
  - Automatic reconnection handling
  - Connection event logging
  - Mock client for testing environments

#### 2. `cachingUtils.js`

Abstracts caching operations with methods for:

- **getFromCache**: Retrieves and parses data from cache
- **setInCache**: Serializes and stores data in cache with TTL
- **invalidateCache**: Removes specific keys from cache

### Service Integration

#### 1. Seasons Caching (`seasonsService.js`)

- **Cache Key**: `seasons`
- **Pattern**: Cache checked before database query or API call
- **Data Flow**:
  - Check cache for seasons
  - If cache miss, query database
  - If database missing seasons, fetch from API
  - Store results in cache for future requests
- **Log Messages**:
  - "Served /api/seasons from Redis cache"
  - "Cache for /api/seasons expired or missing, refreshing from database"
  - "Updated Redis cache for /api/seasons"

#### 2. Races Caching (`racesService.js`)

- **Cache Key Format**: `races:${year}` (e.g., `races:2023`)
- **Pattern**: Cache checked before database query or API call
- **Data Flow**:
  - Check cache for races by year
  - If cache miss, query database for races in that year
  - If database missing races, fetch from API
  - Store results in cache for future requests
- **Log Messages**:
  - "Served /api/races/${year} from Redis cache"
  - "Cache for /api/races/${year} expired or missing, refreshing from database"
  - "Updated Redis cache for /api/races/${year}"

## Configuration

### Cache TTL (Time-To-Live)

Cache expiration times are configured in `config/constants.js`:

```javascript
const CACHE_TTL = {
    SEASONS: 300, // 5 minutes for seasons data
    RACES: 300,   // 5 minutes for races data
    // Add other cache TTLs as needed
};
```

This allows easy configuration of cache invalidation times without code changes.

### Environment Variables

- **REDIS_HOST**: Redis server hostname (default: `localhost`, Docker: `redis`)
- **REDIS_PORT**: Redis server port (default: `6379`)

## Docker Integration

The application is fully integrated with Docker, with Redis automatically included in the docker-compose setup:

```yaml
# Redis service in docker-compose.yml
redis:
  image: redis:alpine
  ports:
    - "6379:6379"
  volumes:
    - redis-data:/data
```

**No manual setup required** - Redis automatically starts with the application when running:

```bash
docker-compose up
```

The backend service is configured to connect to Redis using the service name `redis` as the hostname.

## Testing

Caching functionality is thoroughly tested with:

- **Mock Redis Client**: Automatically used in test environment
- **Unit Tests**: Cover cache hit/miss scenarios, error handling
- **Dependency Injection**: Allows easy mocking for tests

## Future Improvements

1. **Cache Prefetching**: Implement background jobs to proactively refresh cache before expiration

2. **Selective Invalidation**: Add endpoints or triggers to selectively invalidate cache entries when data changes

3. **Cache Compression**: Implement compression for large datasets to reduce memory usage

4. **Cache Analytics**: Add monitoring for cache hit/miss ratios and performance metrics

5. **Rate Limiting Integration**: Use Redis for rate limiting API requests

6. **Circuit Breaker Pattern**: Implement Redis-based circuit breaker for external API calls

7. **Distributed Locking**: Use Redis for distributed locks when performing updates across multiple instances

8. **Cache Partitioning**: Implement more granular cache keys for partial data updates

9. **Redis Cluster**: Configure Redis clustering for high availability and better performance

10. **Cache Warm-up**: Implement startup routines to warm the cache with commonly accessed data
