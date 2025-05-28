// Utils/FlagManager.swift
// Provides flag emoji conversion from nationality and country strings

import Foundation

/// Converts country and nationality names to flag emojis
struct FlagManager {
    // MARK: - Neutral flag fallback
    private static let neutralFlag = "🏳️" // Neutral flag for unknown countries/nationalities

    // MARK: - Common flag mapping
    // Shared map for both country and nationality lookups
    private static let flagMap: [String: String] = [
        // Nationalities
        "British": "🇬🇧",
        "German": "🇩🇪",
        "Spanish": "🇪🇸",
        "Finnish": "🇫🇮",
        "Australian": "🇦🇺",
        "Brazilian": "🇧🇷",
        "Italian": "🇮🇹",
        "French": "🇫🇷",
        "Canadian": "🇨🇦",
        "Dutch": "🇳🇱",
        "Austrian": "🇦🇹",
        "American": "🇺🇸",
        "Mexican": "🇲🇽",
        "Belgian": "🇧🇪",
        "Japanese": "🇯🇵",
        "Swedish": "🇸🇪",
        "New Zealander": "🇳🇿",
        "Portuguese": "🇵🇹",
        "Danish": "🇩🇰",
        "Polish": "🇵🇱",
        "Swiss": "🇨🇭",
        "Thai": "🇹🇭",
        "Russian": "🇷🇺",
        "Chinese": "🇨🇳",

        // Countries (some overlap with nationalities but we list both for clarity)
        "United Kingdom": "🇬🇧",
        "Great Britain": "🇬🇧",
        "UK": "🇬🇧",
        "England": "🇬🇧",
        "Germany": "🇩🇪",
        "Spain": "🇪🇸",
        "Finland": "🇫🇮",
        "Australia": "🇦🇺",
        "Brazil": "🇧🇷",
        "Italy": "🇮🇹",
        "France": "🇫🇷",
        "Canada": "🇨🇦",
        "Netherlands": "🇳🇱",
        "Holland": "🇳🇱",
        "Austria": "🇦🇹",
        "USA": "🇺🇸",
        "United States": "🇺🇸",
        "America": "🇺🇸",
        "Mexico": "🇲🇽",
        "Monaco": "🇲🇨",
        "Belgium": "🇧🇪",
        "Japan": "🇯🇵",
        "Sweden": "🇸🇪",
        "New Zealand": "🇳🇿",
        "Portugal": "🇵🇹",
        "Denmark": "🇩🇰",
        "Poland": "🇵🇱",
        "Switzerland": "🇨🇭",
        "Thailand": "🇹🇭",
        "Russia": "🇷🇺",
        "China": "🇨🇳",
        "Hungary": "🇭🇺",
        "Azerbaijan": "🇦🇿",
        "Bahrain": "🇧🇭",
        "Singapore": "🇸🇬",
        "Malaysia": "🇲🇾",
        "UAE": "🇦🇪",
        "Abu Dhabi": "🇦🇪",
        "Saudi Arabia": "🇸🇦",
        "Qatar": "🇶🇦",
        "Vietnam": "🇻🇳",
        "South Korea": "🇰🇷",
        "Korea": "🇰🇷",
        "Turkey": "🇹🇷",
        "South Africa": "🇿🇦"
    ]

    /// Returns a flag emoji for the given nationality
    /// Falls back to a neutral flag if nationality is unknown or mapping is unavailable
    static func flagEmoji(for nationality: String?) -> String {
        guard let nationality = nationality else {
            return neutralFlag
        }

        return flagMap[nationality] ?? neutralFlag
    }

    /// Returns a flag emoji for the given country
    /// Falls back to a neutral flag if country is unknown or mapping is unavailable
    static func countryFlag(for country: String?) -> String {
        guard let country = country else {
            return neutralFlag
        }

        return flagMap[country] ?? neutralFlag
    }
}
