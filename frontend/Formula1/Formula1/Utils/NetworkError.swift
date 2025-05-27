// Utils/NetworkError.swift
// Defines custom error types for network operations.

import Foundation

/// Enum representing possible errors during network operations.
enum NetworkError: Error, LocalizedError, Equatable {
    case invalidURL
    case requestFailed(Error)
    case invalidResponse
    case httpError(statusCode: Int)
    case decodingError(Error)
    case noData
    case offline // No internet connection
    case emptyData // Data is empty but request succeeded
    case serverMaintenance // Server is under maintenance
    case rateLimited // Too many requests, rate limited

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
        case .offline:
            return "No internet connection. Please check your connection and try again."
        case .emptyData:
            return "No results found."
        case .serverMaintenance:
            return "Server is currently under maintenance. Please try again later."
        case .rateLimited:
            return "Too many requests. Please wait and try again."
        }
    }
}

// Extension to implement custom Equatable conformance for NetworkError
extension NetworkError {
    static func == (lhs: NetworkError, rhs: NetworkError) -> Bool {
        switch (lhs, rhs) {
        case (.invalidURL, .invalidURL),
             (.invalidResponse, .invalidResponse),
             (.noData, .noData),
             (.offline, .offline),
             (.emptyData, .emptyData),
             (.serverMaintenance, .serverMaintenance),
             (.rateLimited, .rateLimited):
            return true
        case (.httpError(let statusCode1), .httpError(let statusCode2)):
            return statusCode1 == statusCode2
        case (.requestFailed(let error1), .requestFailed(let error2)):
            return error1.localizedDescription == error2.localizedDescription
        case (.decodingError(let error1), .decodingError(let error2)):
            return error1.localizedDescription == error2.localizedDescription
        default:
            return false
        }
    }
}
