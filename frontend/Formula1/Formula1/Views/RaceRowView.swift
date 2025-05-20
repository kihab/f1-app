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
            }
            Spacer() // Pushes content to the left
        }
        .padding(.vertical, 8)
    }
}
