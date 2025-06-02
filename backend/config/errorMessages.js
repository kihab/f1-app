// config/errorMessages.js
// ------------------------------------------------------------
// Centralized error messages for consistent error handling
// ------------------------------------------------------------

module.exports = {
  // Validation errors
  VALIDATION: {
    INVALID_YEAR: 'Invalid year',
    INVALID_DRIVER: 'Invalid driver data',
    INVALID_RACE: 'Invalid race data',
  },
  
  // Network/External service errors
  NETWORK: {
    TIMEOUT: 'External API service unavailable or rate limited',
    EXTERNAL_API_ERROR: 'External service error',
    UNAVAILABLE: 'Service unavailable',
  },
  
  // Generic errors
  GENERIC: {
    OPERATION_FAILED: (operation) => `Failed to ${operation}`
  }
};
