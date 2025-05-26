// Import the functions we want to test
const { fetchChampionDriver, fetchSeasonResults } = require('../../utils/ergastClient');

// Import axios so we can mock it
// We need to mock axios to prevent actual network calls during our unit tests
// and to control the responses our function receives.
const axios = require('axios');

// This line tells Jest to replace the actual 'axios' module with a mock version.
// All functions exported by 'axios' (like axios.get, axios.post, etc.)
// will become Jest mock functions (jest.fn()).
// This mock is automatically active for all tests in this file.
jest.mock('axios');

// Mock the required dependencies
jest.mock('../../utils/validationUtils', () => ({
  validateYear: jest.fn()
}));

jest.mock('../../utils/commonUtils', () => ({
  sleep: jest.fn(() => Promise.resolve()),
  logOperationStart: jest.fn(),
  formatTimingLog: jest.fn(() => 'mocked timing log')
}));

// Import the mocked modules to control their behavior
const { validateYear } = require('../../utils/validationUtils');
const { sleep } = require('../../utils/commonUtils');

describe('ergastClient - fetchChampionDriver', () => {
  // 'beforeEach' is a Jest hook that runs before each test within this 'describe' block.
  // We use it here to reset the mock implementation of axios.get before each test.
  // This ensures that mocks set up for one test don't interfere with other tests.
  // While `clearMocks: true` in jest.config.js clears call counts etc.,
  // explicitly resetting the implementation like this is safer if tests define different mockResolvedValue.
  beforeEach(() => {
    axios.get.mockReset(); // Resets the mock, including any mock implementations
  });

  // 'it' or 'test' defines an individual test case.
  // The first argument is a string describing what the test is checking.
  test('should return champion details when API call is successful', async () => {
    // --- Arrange (Set up the test conditions) ---

    // Define the mock year we'll pass to our function
    const mockYear = 2023;

    // This is the mock data we expect axios.get to return from the Ergast API.
    // It mimics the nested structure of the actual API response.
    const mockApiResponse = {
      data: { // axios wraps the actual response body in a 'data' property
        MRData: {
          StandingsTable: {
            StandingsLists: [
              {
                DriverStandings: [
                  {
                    Driver: {
                      driverId: 'max_verstappen',
                      givenName: 'Max',
                      familyName: 'Verstappen',
                    },
                  },
                ],
              },
            ],
          },
        },
      },
    };

    // Configure our mock axios.get to return the mockApiResponse when called.
    // .mockResolvedValueOnce() means for the next call to axios.get, it will return a Promise
    // that resolves to mockApiResponse. We use 'Once' if we expect it to be called once per test,
    // or if subsequent calls in the same test might need different mock responses.
    axios.get.mockResolvedValueOnce(mockApiResponse);

    // --- Act (Execute the function under test) ---

    // Call the function we're testing with the mock year.
    // Since fetchChampionDriver is async, we use await.
    const result = await fetchChampionDriver(mockYear);

    // --- Assert (Check if the results are as expected) ---

    // Check that axios.get was called.
    expect(axios.get).toHaveBeenCalledTimes(1);

    // Check that axios.get was called with the correct URL.
    // The URL should be constructed using the mockYear.
    expect(axios.get).toHaveBeenCalledWith(
      `https://api.jolpi.ca/ergast/f1/${mockYear}/driverStandings/1.json`,
      { timeout: 10000 } // Also check if the timeout option was passed
    );

    // Check that the result from fetchChampionDriver is what we expect.
    // It should have transformed the API response into a simpler object.
    expect(result).toEqual({
      driverRef: 'max_verstappen',
      name: 'Max Verstappen',
    });
  });

  test('should return null when API indicates no champion data (e.g., season not finished)', async () => {
    // --- Arrange ---
    const mockYear = 2025; // A future year, likely no champion yet

    // Mock API response with no standings data
    const mockApiResponse = {
      data: { 
        MRData: {
          StandingsTable: {
            StandingsLists: [] // Empty array indicates no standings
          }
        }
      }
    };

    axios.get.mockResolvedValueOnce(mockApiResponse);

    // --- Act ---
    const result = await fetchChampionDriver(mockYear);

    // --- Assert ---
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(
      `https://api.jolpi.ca/ergast/f1/${mockYear}/driverStandings/1.json`,
      { timeout: 10000 }
    );

    // The function should return null in this scenario, as per its design.
    expect(result).toBeNull();
  });

  test('should throw an error when year validation fails', async () => {
    // Setup validation to fail
    validateYear.mockImplementationOnce(() => {
      throw new Error('Year out of range');
    });

    // When we call fetchChampionDriver with an invalid year,
    // we expect it to throw an error.
    await expect(fetchChampionDriver(9999)).rejects.toThrow('Invalid year parameter');
    
    // We should check that validateYear was called with the year we provided
    expect(validateYear).toHaveBeenCalledWith(9999);
    
    // Since validation failed, the API call should not have been made
    expect(axios.get).not.toHaveBeenCalled();
  });

  test('should handle API timeout correctly', async () => {
    // Create error object with code ECONNABORTED to simulate timeout
    const timeoutError = new Error('Timeout');
    timeoutError.code = 'ECONNABORTED';
    axios.get.mockRejectedValueOnce(timeoutError);
    
    await expect(fetchChampionDriver(2023)).rejects.toThrow('Error fetching champion for 2023: Timeout');
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  test('should handle network error correctly', async () => {
    // Create error object with code ENOTFOUND to simulate network error
    const networkError = new Error('getaddrinfo ENOTFOUND');
    networkError.code = 'ENOTFOUND';
    axios.get.mockRejectedValueOnce(networkError);
    
    await expect(fetchChampionDriver(2023)).rejects.toThrow('Error fetching champion for 2023: Network error');
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  test('should retry on HTTP 429 rate limit error', async () => {
    // First attempt returns 429 rate limit error
    const rateLimitError = new Error('Rate limited');
    rateLimitError.response = { 
      status: 429,
      headers: {
        'retry-after': '2' // Wait 2 seconds before retrying
      }
    };
    axios.get.mockRejectedValueOnce(rateLimitError);
    
    // Second attempt succeeds
    const mockApiResponse = {
      data: { 
        MRData: {
          StandingsTable: {
            StandingsLists: [
              {
                DriverStandings: [
                  {
                    Driver: {
                      driverId: 'max_verstappen',
                      givenName: 'Max',
                      familyName: 'Verstappen',
                    },
                  },
                ],
              },
            ],
          },
        },
      },
    };
    axios.get.mockResolvedValueOnce(mockApiResponse);
    
    // Call the function
    const result = await fetchChampionDriver(2023);
    
    // Verify it was called twice - first failing with 429, then succeeding
    expect(axios.get).toHaveBeenCalledTimes(2);
    
    // Verify sleep was called with the retry delay
    expect(sleep).toHaveBeenCalledWith(2000); // 2 seconds from retry-after header
    
    // Verify we got the expected result after retry
    expect(result).toEqual({
      driverRef: 'max_verstappen',
      name: 'Max Verstappen',
    });
  });
});

describe('ergastClient - fetchSeasonResults', () => {
  beforeEach(() => {
    axios.get.mockReset();
    validateYear.mockReset();
    sleep.mockReset();
  });

  test('should return race results when API call is successful', async () => {
    const mockYear = 2023;
    
    // Mock API response with race data
    const mockApiResponse = {
      data: {
        MRData: {
          RaceTable: {
            Races: [
              {
                round: '1',
                raceName: 'Bahrain Grand Prix',
                date: '2023-03-05',
                time: '15:00:00Z',
                Results: [
                  {
                    Driver: {
                      driverId: 'max_verstappen',
                      givenName: 'Max',
                      familyName: 'Verstappen',
                    }
                  }
                ]
              },
              {
                round: '2',
                raceName: 'Saudi Arabian Grand Prix',
                date: '2023-03-19',
                time: '17:00:00Z',
                Results: [
                  {
                    Driver: {
                      driverId: 'sergio_perez',
                      givenName: 'Sergio',
                      familyName: 'Perez',
                    }
                  }
                ]
              }
            ]
          }
        }
      }
    };
    
    axios.get.mockResolvedValueOnce(mockApiResponse);
    
    const result = await fetchSeasonResults(mockYear);
    
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining(`/${mockYear}/results/1.json`),
      { timeout: expect.any(Number) }
    );
    
    // Verify result format and transformation
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      round: 1,
      name: 'Bahrain Grand Prix',
      date: '2023-03-05',
      time: '15:00:00Z',
      url: undefined, // url not present in mock
      country: null,  // country not present in mock
      winner: {
        driverRef: 'max_verstappen',
        name: 'Max Verstappen',
        nationality: undefined // nationality not present in mock
      }
    });
    expect(result[1]).toMatchObject({
      winner: {
        driverRef: 'sergio_perez',
        name: 'Sergio Perez',
        nationality: undefined
      }
    });
  });

  test('should handle race with no winner data', async () => {
    // Also verify new fields are present with expected values

    const mockYear = 2023;
    
    // Mock API response with a race missing winner data
    const mockApiResponse = {
      data: {
        MRData: {
          RaceTable: {
            Races: [
              {
                round: '1',
                raceName: 'Bahrain Grand Prix',
                date: '2023-03-05',
                time: '15:00:00Z',
                // No Results array provided
              }
            ]
          }
        }
      }
    };
    
    axios.get.mockResolvedValueOnce(mockApiResponse);
    
    const result = await fetchSeasonResults(mockYear);
    
    expect(result).toHaveLength(1);
    expect(result[0].winner).toBeNull();
  });

  test('should throw an error when year validation fails', async () => {
    validateYear.mockImplementationOnce(() => {
      throw new Error('Year out of range');
    });

    await expect(fetchSeasonResults(9999)).rejects.toThrow('Invalid year parameter');
    expect(validateYear).toHaveBeenCalledWith(9999);
    expect(axios.get).not.toHaveBeenCalled();
  });

  test('should throw an error when API request fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('API unavailable'));
    
    await expect(fetchSeasonResults(2023)).rejects.toThrow('Error fetching races for 2023');
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  test('should map url, country, and nationality fields when present', async () => {
    const mockYear = 2023;
    const mockApiResponse = {
      data: {
        MRData: {
          RaceTable: {
            Races: [
              {
                round: '1',
                raceName: 'Australian Grand Prix',
                date: '2023-04-02',
                time: '06:00:00Z',
                url: 'https://example.com/australia',
                Circuit: {
                  Location: {
                    country: 'Australia'
                  }
                },
                Results: [
                  {
                    Driver: {
                      driverId: 'charles_leclerc',
                      givenName: 'Charles',
                      familyName: 'Leclerc',
                      nationality: 'Monegasque'
                    }
                  }
                ]
              }
            ]
          }
        }
      }
    };
    axios.get.mockResolvedValueOnce(mockApiResponse);
    const result = await fetchSeasonResults(mockYear);
    expect(result[0]).toEqual({
      round: 1,
      name: 'Australian Grand Prix',
      date: '2023-04-02',
      time: '06:00:00Z',
      url: 'https://example.com/australia',
      country: 'Australia',
      winner: {
        driverRef: 'charles_leclerc',
        name: 'Charles Leclerc',
        nationality: 'Monegasque'
      }
    });
  });

  test('should handle empty race list correctly', async () => {
    // Mock API response with empty races array
    const mockApiResponse = {
      data: {
        MRData: {
          RaceTable: {
            Races: []
          }
        }
      }
    };
    
    axios.get.mockResolvedValueOnce(mockApiResponse);
    
    const result = await fetchSeasonResults(2023);
    
    expect(result).toEqual([]);
  });
});
