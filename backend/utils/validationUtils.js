// utils/validationUtils.js
// Validation utilities for input validation

const ERROR_MESSAGES = require('../config/errorMessages');

// Get the current year for year validation
const currentYear = new Date().getFullYear();

/**
 * Validates a year input is an integer within acceptable range
 * @param {number} year - The year to validate
 * @throws {Error} If year is invalid
 */
function validateYear(year) {
  // Check if year is an integer and within valid range (1950 to next year)
  if (!Number.isInteger(year) || year < 1950 || year > currentYear + 1) {
    throw new Error(`${ERROR_MESSAGES.VALIDATION.INVALID_YEAR}: ${year} is out of valid range (1950-${currentYear + 1})`);
  }
}

/**
 * Validates driver data against schema constraints
 * @param {Object} driver - The driver object to validate
 * @param {string} driver.driverRef - Driver reference ID
 * @param {string} driver.name - Driver name
 * @param {string} [driver.nationality] - Optional driver nationality
 * @throws {Error} If validation fails
 */
function validateDriverData(driver) {
  // Check driver reference exists and within length limit
  if (!driver.driverRef || typeof driver.driverRef !== 'string') {
    throw new Error(`${ERROR_MESSAGES.VALIDATION.INVALID_DRIVER}: Reference is required`);
  }
  if (driver.driverRef.length > 50) {
    throw new Error(`${ERROR_MESSAGES.VALIDATION.INVALID_DRIVER}: Reference exceeds 50 characters`);
  }

  // Check driver name exists and within length limit
  if (!driver.name || typeof driver.name !== 'string') {
    throw new Error(`${ERROR_MESSAGES.VALIDATION.INVALID_DRIVER}: Name is required`);
  }
  if (driver.name.length > 100) {
    throw new Error(`${ERROR_MESSAGES.VALIDATION.INVALID_DRIVER}: Name exceeds 100 characters`);
  }
  
  // Validate nationality if provided
  if (driver.nationality !== undefined && driver.nationality !== null) {
    if (typeof driver.nationality !== 'string') {
      throw new Error(`${ERROR_MESSAGES.VALIDATION.INVALID_DRIVER}: Nationality must be a string`);
    }
    if (driver.nationality.length > 50) {
      throw new Error(`${ERROR_MESSAGES.VALIDATION.INVALID_DRIVER}: Nationality exceeds 50 characters`);
    }
  }
}

/**
 * Validates race data against schema constraints
 * @param {Object} race - The race object to validate
 * @param {string} race.name - Race name
 * @param {number} race.round - Race round number
 * @throws {Error} If validation fails
 */
function validateRaceData(race) {
  // Check race name exists and within length limit
  if (!race.name || typeof race.name !== 'string') {
    throw new Error(`${ERROR_MESSAGES.VALIDATION.INVALID_RACE}: Name is required`);
  }
  if (race.name.length > 100) {
    throw new Error(`${ERROR_MESSAGES.VALIDATION.INVALID_RACE}: Name exceeds 100 characters`);
  }

  // Check round is a positive integer
  if (!Number.isInteger(race.round) || race.round < 1) {
    throw new Error(`${ERROR_MESSAGES.VALIDATION.INVALID_RACE}: Round must be a positive integer`);
  }
}

module.exports = {
  validateYear,
  validateDriverData,
  validateRaceData,
};
