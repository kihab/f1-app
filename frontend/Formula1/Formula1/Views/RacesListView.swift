// Views/RacesListView.swift
// View for displaying a list of races for a specific season.

import SwiftUI

struct RacesListView: View {
    // The ViewModel that provides state and logic for this view.
    @StateObject var viewModel: RacesViewModel

    // Background color for the app - light off-white color
    // Using the same color as SeasonsListView for consistency
    private let backgroundColor = Color(red: 0.97, green: 0.97, blue: 0.97)

    var body: some View {
        ZStack {
            // Apply background color to the entire view
            backgroundColor.edgesIgnoringSafeArea(.all)

            VStack(spacing: 0) {
                // Display error message if present
                if let error = viewModel.errorMessage {
                    Text(error)
                        .font(FontManager.body())
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
                        .font(FontManager.body())
                        .padding()
                        .frame(maxHeight: .infinity)
                } else if viewModel.races.isEmpty && viewModel.errorMessage == nil {
                    Text("No races available for that year.")
                        .font(FontManager.body())
                        .foregroundColor(.secondary)
                        .padding()
                        .frame(maxHeight: .infinity)
                } else if !viewModel.races.isEmpty {
                    // Use ScrollView with LazyVStack for more styling control (matching Seasons screen)
                    ScrollView {
                        LazyVStack(spacing: 0) {
                            ForEach(viewModel.races) { race in
                                VStack(spacing: 0) {
                                    RaceRowView(race: race)
                                        .padding(.horizontal, 16) // Match horizontal padding from seasons screen

                                    // Custom separator that doesn't touch edges (matching Seasons screen)
                                    if race.id != viewModel.races.last?.id {
                                        Divider()
                                            .padding(.horizontal, 16) // Match horizontal padding
                                    }
                                }
                            }
                        }
                        .padding(.vertical, 8) // Vertical padding for the stack
                        .background(Color.white) // White background for the list items
                        .cornerRadius(8) // Rounded corners
                        .padding(.horizontal, 16) // Horizontal padding for the entire list
                        .padding(.vertical, 8) // Vertical padding for the entire list
                    }
                    .background(backgroundColor) // Set background color of ScrollView
                }
            }
            .navigationTitle(viewModel.navigationTitle)
            .navigationBarTitleDisplayMode(.inline) // Keeping inline for races screen
            .onAppear {
                // Load races when the view appears.
                Task {
                    await viewModel.loadRaces()
                }
            }
        }
    }
}
