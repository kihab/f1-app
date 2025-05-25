// controllers/seasonsController.js
// ------------------------------------------------------------
// API Controller for season-related endpoints
// ------------------------------------------------------------

const { getAllSeasons } = require('../services/seasonsService');
const { sendSuccessResponse } = require('../utils/responseUtils');
const { transformSeasonsToDto } = require('../utils/dtoUtils');
const { handleApiError } = require('../utils/errorHandler');

/** GET /api/seasons  */
async function getSeasons(req, res) {
  try {
    // Ask service for the gap-aware seasons list (2005-2025, driver:null if missing)
    const seasons = await getAllSeasons();
    
    // Handle empty state with clear message
    if (!seasons || seasons.length === 0) {
      return sendSuccessResponse(res, [], 'No season data available. Our systems may be experiencing temporary issues.');
    }

    // Transform season entities to DTOs using the utility function
    const seasonDtos = transformSeasonsToDto(seasons);
    return sendSuccessResponse(res, seasonDtos);
  } catch (err) {
    // Use centralized error handler for consistent error responses
    return handleApiError(err, res, 'fetching seasons');
  }
}

module.exports = { getSeasons };
