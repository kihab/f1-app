// Models/RaceDTO.swift
// Data Transfer Object for a race, matching the API JSON structure.

import Foundation

/// Represents race data as received from the API.
struct RaceDTO: Codable {
    let round: Int
    let name: String
    let url: String?        // Wikipedia URL for the race, nullable
    let date: String?       // Date of the race in ISO format, nullable
    let country: String?    // Country where the race is held, nullable
    let isChampion: Bool    // True if the winner of this race is also the season champion
    let winner: DriverDTO   // Nested DTO for the race winner
}
