// Views/SeasonRowView.swift
// A SwiftUI view that displays a single season's information in a row.

import SwiftUI

struct SeasonRowView: View {
    let season: Season // The season data to display

    var body: some View {
        VStack(alignment: .leading, spacing: Constants.Spacing.small) {
            Text("\(Localizable.Home.seasonPrefix)\(String(season.year))")
                .font(FontManager.headline())

            HStack(spacing: 4) {
                // Flag emoji based on nationality
                Text(FlagManager.flagEmoji(for: season.champion.nationality))
                Text("\(Localizable.Home.championPrefix)\(season.champion.name)")
                    .font(FontManager.subheadline())
            }

            // Display nationality if available
            if let nationality = season.champion.nationality {
                Text("\(Localizable.Home.nationalityPrefix)\(nationality)")
                    .font(FontManager.caption())
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 10) // Increased vertical padding for better spacing
    }
}
