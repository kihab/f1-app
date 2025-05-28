// Utils/ErrorRecoveryHelper.swift
// Provides suggestions or actions for user recovery based on NetworkError type.

import Foundation

/// Helper class for error recovery suggestions based on NetworkError.
class ErrorRecoveryHelper {
    /// Returns a user-facing suggestion string for a given NetworkError.
    static func suggestion(for error: NetworkError) -> String? {
        switch error {
        case .offline:
            return "Check your internet connection and try again."
        case .rateLimited:
            return "Please wait a moment before retrying."
        case .serverMaintenance:
            return "Try again later when the server is available."
        case .emptyData:
            return "Try adjusting your search or filter criteria."
        case .httpError(let statusCode):
            if statusCode >= 500 {
                return "The server encountered an error. Please try again later."
            } else if statusCode >= 400 {
                return "There was a problem with the request. Please try again."
            }
            return nil
        case .requestFailed:
            return "The request failed. Please check your connection and try again."
        default:
            return nil // No specific suggestion for other errors
        }
    }

    /// Returns a button label appropriate for the error type
    static func buttonLabel(for error: NetworkError) -> String {
        switch error {
        case .offline:
            return "Reconnect"
        case .rateLimited:
            return "Try Again Later"
        case .serverMaintenance:
            return "Retry"
        default:
            return "Retry"
        }
    }
}
