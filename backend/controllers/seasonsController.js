// controllers/seasonsController.js
const seasonsService = require('../services/seasonsService');
const { sendBadRequestError, sendServerError, sendServiceUnavailableError, sendSuccessResponse } = require('../utils/responseUtils');

/** GET /api/seasons  */
async function getSeasons(req, res) {
  try {
    // Ask service for the gap-aware seasons list (2005-2025, driver:null if missing)
    const seasons = await seasonsService.getAllSeasons();
    
    // Handle empty state with clear message
    if (!seasons || seasons.length === 0) {
      return sendSuccessResponse(res, [], 'No season data available. Our systems may be experiencing temporary issues.');
    }

    // Map to DTO: { year, champion: { id, name, driverRef } } or champion: null if missing
    const response = seasons.map(s => ({
      year: s.year,
      // If champion exists, format champion object; else, return null (FE will know it's missing)
      champion: s.champion
        ? {
            id: s.champion.id,
            name: s.champion.name,
            driverRef: s.champion.driverRef,  
          }
        : null,
    }));

    return sendSuccessResponse(res, response);
  } catch (err) {
    console.error(err);
    // Determine appropriate error status code based on error type
    if (err.message && err.message.includes('Invalid year')) {
      // Year validation error
      return sendBadRequestError(res, err.message);
    } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      // Network timeout errors
      return sendServiceUnavailableError(res, 'External API service unavailable');
    } else if (err.response && err.response.status) {
      // External API returned an error status
      return sendServiceUnavailableError(res, `External service error: ${err.message}`);
    } else if (err.message && (
        err.message.includes('fetching races') || 
        err.message.includes('fetching champion') || 
        err.message.includes('network failure') || 
        err.message.includes('External API'))) {
      // Errors from ergastClient or external service issues
      return sendServiceUnavailableError(res, `External service error: ${err.message}`);
    }
    
    // Default to 500 for unknown server errors
    return sendServerError(res, 'Failed to fetch seasons');
  }
}

module.exports = { getSeasons };
