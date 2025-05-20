// ViewModels/RacesViewModel.swift
// ViewModel for managing the state and logic of the RacesListView.

import Foundation
import SwiftUI // For @MainActor and ObservableObject

/// Manages the data and state for the `RacesListView`.
@MainActor // Ensures UI updates are on the main thread
class RacesViewModel: ObservableObject {
    // Published properties to drive the UI
    @Published var races: [Race] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String? = nil
    @Published var navigationTitle: String = "Races"
    
    private let year: Int
    private let apiClient: APIClientProtocol
    
    /// Initializes the ViewModel with a specific season year and an API client.
    /// - Parameters:
    ///   - year: The year of the season for which to fetch races.
    ///   - apiClient: An object conforming to `APIClientProtocol` for fetching data.
    init(year: Int, apiClient: APIClientProtocol) {
        self.year = year
        self.apiClient = apiClient
        self.navigationTitle = "Races in \(year)"
    }
    
    /// Loads races data for the specified year from the API.
    /// Updates `isLoading`, `races`, and `errorMessage` based on the fetch result.
    func loadRaces() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let fetchedRaces = try await apiClient.fetchRaces(year: self.year)
            self.races = fetchedRaces
        } catch let error as NetworkError {
            self.errorMessage = error.localizedDescription
            print("NetworkError fetching races for year \(year): \(String(describing: error.errorDescription))")
        } catch {
            self.errorMessage = "An unexpected error occurred while fetching races for year \(year): \(error.localizedDescription)"
            print("Unexpected error fetching races for year \(year): \(error.localizedDescription)")
        }
        
        isLoading = false
    }
}
