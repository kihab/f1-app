// Business logic for /api/seasons with gap-aware self-healing

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { fetchChampionDriver } = require('../utils/ergastClient');
const { START_YEAR } = require('../config/constants');
const { validateYear, validateDriverData } = require('../utils/validationUtils');
const currentYear = new Date().getFullYear();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getAllSeasons() {
  console.log(`Starting getAllSeasons operation at ${new Date().toISOString()}`);
  const startTime = Date.now();
  
  // Query all seasons in the range, include champions if present
  let dbSeasons = await prisma.season.findMany({
    where: { year: { gte: START_YEAR, lte: currentYear } },
    include: { champion: true },
  });

  // Make a fast lookup for present years
  const seasonsByYear = {};
  dbSeasons.forEach(s => { seasonsByYear[s.year] = s; });

  // Build gap list for missing years
  const missingYears = [];
  for (let yr = START_YEAR; yr <= currentYear; yr++) {
    if (!seasonsByYear[yr]) missingYears.push(yr);
  }

  // Track errors during processing to avoid crashing the entire function
  const processingErrors = [];

  // For each missing year, try to fetch and upsert (with throttle)
  for (const yr of missingYears) {
    // Validate year before processing
    try {
      validateYear(yr);
    } catch (err) {
      console.error(`Skipping invalid year ${yr}: ${err.message}`);
      processingErrors.push({ year: yr, error: err.message });
      continue;
    }
    
    try {
      const champion = await fetchChampionDriver(yr);
      if (!champion) {
        await sleep(300); // small delay even when skipping (throttle)
        continue;
      }

      // Validate driver data before upsert
      try {
        validateDriverData(champion);
      } catch (err) {
        console.error(`Invalid driver data for ${yr}: ${err.message}`);
        processingErrors.push({ year: yr, error: `Invalid driver data: ${err.message}` });
        await sleep(300);
        continue;
      }
      
      // Upsert driver (unique by driverRef)
      const driver = await prisma.driver.upsert({
        where: { driverRef: champion.driverRef },
        update: { name: champion.name },
        create: { driverRef: champion.driverRef, name: champion.name },
      });

      // Upsert season
      await prisma.season.upsert({
        where: { year: yr },
        update: { championDriverId: driver.id },
        create: { year: yr, championDriverId: driver.id },
      });

      await sleep(300); // throttle to respect proxy limits
    } catch (err) {
      // Catch errors during fetching/upserting to prevent entire process from failing
      console.error(`Error processing year ${yr}: ${err.message}`);
      processingErrors.push({ year: yr, error: err.message });
      await sleep(300); // still throttle on errors
      continue;
    }
  }

  // Log summary of errors if any occurred during processing
  if (processingErrors.length > 0) {
    console.error(`Completed with ${processingErrors.length} errors:`,  
      processingErrors.map(e => `Year ${e.year}: ${e.error}`).join(''));
  }

  // Query all again to get updated set
  dbSeasons = await prisma.season.findMany({
    where: { year: { gte: START_YEAR, lte: currentYear } },
    include: { champion: true },
  });

  // Map seasons by year again for lookup
  const byYear = {};
  dbSeasons.forEach(s => { byYear[s.year] = s; });

  // Build the final response list: {year, champion: obj|null} for each year 2005-2025
  const result = [];
  for (let yr = START_YEAR; yr <= currentYear; yr++) {
    const s = byYear[yr];
    result.push({
      year: yr,
      champion: s && s.champion ? s.champion : null, // champion is null if not present
    });
  }
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000; // Convert to seconds
  console.log(`Completed getAllSeasons in ${duration.toFixed(2)}s, returning ${result.length} seasons`);
  
  return result;
}

module.exports = { getAllSeasons };
