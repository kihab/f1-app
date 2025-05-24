// utils/commonUtils.js
// Common utility functions shared across the application

/**
 * Sleep utility - pauses execution for the specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Resolves after the specified time
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Format timing information for logging
 * @param {number} startTime - Start time in milliseconds (from Date.now())
 * @param {string} operationName - Name of the operation being timed
 * @param {object} metadata - Additional metadata to include in the log
 * @returns {string} - Formatted log message
 */
const formatTimingLog = (startTime, operationName, metadata = {}) => {
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  return `Completed ${operationName} in ${duration}s ${Object.entries(metadata)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')}`;
};

/**
 * Log the start of an operation with consistent format
 * @param {string} operationName - Name of the operation starting
 * @param {object} metadata - Additional contextual information 
 */
const logOperationStart = (operationName, metadata = {}) => {
  const timestamp = new Date().toISOString();
  const metadataStr = Object.entries(metadata)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
  console.log(`Starting ${operationName} at ${timestamp} ${metadataStr ? `(${metadataStr})` : ''}`);
};

module.exports = {
  sleep,
  formatTimingLog,
  logOperationStart
};
