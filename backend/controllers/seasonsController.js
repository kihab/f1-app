// controllers/seasonsController.js
const seasonsService = require('../services/seasonsService');

/** GET /api/seasons  */
async function getSeasons(req, res) {
  try {
    const seasons = await seasonsService.getAllSeasons();

    // Map to DTO: year + champion name (keeps FE decoupled from DB shape)
    const response = seasons.map(s => ({
      year: s.year,
      champion: {
        id: s.champion.id,
        name: s.champion.name,
        driverRef: s.champion.driverRef,
      },
    }));

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch seasons' });
  }
}

module.exports = { getSeasons };
