// utils/errorHandler.js
// ------------------------------------------------------------
// Centralized error handling with error classification
// ------------------------------------------------------------

const { sendBadRequestError, sendServerError, sendServiceUnavailableError } = require('./responseUtils');
const ERROR_MESSAGES = require('../config/errorMessages');

/**
 * Handles API errors with consistent classification and response formatting
 * @param {Error} err - The error object
 * @param {Object} res - Express response object
 * @param {string} context - Context description for logging (e.g., 'fetching races')
 */
function handleApiError(err, res, context) {
  // Always log the error with context
  console.error(`Error in ${context}:`, err.message);
  
  // Classify and respond appropriately based on error type/message
  if (err.message && (err.message.includes(ERROR_MESSAGES.VALIDATION.INVALID_YEAR) || 
                      err.message.includes(ERROR_MESSAGES.VALIDATION.INVALID_DRIVER) ||
                      err.message.includes(ERROR_MESSAGES.VALIDATION.INVALID_RACE))) {
    // Validation errors - Bad Request (400)
    return sendBadRequestError(res, err.message);
  } 
  
  if (err.code === 'ECONNABORTED' || 
      err.message.includes('timeout') ||
      err.response?.status === 429) {
    // Network timeout or rate limiting - Service Unavailable (503)
    return sendServiceUnavailableError(res, ERROR_MESSAGES.NETWORK.TIMEOUT);
  } 
  
  if (err.response && err.response.status) {
    // External API returned an error status - Service Unavailable (503)
    return sendServiceUnavailableError(res, 
      `${ERROR_MESSAGES.NETWORK.EXTERNAL_API_ERROR}: ${err.message}`);
  } 
  
  if (err.message && (
    err.message.includes('fetching races') || 
    err.message.includes('fetching champion') || 
    err.message.includes('network failure') || 
    err.message.includes('External API'))) {
    // External API errors - Service Unavailable (503)
    return sendServiceUnavailableError(res, 
      `${ERROR_MESSAGES.NETWORK.EXTERNAL_API_ERROR}: ${err.message}`);
  }
  
  // Default to 500 for unknown server errors
  return sendServerError(res, ERROR_MESSAGES.GENERIC.OPERATION_FAILED(context));
}

module.exports = {
  handleApiError
};
