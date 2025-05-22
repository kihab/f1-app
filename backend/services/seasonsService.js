// services/seasonsService.js
// ------------------------------------------------------------
//  Business-logic layer: Seasons
//  -----------------------------------------------------------
//  getAllSeasons()
//    1) Query DB; if rows exist → fast-path return
//    2) Else loop 2005…currentYear
//         • fetch champion      (retry + skip handled in helper)
//         • upsert driver + season
//         • 300 ms pause to stay under proxy rate-limit
//    3) Re-query and return populated list
// ------------------------------------------------------------

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { fetchChampionDriver } = require('../utils/ergastClient');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getAllSeasons() {
  let seasons = await prisma.season.findMany({
    include: { champion: true },
    orderBy: { year: 'desc' },
  });
  if (seasons.length) return seasons; // serve from DB

  const currentYear = new Date().getFullYear();

  for (let yr = 2005; yr <= currentYear; yr++) {
    console.log(`Seeding season ${yr}…`);

    const champion = await fetchChampionDriver(yr);
    if (!champion) {
      await sleep(300); // small delay even when skipping
      continue;         // move to next year
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

    // 100 ms throttle to respect proxy limits
    await sleep(300);
  }

  // Final query – now DB is populated
  seasons = await prisma.season.findMany({
    include: { champion: true },
    orderBy: { year: 'desc' },
  });
  return seasons;
}

module.exports = { getAllSeasons };
