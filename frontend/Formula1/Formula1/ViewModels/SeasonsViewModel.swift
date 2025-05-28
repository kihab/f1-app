// ViewModels/SeasonsViewModel.swift
// ViewModel for managing the state and logic of the SeasonsListView.

import Foundation
import SwiftUI // For @MainActor and ObservableObject
import Combine // For AnyCancellable

/// Manages the data and state for the `SeasonsListView`.
@MainActor // Ensures UI updates are on the main thread
class SeasonsViewModel: ObservableObject {
    // Published properties to drive the UI
    @Published var seasons: [Season] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var lastError: NetworkError? // Store the actual error for context

    // Used to monitor network connectivity
    private var networkMonitor: NetworkMonitor
    private var cancellables = Set<AnyCancellable>()

    // Made internal to be accessible by SeasonsListView for passing to RacesViewModel
    // A better DI or coordinator pattern would be ideal for larger apps.
    internal let apiClient: APIClientProtocol

    /// Initializes the ViewModel with a dependency on an API client.
    /// - Parameters:
    ///   - apiClient: An object conforming to `APIClientProtocol` for fetching data.
    ///   - networkMonitor: A NetworkMonitor to check for connectivity status, defaults to a new instance.
    init(apiClient: APIClientProtocol, networkMonitor: NetworkMonitor = NetworkMonitor()) {
        self.apiClient = apiClient
        self.networkMonitor = networkMonitor

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

    /// Loads seasons data from the API.
    /// Updates `isLoading`, `seasons`, and `errorMessage` based on the fetch result.
    func loadSeasons() async {
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
            let fetchedSeasons = try await apiClient.fetchSeasons()
            self.seasons = fetchedSeasons

            // Check for empty data case
            if fetchedSeasons.isEmpty {
                self.errorMessage = NetworkError.emptyData.localizedDescription
                self.lastError = .emptyData
            }
        } catch let error as NetworkError {
            self.errorMessage = error.localizedDescription
            self.lastError = error
            print("NetworkError: \(String(describing: error.errorDescription))")
        } catch {
            self.errorMessage = "An unexpected error occurred: \(error.localizedDescription)"
            print("Unexpected error: \(error.localizedDescription)")
        }

        isLoading = false
    }
}
