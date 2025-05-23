// jest.config.js

// This is the configuration file for Jest.
// Jest will automatically look for a file named jest.config.js (or jest.config.json)
// in your project's root directory (where your package.json is).

module.exports = {
    // testEnvironment: 'node'
    // Specifies the environment in which the tests will be run.
    // For backend Node.js projects, 'node' is crucial. It ensures that
    // Node.js globals (like `process`, `Buffer`, etc.) are available and that
    // tests behave as they would in a Node.js runtime.
    // The other common option is 'jsdom' for frontend projects that need a DOM simulation.
    testEnvironment: 'node',
  
    // verbose: true
    // When true, Jest will display individual test results with the test suite hierarchy.
    // If false (default), it usually shows a summary unless tests fail.
    // Setting to true can be helpful for more detailed output during test runs.
    verbose: true,
  
    // collectCoverage: true
    // A boolean indicating whether test coverage information should be collected and reported.
    // When true, Jest will try to determine which lines of your source code were executed by your tests.
    // This requires no extra setup for basic JavaScript projects with Jest.
    collectCoverage: true,
  
    // coverageDirectory: 'coverage'
    // Specifies the directory where Jest should output its coverage files.
    // A common convention is to name this directory 'coverage'.
    // Inside this directory, Jest will typically generate an HTML report (in coverage/lcov-report/index.html)
    // that you can open in a browser to see detailed coverage metrics per file and per line.
    coverageDirectory: 'coverage',
  
    // clearMocks: true
    // Automatically clear mock calls, instances, contexts and results before every test.
    // This is a good practice to ensure that mock behavior from one test does not
    // unintentionally affect another test, leading to more isolated and reliable tests.
    // If false (default), you might need to manually call jest.clearAllMocks() or similar in
    // a beforeEach block if you reuse mocks across tests in a suite.
    clearMocks: true,
  
    // coverageReporters: ['json', 'lcov', 'text', 'clover']
    // (Optional) You can specify which formats you want for coverage reports.
    // 'lcov' is needed for the HTML report. 'text' gives a summary in the console.
    // 'json' can be used by other tools.
    // Default usually includes 'json', 'lcov', 'text'.
    // coverageReporters: ['json', 'lcov', 'text'],
  
    // testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)']
    // (Optional) Jest's default pattern for finding test files.
    // It looks for .js, .jsx, .ts, .tsx files inside __tests__ folders,
    // and also for files with .test.js (or .spec.js, etc.) extensions.
    // You usually don't need to set this unless you have a custom directory structure for tests.
    // For example, if all your tests are in a top-level 'tests' folder and end with '.test.js':
    // testMatch: ["<rootDir>/tests/**/*.test.js"],
    // (<rootDir> is a special token Jest replaces with the root directory of your project)
  
    // moduleNameMapper: {}
    // (Optional) A map from regular expressions to module names or to arrays of module names that
    // allow to stub out resources, like images or styles with a single module.
    // More common in frontend projects or projects with complex import aliases.
    // For this backend project, likely not needed initially.
  
    // setupFilesAfterEnv: []
    // (Optional) A list of paths to modules that run some code to configure or set up the
    // testing framework before each test file in the suite is executed.
    // Useful if you have global setup tasks (e.g., configuring a testing database connection once).
    // For example: setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
  };