// tests/utils/responseUtils.test.js
const { 
  sendErrorResponse,
  sendBadRequestError,
  sendServerError,
  sendServiceUnavailableError,
  sendSuccessResponse
} = require('../../utils/responseUtils');
const { HTTP_STATUS } = require('../../config/constants');

describe('responseUtils', () => {
  // Mock Express response object
  let res;
  
  beforeEach(() => {
    // Create a fresh mock for each test
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });
  
  describe('sendErrorResponse', () => {
    test('should send error response with correct status code and message', () => {
      const statusCode = 400;
      const message = 'Bad request error';
      
      sendErrorResponse(res, statusCode, message);
      
      expect(res.status).toHaveBeenCalledWith(statusCode);
      expect(res.json).toHaveBeenCalledWith({ error: message });
    });
    
    test('should include optional details when provided', () => {
      const statusCode = 400;
      const message = 'Validation error';
      const details = { field: 'email', reason: 'Invalid format' };
      
      sendErrorResponse(res, statusCode, message, details);
      
      expect(res.status).toHaveBeenCalledWith(statusCode);
      expect(res.json).toHaveBeenCalledWith({ 
        error: message,
        details
      });
    });
  });
  
  describe('sendBadRequestError', () => {
    test('should send bad request (400) error response', () => {
      const message = 'Invalid input';
      
      sendBadRequestError(res, message);
      
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ error: message });
    });
  });
  
  describe('sendServerError', () => {
    test('should send server error (500) response with custom message', () => {
      const message = 'Database connection failed';
      
      sendServerError(res, message);
      
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ error: message });
    });
    
    test('should use default message when none provided', () => {
      sendServerError(res);
      
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
  
  describe('sendServiceUnavailableError', () => {
    test('should send service unavailable (503) error response', () => {
      const message = 'External API unavailable';
      
      sendServiceUnavailableError(res, message);
      
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.SERVICE_UNAVAILABLE);
      expect(res.json).toHaveBeenCalledWith({ error: message });
    });
  });
  
  describe('sendSuccessResponse', () => {
    test('should send success response with data', () => {
      const data = { id: 1, name: 'Test Item' };
      
      sendSuccessResponse(res, data);
      
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith({ data });
    });
    
    test('should include optional message when provided', () => {
      const data = { id: 1, name: 'Test Item' };
      const message = 'Item created successfully';
      
      sendSuccessResponse(res, data, message);
      
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith({ 
        data,
        message
      });
    });
  });
});
