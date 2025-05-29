// jobs/syncSeasonsJob.js
// ------------------------------------------------------------
//  Async Cron Job for F1 Data Refresh
//  - Runs automatically on backend startup
//  - Always refreshes current season data directly from API
//  - Updates database and invalidates cache for consistency
// ------------------------------------------------------------

const cron = require('node-cron');
const { SEASON_SYNC_CRON, CURRENT_YEAR } = require('../config/constants');

// Import default implementations, but these can be overridden with DI
const dbServiceDefault = require('../services/dbService');
const ergastClientDefault = require('../utils/ergastClient');
const cachingUtilsDefault = require('../utils/cachingUtils');

/**
 * Factory function to create seasons sync job with injectable dependencies
 * @param {Object} deps - Dependencies for the sync job
 * @param {Object} deps.dbService - Database service implementation
 * @param {Object} deps.ergastClient - Ergast API client implementation
 * @param {Object} deps.cachingUtils - Redis caching utilities
 * @returns {Object} - Sync job object with methods
 */
function createSyncSeasonsJob(deps = {}) {
  // Use provided dependencies or defaults
  const dbService = deps.dbService || dbServiceDefault;
  const ergastClient = deps.ergastClient || ergastClientDefault;
  const cachingUtils = deps.cachingUtils || cachingUtilsDefault;
  
  // Cache key for seasons data (matching the one used in seasonsService)
  const SEASONS_CACHE_KEY = 'seasons';

  /**
   * Directly updates the current season data by fetching from API
   * and refreshing all data layers (DB and cache)
   * @returns {Promise<Object>} - Update results with summary stats
   */
  async function refreshCurrentSeason() {
    console.log(`[CRON] Refreshing current season (${CURRENT_YEAR}) data directly from API`);
    const startTime = Date.now();
    let cacheInvalidated = false;
    let championUpdated = false;

    try {
      // 1. Directly fetch current year champion from API - bypassing any cache/DB checks
      console.log(`[CRON] Calling Ergast API for ${CURRENT_YEAR} champion data...`);
      const champion = await ergastClient.fetchChampionDriver(CURRENT_YEAR);
      
      // 2. Update database with the fresh data
      if (champion) {
        console.log(`[CRON] Got champion data for ${CURRENT_YEAR}: ${champion.name}`);
        // Upsert driver record
        const driver = await dbService.upsertDriver(champion);
        // Upsert season with the champion relation
        await dbService.upsertSeason(CURRENT_YEAR, driver.id);
        championUpdated = true;
      } else {
        console.log(`[CRON] No champion data available yet for ${CURRENT_YEAR}`);
        // Ensure season record exists for current year even without champion
        await dbService.upsertSeason(CURRENT_YEAR, null);
      }
      
      // 3. Invalidate cache to ensure fresh data on next request
      console.log(`[CRON] Invalidating seasons cache...`);
      cacheInvalidated = await cachingUtils.invalidateCache(SEASONS_CACHE_KEY);
      if (cacheInvalidated) {
        console.log(`[CRON] Successfully invalidated seasons cache`);
      } else {
        console.warn(`[CRON] Failed to invalidate seasons cache`);
      }
      
      const duration = Date.now() - startTime;
      console.log(`[CRON] Current season refresh completed in ${duration}ms`);
      
      return {
        status: 'success',
        operation: 'refreshCurrentSeason',
        year: CURRENT_YEAR,
        duration,
        championFound: champion !== null,
        championUpdated,
        cacheInvalidated
      };
    } catch (error) {
      console.error(`[CRON] Error refreshing current season: ${error.message}`);
      return {
        status: 'error',
        operation: 'refreshCurrentSeason',
        year: CURRENT_YEAR,
        error: error.message,
        championUpdated,
        cacheInvalidated
      };
    }
  }

  /**
   * Runs the simplified season sync job - only focuses on
   * refreshing current year data directly from API
   * @returns {Promise<Object>} - Results of the sync operation
   */
  async function runSeasonSyncJob() {
    console.log('[CRON] Starting F1 current season refresh job');
    const jobStartTime = Date.now();

    try {
      // Simply refresh current season data from API
      const result = await refreshCurrentSeason();
      
      const jobDuration = Date.now() - jobStartTime;
      console.log(`[CRON] F1 current season refresh job completed in ${jobDuration}ms`);
      
      return {
        status: result.status === 'error' ? 'error' : 'success',
        duration: jobDuration,
        result
      };
    } catch (error) {
      console.error(`[CRON] F1 season sync job failed: ${error.message}`);
      return {
        status: 'error',
        error: error.message,
        duration: Date.now() - jobStartTime
      };
    }
  }

  /**
   * Initializes and starts the cron job schedule
   * @param {boolean} runImmediately - Whether to execute the job immediately on startup
   * @returns {Object} - The scheduled cron job
   */
  function startCronJob(runImmediately = false) {
    console.log(`Scheduling F1 data refresh cron job: ${SEASON_SYNC_CRON}`);
    
    // Schedule the cron job
    const job = cron.schedule(SEASON_SYNC_CRON, async () => {
      console.log('Cron job triggered for F1 data refresh');
      await runSeasonSyncJob();
    });
    
    // Execute job immediately on startup if requested
    if (runImmediately) {
      console.log('Running F1 data refresh job immediately on startup');
      // Use setTimeout to ensure app initialization is complete
      setTimeout(async () => {
        try {
          await runSeasonSyncJob();
        } catch (error) {
          console.error('Error running job on startup:', error);
        }
      }, 2000); // 2-second delay to allow app to fully initialize
    }
    
    return job;
  }

  // Return the service object with all methods
  return {
    runSeasonSyncJob,
    refreshCurrentSeason,
    startCronJob
  };
}

// Create and export default instance for regular use
const defaultSyncSeasonsJob = createSyncSeasonsJob();

// Export both the factory function and default instance
module.exports = {
  createSyncSeasonsJob, // For tests to create with mocked dependencies
  ...defaultSyncSeasonsJob // Export methods directly for easy access
};
