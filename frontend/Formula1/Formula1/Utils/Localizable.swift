// Utils/Localizable.swift
// Localization system for the app

import Foundation

/// Provides localized strings for the application
/// Currently returns hardcoded strings, but structured to support proper localization in the future
struct Localizable {
    
    /// Home screen and navigation related strings
    enum Home {
        static let title = "Formula 1 Seasons"
        static let noSeasonsAvailable = "No seasons data available. Try refreshing."
        static let seasonPrefix = "Season: "
        static let championPrefix = "Champion: "
        static let nationalityPrefix = "Nationality: "
    }
    
    /// Race related strings
    enum Races {
        static let noRacesAvailable = "No races available for that year."
        static let roundPrefix = "Round "
        static let countryPrefix = "Country: "
        static let datePrefix = "Date: "
        static let winnerPrefix = "Winner: "
        static let wikipediaLinkText = "Wikipedia Page"
    }
    
    /// Loading state strings
    enum Loading {
        static let generic = "Loading data..."
        static let seasons = "Warming up engines...\nLoading Formula 1 seasons"
        static let races = "Preparing race data...\nLoading races"
        static let racesWithYear = { (year: String) in "Preparing race data...\nLoading races from \(year)" }
    }
    
    /// Error messages
    enum Errors {
        static let networkError = "Network error. Please check your connection."
        static let dataError = "Could not load data. Please try again."
        static let unexpectedError = "An unexpected error occurred."
    }
    
    /// Helper method to get localized string - setup for future proper localization
    /// Currently just returns the English string, but structure is in place for localization
    static func string(for key: String) -> String {
        // In future, this would use NSLocalizedString or a more robust localization system
        // For now, just return the key as this is our English "translation"
        return key
    }
}
