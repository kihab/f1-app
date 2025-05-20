// Utils/NetworkError.swift
// Defines custom error types for network operations.

import Foundation

/// Enum representing possible errors during network operations.
enum NetworkError: Error, LocalizedError {
    case invalidURL
    case requestFailed(Error)
    case invalidResponse
    case httpError(statusCode: Int)
    case decodingError(Error)
    case noData

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "The URL provided was invalid."
        case .requestFailed(let error):
            return "The network request failed: \(error.localizedDescription)"
        case .invalidResponse:
            return "The server returned an invalid response."
        case .httpError(let statusCode):
            return "Server error: HTTP Status Code \(statusCode)."
        case .decodingError(let error):
            return "Failed to decode data: \(error.localizedDescription)."
        case .noData:
            return "No data was received from the server."
        }
    }
}
