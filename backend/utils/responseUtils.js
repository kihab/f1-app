// utils/responseUtils.js
// Standardized response handling utilities

const { HTTP_STATUS } = require('../config/constants');

/**
 * Send a standardized error response
 * @param {object} res - Express response object 
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {object} details - Optional additional error details
 */
const sendErrorResponse = (res, statusCode, message, details = null) => {
  const response = { error: message };
  
  // Add optional details if provided
  if (details) {
    response.details = details;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Send a bad request (400) error response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 */
const sendBadRequestError = (res, message) => {
  return sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, message);
};

/**
 * Send a server error (500) response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 */
const sendServerError = (res, message = 'Internal server error') => {
  return sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, message);
};

/**
 * Send a service unavailable (503) response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 */
const sendServiceUnavailableError = (res, message) => {
  return sendErrorResponse(res, HTTP_STATUS.SERVICE_UNAVAILABLE, message);
};

/**
 * Send a success response with data
 * @param {object} res - Express response object
 * @param {any} data - Response data
 * @param {string} message - Optional success message
 */
const sendSuccessResponse = (res, data, message = null) => {
  const response = { data };
  
  // Add optional message if provided
  if (message) {
    response.message = message;
  }
  
  return res.status(HTTP_STATUS.OK).json(response);
};

module.exports = {
  sendErrorResponse,
  sendBadRequestError,
  sendServerError,
  sendServiceUnavailableError,
  sendSuccessResponse
};
