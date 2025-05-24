// controllers/racesController.js
// ------------------------------------------------------------

const { getRacesBySeason } = require('../services/racesService');
const { validateYear } = require('../utils/validationUtils');
const { sendBadRequestError, sendServerError, sendServiceUnavailableError, sendSuccessResponse } = require('../utils/responseUtils');

/** GET /api/seasons/:year/races */
async function getRaces(req, res) {
  const year = parseInt(req.params.year, 10);
  if (isNaN(year)) {
    return sendBadRequestError(res, 'Invalid season year');
  }
  
  // Validate year is within acceptable range
  try {
    validateYear(year);
  } catch (err) {
    return sendBadRequestError(res, err.message);
  }

  try {
    const races = await getRacesBySeason(year);
    
    // Handle empty state with clear message
    if (!races || races.length === 0) {
      return sendSuccessResponse(res, [], `No race data available for ${year}. The season may not have started or data is not yet available.`);
    }
    
    // Map to DTO
    const dto = races.map((r) => {
      const isChamp = r.winner.id === r.season.championDriverId;
      return {
        round:      r.round,
        name:       r.name,
        isChampion: isChamp,
        winner: {
          id:        r.winner.id,
          name:      r.winner.name,
          driverRef: r.winner.driverRef
        }
      };
    });
    return sendSuccessResponse(res, dto);
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
    return sendServerError(res, 'Failed to fetch races');
  }
}

module.exports = { getRaces };
