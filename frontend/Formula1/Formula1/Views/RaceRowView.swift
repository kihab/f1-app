// Views/RaceRowView.swift
// A SwiftUI view that displays a single race's information in a row.

import SwiftUI

struct RaceRowView: View {
    let race: Race // The race data to display

    var body: some View {
        ZStack(alignment: .topTrailing) {
            // Main content with left accent bar
            HStack(spacing: 0) {
                // Left accent bar for champion winners
                if race.isChampion {
                    Rectangle()
                        .fill(Constants.UI.championAccentColor)
                        .frame(width: Constants.UI.Size.accentBarWidth)
                        .padding(.vertical, 4)
                } else {
                    // Empty spacer with same width for consistent alignment
                    Rectangle()
                        .fill(Color.clear)
                        .frame(width: Constants.UI.Size.accentBarWidth)
                        .padding(.vertical, 4)
                }

            // Main content
            VStack(alignment: .leading, spacing: 8) {
                Text("\(Localizable.Races.roundPrefix)\(race.round): \(race.name)")
                    .font(FontManager.headline())

                // Display country and date if available
                if let country = race.country {
                    HStack(spacing: 4) {
                        Text(FlagManager.countryFlag(for: country))
                        Text("\(Localizable.Races.countryPrefix)\(country)")
                            .font(FontManager.subheadline())
                            .foregroundColor(.secondary)
                    }
                }

                if let date = race.date {
                    Text("\(Localizable.Races.datePrefix)\(date)")
                        .font(FontManager.subheadline())
                        .foregroundColor(.secondary)
                }

                HStack(spacing: 4) {
                    Text(Localizable.Races.winnerPrefix)
                        .font(FontManager.subheadline())
                    if race.isChampion {
                        Text(race.winner.name)
                            .font(FontManager.subheadline().weight(.bold))
                            .foregroundColor(Constants.UI.championAccentColor)
                    } else {
                        Text(race.winner.name)
                            .font(FontManager.subheadline())
                    }
                }

                // Display nationality if available
                if let nationality = race.winner.nationality {
                    Text("\(Localizable.Home.nationalityPrefix)\(nationality)")
                        .font(FontManager.caption())
                        .foregroundColor(.secondary)
                }

                // Add Wikipedia link if URL is available with underline to make it more obvious
                if let url = race.url, let wikipediaURL = URL(string: url) {
                    Link(Localizable.Races.wikipediaLinkText, destination: wikipediaURL)
                        .font(FontManager.caption())
                        .foregroundColor(.blue)
                        .underline() // Make it more obvious as a link
                }
            }
            .padding(.leading, 8) // Add padding between accent bar and content

            Spacer() // Pushes content to the left
        }
        .padding(.trailing, 30) // Extra trailing padding to accommodate trophy icon
        .padding(.vertical, 10) // Match vertical padding from SeasonRowView

            // Trophy icon for champion in top right corner
            if race.isChampion {
                Text("🏆")
                    .font(.system(size: 20))
                    .padding([.top, .trailing], 8)
            }
        }
    }
}
