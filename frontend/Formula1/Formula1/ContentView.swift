//
//  ContentView.swift
//  Formula1
//
//  Created by Karim Ihab on 19/05/2025.
//

import SwiftUI

// Data models for API response
struct Driver: Codable, Identifiable {
    let id: Int
    let name: String
    let driverRef: String
}

struct Season: Codable, Identifiable {
    let year: Int
    let champion: Driver
    
    var id: Int { year } // Using year as the identifier
}

struct ContentView: View {
    // State variables for UI
    @State private var seasons: [Season] = []
    @State private var isLoading = false
    @State private var errorMessage: String? = nil
    
    var body: some View {
        NavigationView {
            VStack {
                // Error message display
                if let error = errorMessage {
                    Text(error)
                        .foregroundColor(.red)
                        .padding()
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(8)
                        .padding(.horizontal)
                }
                
                // Content based on loading state
                if isLoading {
                    // Loading spinner
                    ProgressView("Loading Seasons...")
                        .padding()
                } else if seasons.isEmpty && errorMessage == nil {
                    // Empty state
                    Text("No seasons data available")
                        .foregroundColor(.secondary)
                        .padding()
                } else {
                    // Seasons list
                    List(seasons) { season in
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Season: \(String(season.year))")
                                .font(.headline)
                            Text("Champion: \(season.champion.name)")
                                .font(.subheadline)
                        }
                        .padding(.vertical, 8)
                    }
                }
            }
            .navigationTitle("Formula 1 Seasons")
            .onAppear {
                fetchSeasons()
            }
        }
    }
    
    // Function to fetch seasons data from the API
    private func fetchSeasons() {
        // Reset state
        isLoading = true
        errorMessage = nil
        
        // Create URL
        guard let url = URL(string: "http://localhost:3000/api/seasons") else {
            errorMessage = "Invalid URL"
            isLoading = false
            return
        }
        
        // Create URLSession task
        URLSession.shared.dataTask(with: url) { data, response, error in
            // Handle network error
            if let error = error {
                DispatchQueue.main.async {
                    self.errorMessage = "Network error: \(error.localizedDescription)"
                    self.isLoading = false
                }
                return
            }
            
            // Check for HTTP status code
            guard let httpResponse = response as? HTTPURLResponse,
                  (200...299).contains(httpResponse.statusCode) else {
                DispatchQueue.main.async {
                    self.errorMessage = "Server error: \(String(describing: (response as? HTTPURLResponse)?.statusCode ?? 0))"
                    self.isLoading = false
                }
                return
            }
            
            // Check we have data
            guard let data = data else {
                DispatchQueue.main.async {
                    self.errorMessage = "No data received"
                    self.isLoading = false
                }
                return
            }
            
            // Decode JSON data
            do {
                let decodedSeasons = try JSONDecoder().decode([Season].self, from: data)
                DispatchQueue.main.async {
                    self.seasons = decodedSeasons
                    self.isLoading = false
                }
            } catch {
                DispatchQueue.main.async {
                    self.errorMessage = "Failed to decode data: \(error.localizedDescription)"
                    self.isLoading = false
                    print("Decoding error: \(error)")
                }
            }
        }.resume()
    }
}

#Preview {
    ContentView()
}
