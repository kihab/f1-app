// controllers/racesController.js
// ------------------------------------------------------------

const { getRacesBySeason } = require('../services/racesService');
const { validateYear } = require('../utils/validationUtils');

/** GET /api/seasons/:year/races */
async function getRaces(req, res) {
  const year = parseInt(req.params.year, 10);
  if (isNaN(year)) {
    return res.status(400).json({ error: 'Invalid season year' });
  }
  
  // Validate year is within acceptable range
  try {
    validateYear(year);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  try {
    const races = await getRacesBySeason(year);
    
    // Handle empty state with clear message
    if (!races || races.length === 0) {
      return res.json({
        data: [],
        message: `No race data available for ${year}. The season may not have started or data is not yet available.`
      });
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
    res.json(dto);
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
    res.status(500).json({ error: 'Failed to fetch races' });
  }
}

module.exports = { getRaces };
