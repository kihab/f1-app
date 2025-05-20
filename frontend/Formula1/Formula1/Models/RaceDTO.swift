// Models/RaceDTO.swift
// Data Transfer Object for a race, matching the API JSON structure.

import Foundation

/// Represents race data as received from the API.
struct RaceDTO: Codable {
    let round: Int
    let name: String
    let isChampion: Bool // True if the winner of this race is also the season champion
    let winner: DriverDTO // Nested DTO for the race winner
}
