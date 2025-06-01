// services/seasonsService.js
// ------------------------------------------------------------
//  Business-logic layer: Seasons with gap-aware self-healing
// ------------------------------------------------------------

// Import default implementations, but these can be overridden with DI
const ergastClientDefault = require('../utils/ergastClient');
const constantsDefault = require('../config/constants');
const validationUtilsDefault = require('../utils/validationUtils');
const commonUtilsDefault = require('../utils/commonUtils');
const dbServiceDefault = require('./dbService');
const cachingUtilsDefault = require('../utils/cachingUtils');

/**
 * Factory function to create seasons service with injectable dependencies
 * @param {Object} deps - Dependencies for the seasons service
 * @param {Object} deps.dbService - Database service implementation
 * @param {Object} deps.ergastClient - Ergast API client implementation
 * @param {Object} deps.constants - Constants configuration
 * @param {Object} deps.validationUtils - Validation utilities
 * @param {Object} deps.commonUtils - Common utility functions
 * @param {Object} deps.cachingUtils - Redis caching utilities
 * @returns {Object} - Service object with seasons-related methods
 */
function createSeasonsService(deps = {}) {
  // Use provided dependencies or defaults
  const dbService = deps.dbService || dbServiceDefault;
  const ergastClient = deps.ergastClient || ergastClientDefault;
  const constants = deps.constants || constantsDefault;
  const validationUtils = deps.validationUtils || validationUtilsDefault;
  const commonUtils = deps.commonUtils || commonUtilsDefault;
  const cachingUtils = deps.cachingUtils || cachingUtilsDefault;
  
  // Destructure needed methods and constants from dependencies
  const { fetchChampionDriver } = ergastClient;
  const { START_YEAR, CURRENT_YEAR, CACHE_KEYS, CACHE_TTL } = constants;
  const { validateYear, validateDriverData } = validationUtils;
  const { logOperationStart, formatTimingLog } = commonUtils;
  const { getFromCache, setInCache } = cachingUtils;
  
  // Get cache keys from constants
  const SEASONS_CACHE_KEY = CACHE_KEYS.SEASONS;

  /**
   * Get all Formula 1 seasons with champions
   * @returns {Promise<Array>} - Array of season records with relations
   */
  async function getAllSeasons() {
    logOperationStart('getAllSeasons');
    const startTime = Date.now();

    // Try to get seasons from cache first
    const cachedSeasons = await getFromCache(SEASONS_CACHE_KEY);
    
    // If cache hit, return cached data and log
    if (cachedSeasons) {
      console.log('Served /api/seasons from Redis cache');
      console.log(formatTimingLog(startTime, 'getAllSeasons', { 
        source: 'cache',
        seasons: cachedSeasons.length
      }));
      return cachedSeasons;
    }
    
    // Log cache miss
    console.log('Cache for /api/seasons expired or missing, refreshing from database');
  
    // Query all seasons in the range, include champions if present
    let dbSeasons = await dbService.findSeasons(START_YEAR, CURRENT_YEAR);

  // Make a fast lookup for present years
  const seasonsByYear = {};
  dbSeasons.forEach(s => { seasonsByYear[s.year] = s; });

  // Build gap list for missing years
  const missingYears = [];
  for (let yr = START_YEAR; yr <= CURRENT_YEAR; yr++) {
    if (!seasonsByYear[yr]) missingYears.push(yr);
  }
  
  // Process missing years with our batch processor
  const processResult = await dbService.processBatch(
    missingYears,
    // Processing function for each year
    async (yr) => {
      // Validate year 
      validateYear(yr);
      
      // Fetch champion data from API
      const champion = await fetchChampionDriver(yr);
      
      // Skip years with no champion data
      if (!champion) {
        return; // No champion to process
      }
      
      // Validate champion data
      validateDriverData(champion);
      
      // Upsert driver (unique by driverRef)
      const driver = await dbService.upsertDriver(champion);

      // Upsert season with champion relation
      await dbService.upsertSeason(yr, driver.id);
    },
    'season' // Item name for logging
  );

  // Log summary of errors if any occurred during processing
  if (processResult.errors.length > 0) {
    console.error(`Completed with ${processResult.errors.length} errors:`,  
      processResult.errors.map(e => `Year ${e.id}: ${e.error}`).join(', '));
  }

  // Query all again to get updated set
  dbSeasons = await dbService.findSeasons(START_YEAR, CURRENT_YEAR);

  // Map seasons by year again for lookup
  const byYear = {};
  dbSeasons.forEach(s => { byYear[s.year] = s; });

  // Build the final response list: {year, champion: obj|null} for each year 2005-2025
  const result = [];
  for (let yr = START_YEAR; yr <= CURRENT_YEAR; yr++) {
    const s = byYear[yr];
    result.push({
      year: yr,
      champion: s && s.champion ? s.champion : null, // champion is null if not present
    });
  }
  
  // Store the result in Redis cache
  const cacheSuccess = await setInCache(SEASONS_CACHE_KEY, result, CACHE_TTL.SEASONS);
  
  // Log cache update status
  if (cacheSuccess) {
    console.log('Updated Redis cache for /api/seasons');
  }
  
  // Log completion with timing information
  console.log(formatTimingLog(startTime, 'getAllSeasons', { 
    seasons: result.length, 
    processed: processResult.processedCount,
    errors: processResult.errors.length,
    source: 'database',
    cached: cacheSuccess
  }));
  
  console.log('Served /api/seasons from database (cache refreshed)');
  
  return result;
}

  // Return the service object with all methods
  return {
    getAllSeasons
  };
}

// Create and export default instance for regular use
const defaultSeasonsService = createSeasonsService();

// Export both the factory function and default instance
module.exports = {
  createSeasonsService, // For tests to create with mocked dependencies
  ...defaultSeasonsService // Export methods directly for easy access
};
