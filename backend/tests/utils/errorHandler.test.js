// tests/utils/errorHandler.test.js
const { handleApiError } = require('../../utils/errorHandler');
const { sendBadRequestError, sendServerError, sendServiceUnavailableError } = require('../../utils/responseUtils');

// Mock the response utilities
jest.mock('../../utils/responseUtils', () => ({
  sendBadRequestError: jest.fn(),
  sendServerError: jest.fn(),
  sendServiceUnavailableError: jest.fn()
}));

describe('errorHandler', () => {
  // Mock console.error to avoid cluttering test output
  const originalConsoleError = console.error;
  
  beforeEach(() => {
    // Mock console.error
    console.error = jest.fn();
    // Clear mocks before each test
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    // Restore console.error
    console.error = originalConsoleError;
  });
  
  describe('handleApiError', () => {
    // Mock Express response object
    const res = {};
    const context = 'test operation';
    
    test('should handle validation errors with 400 Bad Request', () => {
      const validationErrors = [
        new Error('Invalid year'),
        new Error('Invalid driver data'),
        new Error('Invalid race data')
      ];
      
      validationErrors.forEach(error => {
        handleApiError(error, res, context);
        
        // Should log error
        expect(console.error).toHaveBeenCalledWith(`Error in ${context}:`, error.message);
        
        // Should send bad request error
        expect(sendBadRequestError).toHaveBeenCalledWith(res, error.message);
        
        // Should not use other error responses
        expect(sendServerError).not.toHaveBeenCalled();
        expect(sendServiceUnavailableError).not.toHaveBeenCalled();
        
        // Clear mocks for next iteration
        jest.clearAllMocks();
      });
    });
    
    test('should handle network timeout errors with 503 Service Unavailable', () => {
      const networkErrors = [
        { code: 'ECONNABORTED', message: 'Connection aborted' },
        { message: 'Request timeout exceeded' },
        { response: { status: 429 }, message: 'Rate limited' }
      ];
      
      networkErrors.forEach(error => {
        handleApiError(error, res, context);
        
        // Should log error
        expect(console.error).toHaveBeenCalledWith(`Error in ${context}:`, error.message);
        
        // Should send service unavailable error
        expect(sendServiceUnavailableError).toHaveBeenCalledWith(
          res, 
          'External API service unavailable or rate limited'
        );
        
        // Should not use other error responses
        expect(sendBadRequestError).not.toHaveBeenCalled();
        expect(sendServerError).not.toHaveBeenCalled();
        
        // Clear mocks for next iteration
        jest.clearAllMocks();
      });
    });
    
    test('should handle external API errors with 503 Service Unavailable', () => {
      const externalApiError = { 
        response: { status: 500 }, 
        message: 'External API error' 
      };
      
      handleApiError(externalApiError, res, context);
      
      // Should log error
      expect(console.error).toHaveBeenCalledWith(`Error in ${context}:`, externalApiError.message);
      
      // Should send service unavailable error
      expect(sendServiceUnavailableError).toHaveBeenCalledWith(
        res, 
        `External service error: ${externalApiError.message}`
      );
      
      // Should not use other error responses
      expect(sendBadRequestError).not.toHaveBeenCalled();
      expect(sendServerError).not.toHaveBeenCalled();
    });
    
    test('should handle API fetching errors with 503 Service Unavailable', () => {
      const apiErrors = [
        new Error('fetching races failed'),
        new Error('fetching champion error'),
        new Error('network failure'),
        new Error('External API unavailable')
      ];
      
      apiErrors.forEach(error => {
        handleApiError(error, res, context);
        
        // Should log error
        expect(console.error).toHaveBeenCalledWith(`Error in ${context}:`, error.message);
        
        // Should send service unavailable error
        expect(sendServiceUnavailableError).toHaveBeenCalledWith(
          res, 
          `External service error: ${error.message}`
        );
        
        // Should not use other error responses
        expect(sendBadRequestError).not.toHaveBeenCalled();
        expect(sendServerError).not.toHaveBeenCalled();
        
        // Clear mocks for next iteration
        jest.clearAllMocks();
      });
    });
    
    test('should handle unknown errors with 500 Server Error', () => {
      const unknownError = new Error('Some unexpected error');
      
      handleApiError(unknownError, res, context);
      
      // Should log error
      expect(console.error).toHaveBeenCalledWith(`Error in ${context}:`, unknownError.message);
      
      // Should send server error
      expect(sendServerError).toHaveBeenCalledWith(res, `Failed to ${context}`);
      
      // Should not use other error responses
      expect(sendBadRequestError).not.toHaveBeenCalled();
      expect(sendServiceUnavailableError).not.toHaveBeenCalled();
    });
  });
});
