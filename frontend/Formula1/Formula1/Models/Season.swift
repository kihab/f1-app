// Models/Season.swift
// Domain model for a season.

import Foundation

/// Represents a Formula 1 season within the application's domain.
struct Season: Identifiable {
    let year: Int           // The year of the season
    let champion: Driver    // The champion driver of the season (domain model)

    /// Conformance to Identifiable, using the year as a unique ID.
    var id: Int { year }
}
