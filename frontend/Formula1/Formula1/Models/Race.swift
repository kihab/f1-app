// Models/Race.swift
// Domain model for a race.

import Foundation

/// Represents a Formula 1 race within the application's domain.
struct Race: Identifiable {
    let round: Int
    let name: String
    let url: String?        // Wikipedia URL for the race
    let date: String?       // Date of the race in ISO format
    let country: String?    // Country where the race is held
    let isChampion: Bool    // True if the winner of this race is also the season champion
    let winner: Driver      // The winner of the race (domain model)

    /// Conformance to Identifiable, using the round number as a unique ID within a season.
    var id: Int { round }
}
