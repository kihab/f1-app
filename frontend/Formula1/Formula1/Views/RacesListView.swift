// Views/RacesListView.swift
// View for displaying a list of races for a specific season.

import SwiftUI
import Combine

struct RacesListView: View {
    // The ViewModel that provides state and logic for this view.
    @StateObject var viewModel: RacesViewModel

    // Background color for the app - light off-white color
    // Using the same color as SeasonsListView for consistency
    private let backgroundColor = Constants.Colors.backgroundColor

    var body: some View {
        ZStack {
            // Apply background color to the entire view
            backgroundColor.edgesIgnoringSafeArea(.all)

            VStack(spacing: 0) {
                // Error handling now done via errorToast modifier

                // Content based on loading state
                if viewModel.isLoading {
                    LoadingView(message: Localizable.Loading.racesWithYear(viewModel.navigationTitle), logoScale: 1.0)
                        .frame(maxHeight: .infinity)
                } else if viewModel.races.isEmpty && viewModel.errorMessage == nil {
                    // Show empty state using NetworkError.emptyData and ErrorRecoveryHelper suggestion
                    VStack {
                        Text(NetworkError.emptyData.localizedDescription)
                            .font(FontManager.body())
                            .foregroundColor(.secondary)
                            .padding(.bottom, 4)
                        if let suggestion = ErrorRecoveryHelper.suggestion(for: .emptyData) {
                            Text(suggestion)
                                .font(FontManager.caption())
                                .foregroundColor(.gray)
                        }
                    }
                    .padding()
                    .frame(maxHeight: .infinity)
                } else if !viewModel.races.isEmpty {
                    // Use ScrollView with LazyVStack for more styling control (matching Seasons screen)
                    ScrollView {
                        // Add refreshable modifier for pull-to-refresh functionality
                        LazyVStack(spacing: 0) {
                            ForEach(viewModel.races) { race in
                                VStack(spacing: 0) {
                                    RaceRowView(race: race)
                                        .padding(.horizontal,
                                                 Constants.Spacing.standard)

                                    // Custom separator that doesn't touch edges (matching Seasons screen)
                                    if race.id != viewModel.races.last?.id {
                                        Divider()
                                            .padding(.horizontal,
                                                     Constants.Spacing.standard) // Match horizontal padding
                                    }
                                }
                            }
                        }
                        .padding(.vertical, Constants.Spacing.small) // Vertical padding for the stack
                        .background(Color.white) // White background for the list items
                        .cornerRadius(Constants.Size.standardCornerRadius) // Rounded corners
                        .padding(.horizontal, Constants.Spacing.standard) // Horizontal padding for the entire list
                        .padding(.vertical, Constants.Spacing.small) // Vertical padding for the entire list
                    }
                    .refreshable {
                        // Refresh data when user pulls down
                        await viewModel.loadRaces()
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
        .errorToast(
            error: viewModel.lastError,
            errorMessage: viewModel.errorMessage,
            retryAction: {
                Task {
                    await viewModel.retry()
                }
            }
        )
    }
}
