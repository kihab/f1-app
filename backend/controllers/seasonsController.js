// controllers/seasonsController.js
const seasonsService = require('../services/seasonsService');

/** GET /api/seasons  */
async function getSeasons(req, res) {
  try {
    // Ask service for the gap-aware seasons list (2005-2025, driver:null if missing)
    const seasons = await seasonsService.getAllSeasons();
    
    // Handle empty state with clear message
    if (!seasons || seasons.length === 0) {
      return res.json({
        data: [],
        message: 'No season data available. Our systems may be experiencing temporary issues.'
      });
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

    res.json(response);
  } catch (err) {
    console.error(err);
    // Determine appropriate error status code based on error type
    if (err.message && err.message.includes('Invalid year')) {
      // Year validation error
      return res.status(400).json({ error: err.message });
    } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      // Network timeout errors
      return res.status(503).json({ error: 'External API service unavailable' });
    } else if (err.response && err.response.status) {
      // External API returned an error status
      return res.status(503).json({ error: `External service error: ${err.message}` });
    }
    
    // Default to 500 for unknown server errors
    res.status(500).json({ error: 'Failed to fetch seasons' });
  }
}

module.exports = { getSeasons };
