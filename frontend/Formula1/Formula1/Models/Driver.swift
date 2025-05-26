// Models/Driver.swift
// Domain model for a driver.

import Foundation

/// Represents a driver within the application's domain.
struct Driver: Identifiable {
    let id: Int         // Driver's unique ID, typically from the API
    let name: String    // Driver's full name
    let driverRef: String // Driver's reference string
    let nationality: String? // Driver's nationality
}
