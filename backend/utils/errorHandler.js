// utils/errorHandler.js
// ------------------------------------------------------------
// Centralized error handling with error classification
// ------------------------------------------------------------

const { sendBadRequestError, sendServerError, sendServiceUnavailableError } = require('./responseUtils');

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
  if (err.message && (err.message.includes('Invalid year') || 
                      err.message.includes('Invalid driver data') ||
                      err.message.includes('Invalid race data'))) {
    // Validation errors - Bad Request (400)
    return sendBadRequestError(res, err.message);
  } 
  
  if (err.code === 'ECONNABORTED' || 
      err.message.includes('timeout') ||
      err.response?.status === 429) {
    // Network timeout or rate limiting - Service Unavailable (503)
    return sendServiceUnavailableError(res, 'External API service unavailable or rate limited');
  } 
  
  if (err.response && err.response.status) {
    // External API returned an error status - Service Unavailable (503)
    return sendServiceUnavailableError(res, `External service error: ${err.message}`);
  } 
  
  if (err.message && (
    err.message.includes('fetching races') || 
    err.message.includes('fetching champion') || 
    err.message.includes('network failure') || 
    err.message.includes('External API'))) {
    // External API errors - Service Unavailable (503)
    return sendServiceUnavailableError(res, `External service error: ${err.message}`);
  }
  
  // Default to 500 for unknown server errors
  return sendServerError(res, `Failed to ${context}`);
}

module.exports = {
  handleApiError
};
