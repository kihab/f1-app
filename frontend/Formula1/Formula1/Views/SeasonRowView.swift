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

// Preview for SeasonRowView (optional, but good for development)
#if DEBUG
struct SeasonRowView_Previews: PreviewProvider {
    static var previews: some View {
        SeasonRowView(season: Season(year: 2023, 
                                      champion: Driver(id: 1, 
                                                       name: "Max Verstappen", 
                                                       driverRef: "verstappen")))
        .previewLayout(.sizeThatFits)
        .padding()
    }
}
#endif
