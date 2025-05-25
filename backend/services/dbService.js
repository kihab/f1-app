// services/dbService.js
// ------------------------------------------------------------
//  Database operations layer: Common database operations
// ------------------------------------------------------------

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sleep } = require('../utils/commonUtils');
const { THROTTLE_MS } = require('../config/constants');

/**
 * Upserts a driver record in the database
 * @param {Object} driver - Driver data with driverRef and name
 * @returns {Promise<Object>} - The upserted driver record
 */
async function upsertDriver(driver) {
  return prisma.driver.upsert({
    where: { driverRef: driver.driverRef },
    update: { name: driver.name },
    create: { driverRef: driver.driverRef, name: driver.name },
  });
}

/**
 * Upserts a season record in the database
 * @param {number} year - Season year
 * @param {string|null} championDriverId - ID of champion driver (or null)
 * @returns {Promise<Object>} - The upserted season record
 */
async function upsertSeason(year, championDriverId = null) {
  return prisma.season.upsert({
    where: { year },
    update: { championDriverId },
    create: { year, championDriverId },
  });
}

/**
 * Upserts a race record in the database
 * @param {number} seasonYear - Season year
 * @param {number} round - Race round
 * @param {string} name - Race name
 * @param {string} winnerDriverId - ID of winner driver
 * @returns {Promise<Object>} - The upserted race record
 */
async function upsertRace(seasonYear, round, name, winnerDriverId) {
  return prisma.race.upsert({
    where: { seasonYear_round: { seasonYear, round } },
    update: { name, winnerDriverId },
    create: {
      seasonYear,
      round,
      name,
      winnerDriverId,
    },
  });
}

/**
 * Finds all seasons in a range, optionally including the champion
 * @param {number} startYear - Start of year range
 * @param {number} endYear - End of year range
 * @param {boolean} includeChampion - Whether to include champion relations
 * @returns {Promise<Array>} - Array of season records
 */
async function findSeasons(startYear, endYear, includeChampion = true) {
  return prisma.season.findMany({
    where: { year: { gte: startYear, lte: endYear } },
    include: includeChampion ? { champion: true } : undefined,
  });
}

/**
 * Finds all races for a season, optionally including the winner
 * @param {number} year - Season year
 * @param {boolean} includeWinner - Whether to include winner relations
 * @returns {Promise<Array>} - Array of race records
 */
async function findRacesBySeason(year, includeWinner = true) {
  return prisma.race.findMany({
    where: { seasonYear: year },
    include: {
      winner: includeWinner,
      season: {
        select: { championDriverId: true }
      },
    },
    orderBy: { round: 'asc' },
  });
}

/**
 * Process batch operations with throttling and error collection
 * @param {Array} items - Array of items to process
 * @param {Function} processFn - Processing function for each item
 * @param {string} itemName - Name of items for logging
 * @returns {Object} - Results containing errors array and processed items count
 */
async function processBatch(items, processFn, itemName = 'item') {
  const errors = [];
  let processedCount = 0;
  
  for (const item of items) {
    try {
      await processFn(item);
      processedCount++;
    } catch (err) {
      const identifier = item.id || item.round || item.year || 'unknown';
      errors.push({ id: identifier, error: err.message });
      console.error(`Error processing ${itemName} ${identifier}: ${err.message}`);
    }
    // Apply throttling between operations
    await sleep(THROTTLE_MS);
  }
  
  return {
    errors,
    processedCount,
    totalCount: items.length
  };
}

module.exports = {
  upsertDriver,
  upsertSeason,
  upsertRace,
  findSeasons,
  findRacesBySeason,
  processBatch,
  prisma, // Exporting for special cases where direct access is needed
};
