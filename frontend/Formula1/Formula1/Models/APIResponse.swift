// Models/APIResponse.swift
// Generic wrapper for API responses matching the backend structure.

import Foundation

/// Represents the standard API response structure from the backend.
/// Generic type T allows this to wrap any type of data payload.
struct APIResponse<T: Codable>: Codable {
    let data: T              // The main data payload wrapped by the API
    let message: String?     // Optional message, typically used for empty arrays or errors
}
