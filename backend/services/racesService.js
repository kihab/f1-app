// services/racesService.js
// ------------------------------------------------------------
//  Business-logic layer: Races
// ------------------------------------------------------------

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { fetchSeasonResults } = require('../utils/ergastClient');
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
  // fast path
  let existing = await prisma.race.findMany({
    where: { seasonYear: year },
    include: { winner: true },
    orderBy: { round: 'asc' },
  });
  if (existing.length) return existing;

  // seed path
  const results = await fetchSeasonResults(year);
  for (const r of results) {
    // If no winner data → skip
    if (!r.winner) continue;

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
    await sleep(100);
  }

  // final query
  existing = await prisma.race.findMany({
    where: { seasonYear: year },
    include: { winner: true },
    orderBy: { round: 'asc' },
  });
  return existing;
}

module.exports = { getRacesBySeason };
