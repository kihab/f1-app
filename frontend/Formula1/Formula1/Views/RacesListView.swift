// Views/RacesListView.swift
// View for displaying a list of races for a specific season.

import SwiftUI

struct RacesListView: View {
    // The ViewModel that provides state and logic for this view.
    @StateObject var viewModel: RacesViewModel
    
    var body: some View {
        VStack(spacing: 0) {
            // Display error message if present
            if let error = viewModel.errorMessage {
                Text(error)
                    .foregroundColor(.red)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.red.opacity(0.1))
                    .cornerRadius(8)
                    .padding(.horizontal)
                    .padding(.top)
            }
            
            // Content based on loading state
            if viewModel.isLoading {
                ProgressView("Loading Races...")
                    .padding()
                    .frame(maxHeight: .infinity)
            } else if viewModel.races.isEmpty && viewModel.errorMessage == nil {
                Text("No races available for that year.")
                    .foregroundColor(.secondary)
                    .padding()
                    .frame(maxHeight: .infinity)
            } else if !viewModel.races.isEmpty {
                List(viewModel.races) { race in
                    RaceRowView(race: race)
                }
                .listStyle(.plain)
            }
        }
        .navigationTitle(viewModel.navigationTitle)
        .navigationBarTitleDisplayMode(.inline) // Optional: for a more compact title
        .onAppear {
            // Load races when the view appears.
            Task {
                await viewModel.loadRaces()
            }
        }
    }
}
