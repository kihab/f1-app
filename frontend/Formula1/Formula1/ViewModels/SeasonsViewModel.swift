// ViewModels/SeasonsViewModel.swift
// ViewModel for managing the state and logic of the SeasonsListView.

import Foundation
import SwiftUI // For @MainActor and ObservableObject

/// Manages the data and state for the `SeasonsListView`.
@MainActor // Ensures UI updates are on the main thread
class SeasonsViewModel: ObservableObject {
    // Published properties to drive the UI
    @Published var seasons: [Season] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String? = nil
    
    // Made internal to be accessible by SeasonsListView for passing to RacesViewModel
    // A better DI or coordinator pattern would be ideal for larger apps.
    internal let apiClient: APIClientProtocol 
    
    /// Initializes the ViewModel with a dependency on an API client.
    /// - Parameter apiClient: An object conforming to `APIClientProtocol` for fetching data.
    init(apiClient: APIClientProtocol) {
        self.apiClient = apiClient
    }
    
    /// Loads seasons data from the API.
    /// Updates `isLoading`, `seasons`, and `errorMessage` based on the fetch result.
    func loadSeasons() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let fetchedSeasons = try await apiClient.fetchSeasons()
            self.seasons = fetchedSeasons
        } catch let error as NetworkError {
            self.errorMessage = error.localizedDescription
            print("NetworkError: \(String(describing: error.errorDescription))")
        } catch {
            self.errorMessage = "An unexpected error occurred: \(error.localizedDescription)"
            print("Unexpected error: \(error.localizedDescription)")
        }
        
        isLoading = false
    }
}
