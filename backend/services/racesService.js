// services/racesService.js
// ------------------------------------------------------------
//  Business-logic layer: Races
// ------------------------------------------------------------

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { fetchSeasonResults } = require('../utils/ergastClient');
const { validateYear, validateDriverData, validateRaceData } = require('../utils/validationUtils');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  console.log(`Starting getRacesBySeason for year ${year} at ${new Date().toISOString()}`);
  const startTime = Date.now();
  
  // Validate year is within acceptable range
  try {
    validateYear(year);
  } catch (err) {
    throw new Error(`Invalid year: ${err.message}`);
  }

  // fast path
  let existing = await prisma.race.findMany({
    where: { seasonYear: year },
    include: {
      winner: true,
      season: {
        select: { championDriverId: true }
      },
    },
    orderBy: { round: 'asc' },
  });
  if (existing.length) return existing;

  // seed path
  let results;
  try {
    results = await fetchSeasonResults(year);
  } catch (err) {
    // Handle API fetch errors without crashing
    console.error(`Failed to fetch results for year ${year}: ${err.message}`);
    throw new Error(`Failed to fetch race data for ${year}: ${err.message}`);
  }
  // Track processing errors
  const processingErrors = [];
  
  for (const r of results) {
    try {
      // If no winner data → skip
      if (!r.winner) {
        await sleep(300);
        continue;
      }
      
      // Validate race data
      try {
        validateRaceData({
          name: r.name,
          round: r.round
        });
      } catch (err) {
        console.error(`Invalid race data: ${err.message}`);
        processingErrors.push({ round: r.round, error: `Invalid race data: ${err.message}` });
        await sleep(300);
        continue;
      }

      // Validate driver data before upsert
      try {
        validateDriverData(r.winner);
      } catch (err) {
        console.error(`Invalid driver data: ${err.message}`);
        processingErrors.push({ round: r.round, error: `Invalid driver data: ${err.message}` });
        await sleep(300);
        continue;
      }
      
      // Upsert driver
      const driver = await prisma.driver.upsert({
        where: { driverRef: r.winner.driverRef },
        update: { name: r.winner.name },
        create: { driverRef: r.winner.driverRef, name: r.winner.name },
      });

      // Upsert race
      await prisma.race.upsert({
        where: { seasonYear_round: { seasonYear: year, round: r.round } },
        update: { name: r.name, winnerDriverId: driver.id },
        create: {
          seasonYear: year,
          round: r.round,
          name: r.name,
          winnerDriverId: driver.id,
        },
      });

      // throttle to avoid proxy limits
      await sleep(300);
    } catch (err) {
      // Catch any other errors during race processing to prevent complete failure
      console.error(`Error processing race round ${r.round}: ${err.message}`);
      processingErrors.push({ round: r.round, error: err.message });
      await sleep(300);
      continue;
    }
  }

  // final query
  existing = await prisma.race.findMany({
    where: { seasonYear: year },
    include: { winner: true, 
      season: { select: { championDriverId: true } } 
    },
    orderBy: { round: 'asc' },
  });
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000; // Convert to seconds
  console.log(`Completed getRacesBySeason for ${year} in ${duration.toFixed(2)}s, returning ${existing.length} races`);
  
  return existing;
}

module.exports = { getRacesBySeason };
