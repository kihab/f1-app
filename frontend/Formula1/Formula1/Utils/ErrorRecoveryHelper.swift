// Utils/ErrorRecoveryHelper.swift
// Provides suggestions or actions for user recovery based on NetworkError type.

import Foundation

/// Helper class for error recovery suggestions based on NetworkError.
class ErrorRecoveryHelper {
    /// Returns a user-facing suggestion string for a given NetworkError.
    static func suggestion(for error: NetworkError) -> String? {
        switch error {
        case .offline:
            return Localizable.Errors.checkConnection
        case .rateLimited:
            return Localizable.Errors.tryAgainLater
        case .serverMaintenance:
            return Localizable.Errors.serverUnavailable
        case .emptyData:
            return Localizable.Errors.adjustSearch
        case .httpError(let statusCode):
            if statusCode >= 500 {
                return Localizable.Errors.serverError
            } else if statusCode >= 400 {
                return Localizable.Errors.requestProblem
            }
            return nil
        case .requestFailed:
            return Localizable.Errors.requestFailedRecovery
        default:
            return nil // No specific suggestion for other errors
        }
    }

    /// Returns a button label appropriate for the error type
    static func buttonLabel(for error: NetworkError) -> String {
        switch error {
        case .offline:
            return Localizable.Errors.reconnect
        case .rateLimited:
            return Localizable.Errors.tryAgain
        case .serverMaintenance:
            return Localizable.Errors.retry
        default:
            return Localizable.Errors.retry
        }
    }
}
