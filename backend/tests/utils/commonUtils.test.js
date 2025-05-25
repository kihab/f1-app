// tests/utils/commonUtils.test.js
const { sleep, formatTimingLog, logOperationStart } = require('../../utils/commonUtils');

describe('commonUtils', () => {
  describe('sleep', () => {
    test('should delay execution for the specified time', async () => {
      const start = Date.now();
      await sleep(100); // Sleep for 100ms
      const duration = Date.now() - start;
      
      // Allow some flexibility in timing (should be at least 90ms)
      expect(duration).toBeGreaterThanOrEqual(90);
    });
  });

  describe('formatTimingLog', () => {
    test('should format timing information correctly without metadata', () => {
      // Mock Date.now to return a consistent value for testing
      const realDateNow = Date.now;
      const mockStartTime = 1000;
      const mockCurrentTime = 3500; // 2.5 seconds later
      
      try {
        // Mock Date.now
        global.Date.now = jest.fn(() => mockCurrentTime);
        
        const result = formatTimingLog(mockStartTime, 'testOperation');
        expect(result).toBe('Completed testOperation in 2.50s ');
      } finally {
        // Restore the original Date.now
        global.Date.now = realDateNow;
      }
    });

    test('should format timing information correctly with metadata', () => {
      // Mock Date.now to return a consistent value for testing
      const realDateNow = Date.now;
      const mockStartTime = 1000;
      const mockCurrentTime = 5000; // 4 seconds later
      
      try {
        // Mock Date.now
        global.Date.now = jest.fn(() => mockCurrentTime);
        
        const result = formatTimingLog(mockStartTime, 'testOperation', { count: 5, status: 'success' });
        expect(result).toBe('Completed testOperation in 4.00s count: 5, status: success');
      } finally {
        // Restore the original Date.now
        global.Date.now = realDateNow;
      }
    });
  });

  describe('logOperationStart', () => {
    test('should log operation start correctly with metadata', () => {
      // Mock console.log and Date
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const mockDate = new Date('2023-01-01T12:00:00Z');
      const originalDate = global.Date;
      
      try {
        // Mock Date to return consistent timestamp
        global.Date = jest.fn(() => mockDate);
        global.Date.toISOString = originalDate.toISOString;
        mockDate.toISOString = jest.fn(() => '2023-01-01T12:00:00Z');
        
        logOperationStart('testOperation', { param1: 'value1' });
        expect(consoleSpy).toHaveBeenCalledWith('Starting testOperation at 2023-01-01T12:00:00Z (param1: value1)');
      } finally {
        // Restore mocks
        global.Date = originalDate;
        consoleSpy.mockRestore();
      }
    });

    test('should handle operation start with no params', () => {
      // Mock console.log and Date
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const mockDate = new Date('2023-01-01T12:00:00Z');
      const originalDate = global.Date;
      
      try {
        // Mock Date to return consistent timestamp
        global.Date = jest.fn(() => mockDate);
        global.Date.toISOString = originalDate.toISOString;
        mockDate.toISOString = jest.fn(() => '2023-01-01T12:00:00Z');
        
        logOperationStart('testOperation');
        expect(consoleSpy).toHaveBeenCalledWith('Starting testOperation at 2023-01-01T12:00:00Z ');
      } finally {
        // Restore mocks
        global.Date = originalDate;
        consoleSpy.mockRestore();
      }
    });
  });
});
