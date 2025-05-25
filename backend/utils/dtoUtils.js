// utils/dtoUtils.js
// ------------------------------------------------------------
// Data Transfer Object transformation utilities
// ------------------------------------------------------------

/**
 * Transforms a race entity to its DTO representation
 * @param {Object} race - Race entity from database
 * @returns {Object} - Race DTO for client consumption
 */
function transformRaceToDto(race) {
  // If no race or no winner relation, return null
  if (!race || !race.winner) return null;
  
  const isChamp = race.winner.id === race.season?.championDriverId;
  
  return {
    round: race.round,
    name: race.name,
    isChampion: isChamp,
    winner: {
      id: race.winner.id,
      name: race.winner.name,
      driverRef: race.winner.driverRef
    }
  };
}

/**
 * Transforms a list of race entities to their DTO representation
 * @param {Array} races - List of race entities from database
 * @returns {Array} - List of race DTOs for client consumption
 */
function transformRacesToDto(races) {
  if (!races || !Array.isArray(races)) return [];
  return races.map(transformRaceToDto).filter(Boolean);
}

/**
 * Transforms a season entity to its DTO representation
 * @param {Object} season - Season entity from database
 * @returns {Object} - Season DTO for client consumption
 */
function transformSeasonToDto(season) {
  if (!season) return null;
  
  return {
    year: season.year,
    champion: season.champion ? {
      id: season.champion.id,
      name: season.champion.name,
      driverRef: season.champion.driverRef,
    } : null,
  };
}

/**
 * Transforms a list of season entities to their DTO representation
 * @param {Array} seasons - List of season entities from database
 * @returns {Array} - List of season DTOs for client consumption
 */
function transformSeasonsToDto(seasons) {
  if (!seasons || !Array.isArray(seasons)) return [];
  return seasons.map(transformSeasonToDto).filter(Boolean);
}

module.exports = {
  transformRaceToDto,
  transformRacesToDto,
  transformSeasonToDto,
  transformSeasonsToDto
};
