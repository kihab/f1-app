// services/racesService.js
// ------------------------------------------------------------
//  Business-logic layer: Races
// ------------------------------------------------------------

const { fetchSeasonResults } = require('../utils/ergastClient');
const { validateYear, validateDriverData, validateRaceData } = require('../utils/validationUtils');
const { logOperationStart, formatTimingLog } = require('../utils/commonUtils');
const dbService = require('./dbService');

/**
 * getRacesBySeason
 * ----------------
 * 1) Fast-path: if DB has races for this year → return
 * 2) Otherwise:
 *    a) fetch all races+winner via Ergast helper
 *    b) upsert driver + race for each entry
 *    c) 100 ms throttle between upserts
 * 3) Re-query DB (with winner relation) → return
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

module.exports = { getRacesBySeason };
