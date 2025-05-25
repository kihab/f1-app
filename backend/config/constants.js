// /backend/config/constants.js
// Centralized constants for the application

// API Base URL and parameters
const ERGAST_BASE_URL = 'https://api.jolpi.ca/ergast/f1';

// Data range constants
const START_YEAR = 2005;
const CURRENT_YEAR = new Date().getFullYear();

// HTTP Status codes
const HTTP_STATUS = {
    OK: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};

// Network and timeout constants
const REQUEST_TIMEOUT_MS = 10000; // 10 seconds
const MAX_RETRY_ATTEMPTS = 3;

// Sleep/throttle durations
const THROTTLE_MS = 300; // Standard throttle for API calls

// Cache TTL values (in seconds)
const CACHE_TTL = {
    SEASONS: 300, // 5 minutes for seasons data
    RACES: 300,  // 5 minutes for races data
    // Add other cache TTLs as needed
};

module.exports = {
    // API constants
    ERGAST_BASE_URL,
    
    // Data range
    START_YEAR,
    CURRENT_YEAR,
    
    // HTTP Status
    HTTP_STATUS,
    
    // Network settings
    REQUEST_TIMEOUT_MS,
    MAX_RETRY_ATTEMPTS,
    
    // Throttling
    THROTTLE_MS,
    
    // Cache TTL
    CACHE_TTL
};