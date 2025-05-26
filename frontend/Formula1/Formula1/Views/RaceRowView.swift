// Views/RaceRowView.swift
// A SwiftUI view that displays a single race's information in a row.

import SwiftUI

struct RaceRowView: View {
    let race: Race // The race data to display
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 5) {
                Text("Round \(race.round): \(race.name)")
                    .font(.headline)
                
                // Display country and date if available
                if let country = race.country {
                    Text("Country: \(country)")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                if let date = race.date {
                    Text("Date: \(date)")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                HStack(spacing: 4) {
                    Text("Winner:")
                        .font(.subheadline)
                    if race.isChampion {
                        Text("🏆 \(race.winner.name)")
                            .font(.subheadline.weight(.bold))
                            .foregroundColor(.orange)
                    } else {
                        Text(race.winner.name)
                            .font(.subheadline)
                    }
                }
                
                // Display nationality if available
                if let nationality = race.winner.nationality {
                    Text("Nationality: \(nationality)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                // Add Wikipedia link if URL is available
                if let url = race.url, let wikipediaURL = URL(string: url) {
                    Link("Wikipedia", destination: wikipediaURL)
                        .font(.caption)
                        .foregroundColor(.blue)
                }
            }
            Spacer() // Pushes content to the left
        }
        .padding(.vertical, 8)
    }
}
