// Views/SeasonsListView.swift
// The main view for displaying a list of Formula 1 seasons.

import SwiftUI

struct SeasonsListView: View {
    // The ViewModel that provides state and logic for this view.
    // @StateObject ensures the ViewModel's lifecycle is tied to the view's.
    @StateObject var viewModel: SeasonsViewModel
    
    // Store the APIClient to pass it to the next view.
    // This is injected from Formula1App.swift
    // Note: For this to be properly injected by @StateObject in the parent,
    // the viewModel itself should be the one holding the apiClient if it was complex.
    // However, since viewModel is already @StateObject, and apiClient is a dependency of it,
    // and also needed by the child view's viewModel, we pass it explicitly here for clarity
    // in constructing the RacesViewModel.
    // A more advanced DI setup might use an EnvironmentObject for the APIClient if shared widely.
    private let apiClient: APIClientProtocol // Assuming viewModel was initialized with this

    // Initializer to accept the ViewModel
    // We need to ensure the apiClient is accessible for navigation
    init(viewModel: SeasonsViewModel, apiClient: APIClientProtocol) {
        _viewModel = StateObject(wrappedValue: viewModel)
        self.apiClient = apiClient
    }
    
    var body: some View {
        NavigationView { 
            VStack(spacing: 0) { 
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
                
                if viewModel.isLoading {
                    ProgressView("Loading Seasons...")
                        .padding()
                        .frame(maxHeight: .infinity) 
                } else if viewModel.seasons.isEmpty && viewModel.errorMessage == nil {
                    Text("No seasons data available. Try refreshing.")
                        .foregroundColor(.secondary)
                        .padding()
                        .frame(maxHeight: .infinity) 
                } else if !viewModel.seasons.isEmpty {
                    List(viewModel.seasons) { season in
                        // NavigationLink to RacesListView
                        NavigationLink(destination: RacesListView(viewModel: RacesViewModel(year: season.year, apiClient: self.apiClient))) {
                            SeasonRowView(season: season)
                        }
                    }
                    .listStyle(.plain) 
                }
            }
            .navigationTitle("Formula 1 Seasons")
            .onAppear {
                Task {
                    await viewModel.loadSeasons()
                }
            }
        }
    }
}

// Adjusting the SeasonsViewModel to expose its apiClient for navigation purposes
// This is a quick way; a more robust solution might involve a coordinator or routing pattern.
extension SeasonsViewModel {
    func getAPIClient() -> APIClientProtocol {
        return self.apiClient // apiClient is private, need to make it internal or add getter
    }
}
