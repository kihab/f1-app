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

// Use proxy (up-to-date data) but keep default env override for tests
const BASE = 'https://api.jolpi.ca/ergast/f1';

// Simple sleep helper for back-off
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchChampionDriver(year, attempt = 0) {
  const url = `${BASE}/${year}/driverStandings/1.json`;

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
    if (err.response?.status === 429 && attempt === 0) {
      // Read the Retry-After header (in seconds). Fallback to 1s if missing or unparsable.
      const ra = err.response.headers['retry-after'];
      const waitSec = ra ? parseInt(ra, 10) : 1;

      console.warn(
        `429 for ${year}; proxy asked to retry after ${waitSec}s`
      );

      // Sleep *that* many seconds before retry
      await sleep(waitSec * 1000);

      // Retry once
      return fetchChampionDriver(year, attempt + 1);
    }
    throw err;
  }
}

module.exports = { fetchChampionDriver };

/**
 * fetchSeasonResults
 * ------------------
 * Fetches all races + winners in one request:
 * GET {BASE}/{year}/results/1.json
 *
 * @param {number} year
 * @param {number} attempt – retry count
 * @returns{Promise<Array<{
 *    round: number,
 *    name: string,
 *    date: string,
 *    time?: string,
 *    winner: { driverRef: string, name: string }
 * }>>}
 */

async function fetchSeasonResults(year, attempt = 0) {
  const url = `${BASE}/${year}/results/1.json`;
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
    // Rate-limit back-off (HTTP 429)
    if (err.response?.status === 429 && attempt === 0) {
      const ra = parseInt(err.response.headers['retry-after'], 10) || 1;
      console.warn(`429 for ${year}; retry after ${ra}s`);
      await sleep(ra * 1000);
      return fetchSeasonResults(year, attempt + 1);
    }
    // Bubble other errors
    throw err;
  }
}

module.exports = { fetchSeasonResults };