// controllers/seasonsController.js
const seasonsService = require('../services/seasonsService');

/** GET /api/seasons  */
async function getSeasons(req, res) {
  try {
    // Ask service for the gap-aware seasons list (2005-2025, driver:null if missing)
    const seasons = await seasonsService.getAllSeasons();

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
    res.status(500).json({ error: 'Failed to fetch seasons' });
  }
}

module.exports = { getSeasons };
