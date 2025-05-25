// jest.config.js

// This is the configuration file for Jest.
// Jest will automatically look for a file named jest.config.js (or jest.config.json)
// in your project's root directory (where your package.json is).

module.exports = {
    // testEnvironment: 'node'
    // Specifies the environment in which the tests will be run.
    testEnvironment: 'node',
  
    // verbose: true
    // When true, Jest will display individual test results with the test suite hierarchy.
    verbose: true,
  
    // collectCoverage: true
    collectCoverage: true,
  
    // coverageDirectory: 'coverage'
    // Specifies the directory where Jest should output its coverage files.
    coverageDirectory: 'coverage',
  
    // clearMocks: true
    // Automatically clear mock calls, instances, contexts and results before every test.
    clearMocks: true,
  
    collectCoverageFrom: [
      "services/**/*.js",
      "controllers/**/*.js",
      "utils/**/*.js",
      "routes/**/*.js"
    ],

    coverageThreshold: {
      global: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 90
      }
    }
  };