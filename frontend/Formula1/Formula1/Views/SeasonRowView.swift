// Views/SeasonRowView.swift
// A SwiftUI view that displays a single season's information in a row.

import SwiftUI

struct SeasonRowView: View {
    let season: Season // The season data to display
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) { // Increased spacing between elements
            Text("Season: \(String(season.year))")
                .font(FontManager.headline()) // Using FontManager for consistent styling
            
            HStack(spacing: 4) {
                // Flag emoji based on nationality
                Text(FlagManager.flagEmoji(for: season.champion.nationality))
                Text("Champion: \(season.champion.name)")
                    .font(FontManager.subheadline())
            }
            
            // Display nationality if available
            if let nationality = season.champion.nationality {
                Text("Nationality: \(nationality)")
                    .font(FontManager.caption())
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 10) // Increased vertical padding for better spacing
    }
}
