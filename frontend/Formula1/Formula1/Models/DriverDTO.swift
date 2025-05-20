// Models/DriverDTO.swift
// Data Transfer Object for a driver, matching the API JSON structure.

import Foundation

/// Represents a driver as received from the API.
struct DriverDTO: Codable {
    let id: Int         // Driver's unique ID from the API/database
    let name: String    // Driver's full name
    let driverRef: String // Driver's reference string (e.g., "hamilton")
}
