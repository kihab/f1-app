// Views/SeasonRowView.swift
// A SwiftUI view that displays a single season's information in a row.

import SwiftUI

struct SeasonRowView: View {
    let season: Season // The season data to display
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Season: \(String(season.year))")
                .font(.headline)
            Text("Champion: \(season.champion.name)")
                .font(.subheadline)
        }
        .padding(.vertical, 8) // Add some padding for better spacing in the list
    }
}
