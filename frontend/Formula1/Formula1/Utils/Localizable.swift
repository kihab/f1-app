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
        static let racesTitle = "Races"
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
        static let networkRestored = "Network connection restored. You can try again."
        static let loadingData = "Loading data..."

        // Network error messages
        static let invalidURL = "The URL provided was invalid."
        static let invalidResponse = "The server returned an invalid response."
        static let noData = "No data was received from the server."
        static let offline = "No internet connection. Please check your connection and try again."
        static let emptyData = "No results found."
        static let serverMaintenance = "Server is currently under maintenance. Please try again later."
        static let rateLimited = "Too many requests. Please wait and try again."
        static let requestFailed = "The network request failed: %@"
        static let decodingError = "Failed to decode data: %@."
        static let httpError = "Server error: HTTP Status Code %d."

        // Error recovery suggestions
        static let checkConnection = "Check your internet connection and try again."
        static let tryAgainLater = "Please wait a moment before retrying."
        static let serverUnavailable = "Try again later when the server is available."
        static let adjustSearch = "Try adjusting your search or filter criteria."
        static let serverError = "The server encountered an error. Please try again later."
        static let requestProblem = "There was a problem with the request. Please try again."
        static let requestFailedRecovery = "The request failed. Please check your connection and try again."

        // Button labels
        static let reconnect = "Reconnect"
        static let tryAgain = "Try Again Later"
        static let retry = "Retry"
    }

    /// Helper method to get localized string - setup for future proper localization
    /// Currently just returns the English string, but structure is in place for localization
    static func string(for key: String) -> String {
        // In future, this would use NSLocalizedString or a more robust localization system
        // For now, just return the key as this is our English "translation"
        return key
    }
}
