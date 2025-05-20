// Models/SeasonDTO.swift
// Data Transfer Object for a season, matching the API JSON structure.

import Foundation

/// Represents a season as received from the API, including its champion driver.
struct SeasonDTO: Codable {
    let year: Int               // The year of the season
    let champion: DriverDTO     // The champion driver of the season
}
