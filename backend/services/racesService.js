// services/racesService.js
// ------------------------------------------------------------
//  Business-logic layer: Races
// ------------------------------------------------------------

// Import default implementations, but these can be overridden with DI
const ergastClientDefault = require('../utils/ergastClient');
const validationUtilsDefault = require('../utils/validationUtils');
const commonUtilsDefault = require('../utils/commonUtils');
const dbServiceDefault = require('./dbService');

/**
 * Factory function to create races service with injectable dependencies
 * @param {Object} deps - Dependencies for the races service
 * @param {Object} deps.dbService - Database service implementation
 * @param {Object} deps.ergastClient - Ergast API client implementation
 * @param {Object} deps.validationUtils - Validation utilities
 * @param {Object} deps.commonUtils - Common utility functions
 * @returns {Object} - Service object with races-related methods
 */
function createRacesService(deps = {}) {
  // Use provided dependencies or defaults
  const dbService = deps.dbService || dbServiceDefault;
  const ergastClient = deps.ergastClient || ergastClientDefault;
  const validationUtils = deps.validationUtils || validationUtilsDefault;
  const commonUtils = deps.commonUtils || commonUtilsDefault;
  
  // Destructure needed methods from dependencies
  const { fetchSeasonResults } = ergastClient;
  const { validateYear, validateDriverData, validateRaceData } = validationUtils;
  const { logOperationStart, formatTimingLog } = commonUtils;

  /**
   * Get all races for a specific season with winners
   * @param {number} year - Season year to retrieve races for
   * @returns {Promise<Array>} - Array of race records with relations
   */
  async function getRacesBySeason(year) {
    logOperationStart('getRacesBySeason', { year });
    const startTime = Date.now();
    
    // Validate year is within acceptable range
    try {
      validateYear(year);
    } catch (err) {
      throw new Error(`Invalid year: ${err.message}`);
    }

  // Fast path - check if races already exist in DB
  let existing = await dbService.findRacesBySeason(year);
  if (existing.length) return existing;

  // Seed path - fetch data from external API
  let results;
  try {
    results = await fetchSeasonResults(year);
  } catch (err) {
    // Handle API fetch errors without crashing
    console.error(`Failed to fetch results for year ${year}: ${err.message}`);
    throw new Error(`Failed to fetch race data for ${year}: ${err.message}`);
  }

  // Process races with our batch processor
  const processResult = await dbService.processBatch(
    // Filter out races without winner data
    results.filter(r => r.winner),
    // Processing function for each race
    async (race) => {
      // Validate race data
      validateRaceData({
        name: race.name,
        round: race.round
      });

      // Validate driver data
      validateDriverData(race.winner);
      
      // Upsert driver and get the driver record
      const driver = await dbService.upsertDriver(race.winner);
      
      // Upsert race with winner relation
      await dbService.upsertRace(
        year,
        race.round,
        race.name,
        driver.id
      );
    },
    'race' // Item name for logging
  );

  // Log errors if any occurred during processing
  if (processResult.errors.length > 0) {
    console.error(`Completed with ${processResult.errors.length} errors:`,  
      processResult.errors.map(e => `Race ${e.id}: ${e.error}`).join(', '));
  }

  // Final query to get all races with relations
  existing = await dbService.findRacesBySeason(year);
  
  // Log completion with timing information
  console.log(formatTimingLog(startTime, 'getRacesBySeason', { 
    year, 
    races: existing.length,
    processed: processResult.processedCount,
    errors: processResult.errors.length 
  }));
  
  return existing;
}

  // Return the service object with all methods
  return {
    getRacesBySeason
  };
}

// Create and export default instance for regular use
const defaultRacesService = createRacesService();

// Export both the factory function and default instance
module.exports = {
  createRacesService, // For tests to create with mocked dependencies
  ...defaultRacesService // Export methods directly for easy access
};
