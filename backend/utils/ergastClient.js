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
const { ERGAST_BASE_URL } = require('../config/constants');
const { validateYear } = require('./validationUtils');

// Simple sleep helper for back-off
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * fetchChampionDriver
 * -------------------
 * Fetches the champion driver for a given season.
 * Retries up to 3 times on HTTP 429, using exponential backoff.
 */
async function fetchChampionDriver(year, attempt = 0) {
  // Validate year before making API request
  try {
    validateYear(year);
  } catch (err) {
    throw new Error(`Invalid year parameter: ${err.message}`);
  }

  const url = `${ERGAST_BASE_URL}/${year}/driverStandings/1.json`;

  try {
    const { data } = await axios.get(url, { timeout: 10_000 });

    // Defensive path-check
    const driver =
      data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0]
        ?.Driver;

    // Season not finished (or API missing) → return null, caller will skip
    if (!driver) {
      console.warn(`No standings yet for ${year}, skipping.`);
      return null;
    }

    console.log(`Fetched champion for ${year}: ${driver.driverId}`);
    return {
      driverRef: driver.driverId,
      name: `${driver.givenName} ${driver.familyName}`,
    };
  } catch (err) {
    // Retry up to 3 times for HTTP 429
    if (err.response?.status === 429 && attempt < 3) {
      console.log("********* 429 RATE LIMIT HEADERS *********");
      console.log(err.response.headers);
      console.log("******************************************");
      // Read the Retry-After header (in seconds). Fallback to 1s if missing or unparsable.
      const ra = err.response.headers['retry-after'];
      const waitSec = ra ? parseInt(ra, 10) : 1;
      // Exponential backoff: 1s, 2s, 4s
      const backoff = waitSec * Math.pow(2, attempt);

      console.warn(
        `429 for ${year}; retry after ${backoff}s (attempt ${attempt + 1}/3)`
      );

      // Sleep *that* many seconds before retry
      await sleep(backoff * 1000);

      // Retry
      return fetchChampionDriver(year, attempt + 1);
    }
    
    // Enhance error information based on type
    if (err.code === 'ECONNABORTED') {
      throw new Error(`Timeout fetching champion for ${year}: Request took too long`);
    } else if (err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN') {
      throw new Error(`Network error fetching champion for ${year}: ${err.message}`);
    } else if (err.response?.status) {
      throw new Error(`API error fetching champion for ${year}: HTTP ${err.response.status}`);
    }
    
    // For other unknown errors, include context
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
  // Validate year before making API request
  try {
    validateYear(year);
  } catch (err) {
    throw new Error(`Invalid year parameter: ${err.message}`);
  }

  const url = `${ERGAST_BASE_URL}/${year}/results/1.json`;
  try {
    const { data } = await axios.get(url, { timeout: 10_000 });
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
            }
          : null,
      };
    });
  } catch (err) {
    // Retry up to 3 times for HTTP 429
    if (err.response?.status === 429 && attempt < 3) {
      console.log("********* 429 RATE LIMIT HEADERS *********");
      console.log(err.response.headers);
      console.log("******************************************");      
      const ra = parseInt(err.response.headers['retry-after'], 10) || 1;
      // Exponential backoff: 1s, 2s, 4s
      const backoff = ra * Math.pow(2, attempt);

      console.warn(
        `429 for ${year}; retry after ${backoff}s (attempt ${attempt + 1}/3)`
      );
      await sleep(backoff * 1000);

      return fetchSeasonResults(year, attempt + 1);
    }
    
    // Enhance error information based on type
    if (err.code === 'ECONNABORTED') {
      throw new Error(`Timeout fetching races for ${year}: Request took too long`);
    } else if (err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN') {
      throw new Error(`Network error fetching races for ${year}: ${err.message}`);
    } else if (err.response?.status) {
      throw new Error(`API error fetching races for ${year}: HTTP ${err.response.status}`);
    }
    
    // For other unknown errors, include context
    throw new Error(`Error fetching races for ${year}: ${err.message}`);
  }
}

// **Export both functions in one object**
module.exports = {
  fetchChampionDriver,
  fetchSeasonResults,
};
