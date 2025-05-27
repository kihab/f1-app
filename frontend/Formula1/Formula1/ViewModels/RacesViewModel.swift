// ViewModels/RacesViewModel.swift
// ViewModel for managing the state and logic of the RacesListView.

import Foundation
import SwiftUI // For @MainActor and ObservableObject
import Combine // For AnyCancellable

/// Manages the data and state for the `RacesListView`.
@MainActor // Ensures UI updates are on the main thread
class RacesViewModel: ObservableObject {
    // Published properties to drive the UI
    @Published var races: [Race] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String? = nil
    @Published var lastError: NetworkError? = nil // Store the actual error for context
    @Published var navigationTitle: String = "Races"
    
    // Used to monitor network connectivity
    private var networkMonitor = NetworkMonitor()
    private var cancellables = Set<AnyCancellable>()
    
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
        
        // Monitor network status changes
        networkMonitor.$isConnected
            .dropFirst() // Skip the initial value
            .receive(on: RunLoop.main)
            .sink { [weak self] isConnected in
                if isConnected, self?.lastError == .offline {
                    // When network comes back and last error was offline, show reconnected message
                    self?.errorMessage = "Network connection restored. You can try again."
                }
            }
            .store(in: &cancellables)
    }
    
    /// Loads races data for the specified year from the API.
    /// Updates `isLoading`, `races`, and `errorMessage` based on the fetch result.
    /// Loads races data for the specified year from the API.
    /// Updates `isLoading`, `races`, and `errorMessage` based on the fetch result.
    func loadRaces() async {
        await fetchData()
    }
    
    /// Retries the last failed request.
    func retry() async {
        await fetchData()
    }
    
    /// Internal method to fetch data and handle errors
    private func fetchData() async {
        // Check for network connection first
        if !networkMonitor.isConnected {
            self.errorMessage = NetworkError.offline.localizedDescription
            self.lastError = .offline
            return
        }
        
        isLoading = true
        errorMessage = nil
        lastError = nil
        
        do {
            let fetchedRaces = try await apiClient.fetchRaces(year: self.year)
            self.races = fetchedRaces
            
            // Check for empty data case
            if fetchedRaces.isEmpty {
                self.errorMessage = NetworkError.emptyData.localizedDescription
                self.lastError = .emptyData
            }
        } catch let error as NetworkError {
            self.errorMessage = error.localizedDescription
            self.lastError = error
            print("NetworkError fetching races for year \(year): \(String(describing: error.errorDescription))")
        } catch {
            self.errorMessage = "An unexpected error occurred while fetching races for year \(year): \(error.localizedDescription)"
            print("Unexpected error fetching races for year \(year): \(error.localizedDescription)")
        }
        
        isLoading = false
    }
}
