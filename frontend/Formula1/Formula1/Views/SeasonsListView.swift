// Views/SeasonsListView.swift
// The main view for displaying a list of Formula 1 seasons.

import SwiftUI

struct SeasonsListView: View {
    // The ViewModel that provides state and logic for this view.
    // @StateObject ensures the ViewModel's lifecycle is tied to the view's.
    @StateObject var viewModel: SeasonsViewModel
    
    var body: some View {
        NavigationView { // Using NavigationView as per the original ContentView
            VStack(spacing: 0) { // Use spacing 0 if specific padding is applied elsewhere
                // Display error message if present
                if let error = viewModel.errorMessage {
                    Text(error)
                        .foregroundColor(.red)
                        .padding()
                        .frame(maxWidth: .infinity) // Ensure it takes full width
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(8)
                        .padding(.horizontal)
                        .padding(.top) // Add some top padding if it's the first element
                }
                
                // Content based on loading state
                if viewModel.isLoading {
                    ProgressView("Loading Seasons...")
                        .padding()
                        .frame(maxHeight: .infinity) // Center loading view if it's alone
                } else if viewModel.seasons.isEmpty && viewModel.errorMessage == nil {
                    Text("No seasons data available. Try refreshing.")
                        .foregroundColor(.secondary)
                        .padding()
                        .frame(maxHeight: .infinity) // Center empty state text
                } else if !viewModel.seasons.isEmpty {
                    // Seasons list
                    List(viewModel.seasons) { season in
                        SeasonRowView(season: season)
                    }
                    .listStyle(.plain) // Optional: set a list style
                }
                // Spacer to push content up if error and list are both hidden, but not ideal.
                // Better to ensure one state (loading, error, empty, content) is always prominent.
            }
            .navigationTitle("Formula 1 Seasons")
            .onAppear {
                // Load seasons when the view appears, if not already loaded
                // or if you want to refresh every time it appears.
                // Consider if (viewModel.seasons.isEmpty) { viewModel.loadSeasons() }
                // if you don't want to reload every time.
                Task {
                    await viewModel.loadSeasons()
                }
            }
        }
    }
}

//// Preview for SeasonsListView (optional, but good for development)
//#if DEBUG
//// Mock APIClient for previews
//class MockAPIClient: APIClientProtocol {
//    let mockSeasons = [
//        Season(year: 2023, champion: Driver(id: 1, name: "Max Verstappen", driverRef: "verstappen")),
//        Season(year: 2022, champion: Driver(id: 1, name: "Max Verstappen", driverRef: "verstappen")),
//        Season(year: 2021, champion: Driver(id: 33, name: "Lewis Hamilton", driverRef: "hamilton"))
//    ]
//    var shouldReturnError = false
//    
//    func fetchSeasons() async throws -> [Season] {
//        try await Task.sleep(nanoseconds: 1_000_000_000) // Simulate network delay
//        if shouldReturnError {
//            throw NetworkError.httpError(statusCode: 500)
//        }
//        return mockSeasons
//    }
//}
//
//struct SeasonsListView_Previews: PreviewProvider {
//    static var previews: some View {
//        // Preview with data
//        SeasonsListView(viewModel: SeasonsViewModel(apiClient: MockAPIClient()))
//        
//        // Preview with loading state (requires a way to set isLoading on ViewModel or a specific mock)
//        // let loadingViewModel = SeasonsViewModel(apiClient: MockAPIClient())
//        // loadingViewModel.isLoading = true // This needs to be done carefully for previews
//        // SeasonsListView(viewModel: loadingViewModel)
//        //    .previewDisplayName("Loading State")
//
//        // Preview with error state
//        let errorViewModel = SeasonsViewModel(apiClient: MockAPIClient())
//        (errorViewModel.apiClient as! MockAPIClient).shouldReturnError = true
//        SeasonsListView(viewModel: errorViewModel)
//            .previewDisplayName("Error State")
//
//        // Preview with empty state
//        let emptyViewModel = SeasonsViewModel(apiClient: MockAPIClient())
//        (emptyViewModel.apiClient as! MockAPIClient).mockSeasons = []
//        SeasonsListView(viewModel: emptyViewModel)
//            .previewDisplayName("Empty State")
//    }
//}
//#endif
