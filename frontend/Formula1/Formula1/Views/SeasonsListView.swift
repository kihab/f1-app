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
    
    // Background color for the app - light off-white color
    private let backgroundColor = Constants.UI.backgroundColor

    // Initializer to accept the ViewModel
    // We need to ensure the apiClient is accessible for navigation
    init(viewModel: SeasonsViewModel, apiClient: APIClientProtocol) {
        _viewModel = StateObject(wrappedValue: viewModel)
        self.apiClient = apiClient
    }
    
    var body: some View {
        NavigationView { 
            ZStack {
                // Apply background color to the entire view
                backgroundColor.edgesIgnoringSafeArea(.all)
                
                VStack(spacing: 0) { 
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
                    
                    if viewModel.isLoading {
                        LoadingView(message: Localizable.Loading.seasons, logoScale: 1.2)
                            .frame(maxHeight: .infinity) 
                    } else if viewModel.seasons.isEmpty && viewModel.errorMessage == nil {
                        Text(Localizable.Home.noSeasonsAvailable)
                            .font(FontManager.body())
                            .foregroundColor(.secondary)
                            .padding()
                            .frame(maxHeight: .infinity) 
                    } else if !viewModel.seasons.isEmpty {
                        // Use LazyVStack with custom styling instead of List for more control
                        ScrollView {
                            LazyVStack(spacing: 0) {
                                ForEach(viewModel.seasons) { season in
                                    VStack(spacing: 0) {
                                        // NavigationLink to RacesListView
                                        NavigationLink(destination: RacesListView(viewModel: RacesViewModel(year: season.year, apiClient: self.apiClient))) {
                                            HStack {
                                                SeasonRowView(season: season)
                                                Spacer()
                                                // Add chevron indicator
                                                Image(systemName: "chevron.right")
                                                    .foregroundColor(.gray)
                                                    .font(.system(size: 14, weight: .medium))
                                            }
                                            .padding(.horizontal, Constants.UI.Spacing.standard) // Horizontal padding for content
                                        }
                                        .buttonStyle(PlainButtonStyle()) // Remove default button styling
                                        
                                        // Custom separator that doesn't touch edges
                                        if season.id != viewModel.seasons.last?.id {
                                            Divider()
                                                .padding(.horizontal, Constants.UI.Spacing.standard) // Match horizontal content padding
                                        }
                                    }
                                }
                            }
                            .padding(.vertical, Constants.UI.Spacing.small) // Vertical padding for the stack
                            .background(Color.white) // White background for the list items
                            .cornerRadius(Constants.UI.Size.standardCornerRadius) // Rounded corners
                            .padding(.horizontal, Constants.UI.Spacing.standard) // Horizontal padding for the entire list
                            .padding(.vertical, Constants.UI.Spacing.small) // Vertical padding for the entire list
                        }
                        .background(backgroundColor) // Set background color of ScrollView
                    }
                }
                .navigationTitle(Localizable.Home.title)
                .navigationBarTitleDisplayMode(.large) // Use large title display mode
                .onAppear {
                    Task {
                        await viewModel.loadSeasons()
                    }
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
