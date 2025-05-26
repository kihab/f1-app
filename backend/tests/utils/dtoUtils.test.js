// tests/utils/dtoUtils.test.js
const { 
  transformRaceToDto, 
  transformRacesToDto,
  transformSeasonToDto,
  transformSeasonsToDto 
} = require('../../utils/dtoUtils');

describe('dtoUtils', () => {
  describe('transformRaceToDto', () => {
    test('should transform a race entity to DTO correctly', () => {
      const race = {
        round: 1,
        name: 'Austrian Grand Prix',
        winner: {
          id: 'driver1',
          name: 'Max Verstappen',
          driverRef: 'verstappen',
          nationality: 'Dutch' // Add nationality to test data
        },
        season: {
          championDriverId: 'driver1'
        }
      };

      const dto = transformRaceToDto(race);
      
      expect(dto).toEqual({
        round: 1,
        name: 'Austrian Grand Prix',
        isChampion: true,
        winner: {
          id: 'driver1',
          name: 'Max Verstappen',
          driverRef: 'verstappen',
          nationality: 'Dutch' // Verify nationality in test assertion
        }
      });
    });

    test('should set isChampion to false when winner is not the champion', () => {
      const race = {
        round: 1,
        name: 'Austrian Grand Prix',
        winner: {
          id: 'driver2',
          name: 'Lewis Hamilton',
          driverRef: 'hamilton',
          nationality: 'British' // Add nationality to test data
        },
        season: {
          championDriverId: 'driver1'
        }
      };

      const dto = transformRaceToDto(race);
      
      expect(dto).toEqual({
        round: 1,
        name: 'Austrian Grand Prix',
        isChampion: false,
        winner: {
          id: 'driver2',
          name: 'Lewis Hamilton',
          driverRef: 'hamilton',
          nationality: 'British' // Verify nationality in test assertion
        }
      });
    });

    test('should return null when race is null', () => {
      expect(transformRaceToDto(null)).toBeNull();
    });

    test('should return null when race has no winner', () => {
      const race = {
        round: 1,
        name: 'Austrian Grand Prix'
      };
      
      expect(transformRaceToDto(race)).toBeNull();
    });
  });

  describe('transformRacesToDto', () => {
    test('should transform an array of race entities to DTOs', () => {
      const races = [
        {
          round: 1,
          name: 'Austrian Grand Prix',
          winner: { 
            id: 'driver1', 
            name: 'Max Verstappen', 
            driverRef: 'verstappen', 
            nationality: 'Dutch' // Add nationality to test data
          },
          season: { championDriverId: 'driver1' }
        },
        {
          round: 2,
          name: 'Styrian Grand Prix',
          winner: { 
            id: 'driver2', 
            name: 'Lewis Hamilton', 
            driverRef: 'hamilton', 
            nationality: 'British' // Add nationality to test data
          },
          season: { championDriverId: 'driver1' }
        }
      ];

      const dtos = transformRacesToDto(races);
      
      expect(dtos).toEqual([
        {
          round: 1,
          name: 'Austrian Grand Prix',
          isChampion: true,
          winner: { 
            id: 'driver1', 
            name: 'Max Verstappen', 
            driverRef: 'verstappen',
            nationality: 'Dutch' // Verify nationality in test assertion
          }
        },
        {
          round: 2,
          name: 'Styrian Grand Prix',
          isChampion: false,
          winner: { 
            id: 'driver2', 
            name: 'Lewis Hamilton', 
            driverRef: 'hamilton',
            nationality: 'British' // Verify nationality in test assertion
          }
        }
      ]);
    });

    test('should filter out null results from transformRaceToDto', () => {
      const races = [
        {
          round: 1,
          name: 'Austrian Grand Prix',
          winner: { id: 'driver1', name: 'Max Verstappen', driverRef: 'verstappen' },
          season: { championDriverId: 'driver1' }
        },
        {
          round: 2,
          name: 'Styrian Grand Prix'
          // No winner, will be filtered out
        }
      ];

      const dtos = transformRacesToDto(races);
      
      expect(dtos).toHaveLength(1);
      expect(dtos[0].name).toBe('Austrian Grand Prix');
    });

    test('should return empty array when races is null', () => {
      expect(transformRacesToDto(null)).toEqual([]);
    });

    test('should return empty array when races is not an array', () => {
      expect(transformRacesToDto('not an array')).toEqual([]);
    });
  });

  describe('transformSeasonToDto', () => {
    test('should transform a season entity to DTO correctly', () => {
      const season = {
        year: 2023,
        champion: {
          id: 'driver1',
          name: 'Max Verstappen',
          driverRef: 'verstappen',
          nationality: 'Dutch' // Add nationality to test data
        }
      };

      const dto = transformSeasonToDto(season);
      
      expect(dto).toEqual({
        year: 2023,
        champion: {
          id: 'driver1',
          name: 'Max Verstappen',
          driverRef: 'verstappen',
          nationality: 'Dutch' // Verify nationality in test assertion
        }
      });
    });

    test('should handle season with no champion', () => {
      const season = {
        year: 2023,
        champion: null
      };

      const dto = transformSeasonToDto(season);
      
      expect(dto).toEqual({
        year: 2023,
        champion: null
      });
    });

    test('should return null when season is null', () => {
      expect(transformSeasonToDto(null)).toBeNull();
    });
  });

  describe('transformSeasonsToDto', () => {
    test('should transform an array of season entities to DTOs', () => {
      const seasons = [
        {
          year: 2023,
          champion: { 
            id: 'driver1', 
            name: 'Max Verstappen', 
            driverRef: 'verstappen',
            nationality: 'Dutch' // Add nationality to test data
          }
        },
        {
          year: 2022,
          champion: { 
            id: 'driver1', 
            name: 'Max Verstappen', 
            driverRef: 'verstappen',
            nationality: 'Dutch' // Add nationality to test data
          }
        }
      ];

      const dtos = transformSeasonsToDto(seasons);
      
      expect(dtos).toEqual([
        {
          year: 2023,
          champion: { 
            id: 'driver1', 
            name: 'Max Verstappen', 
            driverRef: 'verstappen',
            nationality: 'Dutch' // Verify nationality in test assertion
          }
        },
        {
          year: 2022,
          champion: { 
            id: 'driver1', 
            name: 'Max Verstappen', 
            driverRef: 'verstappen',
            nationality: 'Dutch' // Verify nationality in test assertion
          }
        }
      ]);
    });

    test('should filter out null results from transformSeasonToDto', () => {
      // This shouldn't happen in practice since transformSeasonToDto only returns null if season is null
      // But we test it for completeness
      const seasons = [null, {
        year: 2023,
        champion: { id: 'driver1', name: 'Max Verstappen', driverRef: 'verstappen' }
      }];

      const dtos = transformSeasonsToDto(seasons);
      
      expect(dtos).toHaveLength(1);
      expect(dtos[0].year).toBe(2023);
    });

    test('should return empty array when seasons is null', () => {
      expect(transformSeasonsToDto(null)).toEqual([]);
    });

    test('should return empty array when seasons is not an array', () => {
      expect(transformSeasonsToDto('not an array')).toEqual([]);
    });
  });
});
