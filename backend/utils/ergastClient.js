// utils/ergastClient.js
// ------------------------------------------------------------
//  External-API Helper – Ergast
//  -----------------------------------------------------------
//  fetchChampionDriver(year)
//    • Returns   → { driverRef, name }        (champion found)
//    • Returns   → null                      (season not finished / no data)
//    • Throws    → Error (network or API failure other than 429)
//    • Retries   → Once, with 1-second back-off when HTTP-429
// ------------------------------------------------------------

const axios = require('axios');
const { ERGAST_BASE_URL, REQUEST_TIMEOUT_MS, MAX_RETRY_ATTEMPTS } = require('../config/constants');
const { validateYear } = require('./validationUtils');
const { sleep, logOperationStart, formatTimingLog } = require('./commonUtils');

/**
 * Makes an API request with retry logic for rate limiting
 * @param {string} url - The URL to request
 * @param {number} attempt - Current attempt number (starts at 0)
 * @param {string} operationName - Name of the operation for logging
 * @returns {Promise<Object>} - Response data
 */
async function makeApiRequestWithRetry(url, attempt = 0, operationName) {
  const startTime = Date.now();
  
  try {
    const { data } = await axios.get(url, { timeout: REQUEST_TIMEOUT_MS });
    console.log(formatTimingLog(startTime, `${operationName} API request`, { url }));
    return data;
  } catch (err) {
    // Retry up to MAX_RETRY_ATTEMPTS times for HTTP 429 (rate limiting)
    if (err.response?.status === 429 && attempt < MAX_RETRY_ATTEMPTS) {
      console.log("********* 429 RATE LIMIT HEADERS *********");
      console.log(err.response.headers);
      console.log("******************************************");
      
      // Read the Retry-After header (in seconds) or use default
      const ra = err.response.headers['retry-after'];
      const waitSec = ra ? parseInt(ra, 10) : 1;
      
      // Exponential backoff strategy
      const backoff = waitSec * Math.pow(2, attempt);

      console.warn(
        `429 for ${url}; retry after ${backoff}s (attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS})`
      );

      // Sleep and retry
      await sleep(backoff * 1000);
      return makeApiRequestWithRetry(url, attempt + 1, operationName);
    }
    
    // Enhanced error handling based on error type
    if (err.code === 'ECONNABORTED') {
      throw new Error(`Timeout: Request to ${url} took too long`);
    } else if (err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN') {
      throw new Error(`Network error: ${err.message}`);
    } else if (err.response?.status) {
      throw new Error(`API error: HTTP ${err.response.status}`);
    }
    
    // For other unknown errors
    throw new Error(`Error making request to ${url}: ${err.message}`);
  }
}

/**
 * fetchChampionDriver
 * -------------------
 * Fetches the champion driver for a given season.
 * Retries up to 3 times on HTTP 429, using exponential backoff.
 */
async function fetchChampionDriver(year, attempt = 0) {
  // Log operation start
  logOperationStart('fetchChampionDriver', { year });
  
  // Validate year before making API request
  try {
    validateYear(year);
  } catch (err) {
    throw new Error(`Invalid year parameter: ${err.message}`);
  }

  const url = `${ERGAST_BASE_URL}/${year}/driverStandings/1.json`;
  
  try {
    // Use the common API request function with retry logic
    const data = await makeApiRequestWithRetry(url, attempt, 'fetchChampionDriver');
    
    // Defensive path-check
    const driver = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0]?.Driver;

    // Season not finished (or API missing) → return null, caller will skip
    if (!driver) {
      console.warn(`No standings yet for ${year}, skipping.`);
      return null;
    }

    console.log(`Fetched champion for ${year}: ${driver.driverId}`);
    return {
      driverRef: driver.driverId,
      name: `${driver.givenName} ${driver.familyName}`,
      nationality: driver.nationality, // Extract nationality from the API response
    };
  } catch (err) {
    // Wrap the error with more context about the operation
    throw new Error(`Error fetching champion for ${year}: ${err.message}`);
  }
}

/**
 * fetchSeasonResults
 * ------------------
 * Fetches all races + winners in one request.
 * Retries up to 3 times on HTTP 429, using exponential backoff.
 */
async function fetchSeasonResults(year, attempt = 0) {
  // Log operation start
  logOperationStart('fetchSeasonResults', { year });
  
  // Validate year before making API request
  try {
    validateYear(year);
  } catch (err) {
    throw new Error(`Invalid year parameter: ${err.message}`);
  }

  const url = `${ERGAST_BASE_URL}/${year}/results/1.json`;
  
  try {
    // Use the common API request function with retry logic
    const data = await makeApiRequestWithRetry(url, attempt, 'fetchSeasonResults');
    const races = data?.MRData?.RaceTable?.Races ?? [];

    // Map each race entry into our shape
    return races.map((r) => {
      const winnerRec = r.Results?.[0]?.Driver;
      return {
        round: parseInt(r.round, 10),
        name: r.raceName,
        date: r.date,
        time: r.time,
        winner: winnerRec
          ? {
              driverRef: winnerRec.driverId,
              name: `${winnerRec.givenName} ${winnerRec.familyName}`,
              nationality: winnerRec.nationality, // Extract nationality from the API response
            }
          : null,
      };
    });
  } catch (err) {
    // Wrap the error with more context about the operation
    throw new Error(`Error fetching races for ${year}: ${err.message}`);
  }
}

// **Export both functions in one object**
module.exports = {
  fetchChampionDriver,
  fetchSeasonResults,
};
