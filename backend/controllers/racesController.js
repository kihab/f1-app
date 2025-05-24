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
    res.status(500).json({ error: 'Failed to fetch races' });
  }
}

module.exports = { getRaces };
