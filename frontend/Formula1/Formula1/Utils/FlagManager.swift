// Utils/FlagManager.swift
// Provides flag emoji conversion from nationality strings

import Foundation

/// Converts country names to flag emojis
struct FlagManager {
    /// Returns a flag emoji for the given nationality
    /// Falls back to a neutral flag if nationality is unknown or mapping is unavailable
    static func flagEmoji(for nationality: String?) -> String {
        guard let nationality = nationality else {
            return "🏳️" // Neutral flag for nil nationality
        }
        
        // Common nationality to flag mappings in F1
        let nationalityMap: [String: String] = [
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
            "Monaco": "🇲🇨",
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
            "Chinese": "🇨🇳"
        ]
        
        return nationalityMap[nationality] ?? "🏳️" // Default to neutral flag if mapping not found
    }
}
