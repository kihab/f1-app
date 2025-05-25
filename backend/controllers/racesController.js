// controllers/racesController.js
// ------------------------------------------------------------
// API Controller for race-related endpoints
// ------------------------------------------------------------

const { getRacesBySeason } = require('../services/racesService');
const { validateYear } = require('../utils/validationUtils');
const { sendBadRequestError, sendSuccessResponse } = require('../utils/responseUtils');
const { transformRacesToDto } = require('../utils/dtoUtils');
const { handleApiError } = require('../utils/errorHandler');

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
    
    // Transform race entities to DTOs using the utility function
    const raceDtos = transformRacesToDto(races);
    return sendSuccessResponse(res, raceDtos);
  } catch (err) {
    // Use centralized error handler for consistent error responses
    return handleApiError(err, res, 'fetching races');
  }
}

module.exports = { getRaces };
