// Import the function we want to test
// The path is relative from this test file to the ergastClient.js file
const { fetchChampionDriver } = require('../utils/ergastClient');

// Import axios so we can mock it
// We need to mock axios to prevent actual network calls during our unit tests
// and to control the responses our function receives.
const axios = require('axios');

// This line tells Jest to replace the actual 'axios' module with a mock version.
// All functions exported by 'axios' (like axios.get, axios.post, etc.)
// will become Jest mock functions (jest.fn()).
// This mock is automatically active for all tests in this file.
jest.mock('axios');

// 'describe' creates a block that groups together several related tests.
// It's good for organizing tests around a specific module or functionality.
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

    // Mock API response indicating no standings data.
    // This could be an empty StandingsLists array or missing DriverStandings.
    const mockApiResponseNoData = {
      data: {
        MRData: {
          StandingsTable: {
            StandingsLists: [], // Empty list, indicating no standings
          },
        },
      },
    };

    axios.get.mockResolvedValueOnce(mockApiResponseNoData);

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

  // More tests can be added here later for:
  // - Handling network errors (axios.get throws an error)
  // - Handling 429 errors and retry logic (more complex to test, might involve jest.useFakeTimers())
});