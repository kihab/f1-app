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
            return Localizable.Errors.invalidURL
        case .requestFailed(let error):
            return String(format: Localizable.Errors.requestFailed, error.localizedDescription)
        case .invalidResponse:
            return Localizable.Errors.invalidResponse
        case .httpError(let statusCode):
            return String(format: Localizable.Errors.httpError, statusCode)
        case .decodingError(let error):
            return String(format: Localizable.Errors.decodingError, error.localizedDescription)
        case .noData:
            return Localizable.Errors.noData
        case .offline:
            return Localizable.Errors.offline
        case .emptyData:
            return Localizable.Errors.emptyData
        case .serverMaintenance:
            return Localizable.Errors.serverMaintenance
        case .rateLimited:
            return Localizable.Errors.rateLimited
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
