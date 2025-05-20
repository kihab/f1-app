// Services/APIClientProtocol.swift
// Defines the contract for an API client service.

import Foundation

/// Protocol defining the operations for fetching data from the F1 API.
protocol APIClientProtocol {
    /// Fetches a list of seasons, including their champions.
    /// - Returns: An array of `Season` domain models.
    /// - Throws: A `NetworkError` if fetching or decoding fails.
    func fetchSeasons() async throws -> [Season]
}
