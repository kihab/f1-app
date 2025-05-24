// Business logic for /api/seasons with gap-aware self-healing

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { fetchChampionDriver } = require('../utils/ergastClient');
const { START_YEAR } = require('../config/constants');
const currentYear = new Date().getFullYear();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getAllSeasons() {
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

  // For each missing year, try to fetch and upsert (with throttle)
  for (const yr of missingYears) {
    const champion = await fetchChampionDriver(yr);
    if (!champion) {
      await sleep(300); // small delay even when skipping (throttle)
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
  return result;
}

module.exports = { getAllSeasons };
