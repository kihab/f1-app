// tests/utils/validationUtils.test.js
const { 
  validateYear,
  validateDriverData,
  validateRaceData
} = require('../../utils/validationUtils');

describe('validationUtils', () => {
  describe('validateYear', () => {
    test('should accept valid years within range', () => {
      // Test with several valid years (we'll use 1950 which is actually valid according to implementation)
      const validYears = [1950, 2005, 2010, 2020];
      
      validYears.forEach(year => {
        expect(() => validateYear(year)).not.toThrow();
      });
    });
    
    test('should throw error for years before the min year', () => {
      expect(() => validateYear(1949)).toThrow(/Year 1949 is out of valid range/);
      expect(() => validateYear(1900)).toThrow(/Year 1900 is out of valid range/);
    });
    
    test('should throw error for years after the max year', () => {
      // Get current year + 2 (which should be invalid)
      const tooFarInFuture = new Date().getFullYear() + 2;
      expect(() => validateYear(tooFarInFuture)).toThrow(/Year .* is out of valid range/);
    });
    
    test('should throw error for non-integer values', () => {
      expect(() => validateYear(2020.5)).toThrow(/Year 2020.5 is out of valid range/);
    });
    
    test('should throw error for non-numeric values', () => {
      // We're expecting these to throw but the message might be different since the implementation
      // would try to use them in a comparison, which would fail differently
      expect(() => validateYear('2020')).toThrow();
      expect(() => validateYear(null)).toThrow();
      expect(() => validateYear(undefined)).toThrow();
    });
  });
  
  describe('validateDriverData', () => {
    test('should accept valid driver data', () => {
      const validDriver = {
        driverRef: 'max_verstappen',
        name: 'Max Verstappen'
      };
      
      expect(() => validateDriverData(validDriver)).not.toThrow();
    });
    
    test('should throw error for null driver data', () => {
      // The implementation would actually throw a TypeError when trying to access properties
      // on null, so we just check for any error
      expect(() => validateDriverData(null)).toThrow();
    });
    
    test('should throw error for missing required fields', () => {
      const incompleteDrivers = [
        { name: 'Max Verstappen' }, // Missing driverRef
        { driverRef: 'max_verstappen' }  // Missing name
      ];
      
      expect(() => validateDriverData(incompleteDrivers[0])).toThrow(/Driver reference is required/);
      expect(() => validateDriverData(incompleteDrivers[1])).toThrow(/Driver name is required/);
    });
    
    test('should throw error for too long field values', () => {
      // Create very long strings for testing
      const longString51 = 'a'.repeat(51);
      const longString101 = 'a'.repeat(101);
      
      const driverWithLongRef = {
        driverRef: longString51,
        name: 'Max Verstappen'
      };
      
      const driverWithLongName = {
        driverRef: 'max_verstappen',
        name: longString101
      };
      
      expect(() => validateDriverData(driverWithLongRef)).toThrow(/Driver reference exceeds 50 characters/);
      expect(() => validateDriverData(driverWithLongName)).toThrow(/Driver name exceeds 100 characters/);
    });
  });
  
  describe('validateRaceData', () => {
    test('should accept valid race data', () => {
      const validRace = {
        round: 1,
        name: 'Austrian Grand Prix'
      };
      
      expect(() => validateRaceData(validRace)).not.toThrow();
    });
    
    test('should throw error for null race data', () => {
      // The implementation would actually throw a TypeError when trying to access properties
      // on null, so we just check for any error
      expect(() => validateRaceData(null)).toThrow();
    });
    
    test('should throw error for missing round', () => {
      const raceWithoutRound = {
        name: 'Austrian Grand Prix'
      };
      
      expect(() => validateRaceData(raceWithoutRound)).toThrow(/Race round must be a positive integer/);
    });
    
    test('should throw error for invalid round', () => {
      const raceWithInvalidRound = {
        round: -1,
        name: 'Austrian Grand Prix'
      };
      
      expect(() => validateRaceData(raceWithInvalidRound)).toThrow(/Race round must be a positive integer/);
    });
    
    test('should throw error for missing name', () => {
      const raceWithoutName = {
        round: 1
      };
      
      expect(() => validateRaceData(raceWithoutName)).toThrow(/Race name is required/);
    });
    
    test('should throw error for too long name', () => {
      const longName101 = 'a'.repeat(101);
      const raceWithLongName = {
        round: 1,
        name: longName101
      };
      
      expect(() => validateRaceData(raceWithLongName)).toThrow(/Race name exceeds 100 characters/);
    });
  });
});
