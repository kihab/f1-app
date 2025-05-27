//
//  ErrorRecoveryHelperTests.swift
//  Formula1Tests
//
//  Created for Formula1Tests
//

import XCTest
@testable import Formula1

class ErrorRecoveryHelperTests: XCTestCase {
    
    // MARK: - Suggestion Tests
    
    func testSuggestionForOfflineError() {
        // Arrange
        let error = NetworkError.offline
        
        // Act
        let suggestion = ErrorRecoveryHelper.suggestion(for: error)
        
        // Assert
        XCTAssertEqual(suggestion, "Check your internet connection and try again.")
    }
    
    func testSuggestionForRateLimitedError() {
        // Arrange
        let error = NetworkError.rateLimited
        
        // Act
        let suggestion = ErrorRecoveryHelper.suggestion(for: error)
        
        // Assert
        XCTAssertEqual(suggestion, "Please wait a moment before retrying.")
    }
    
    func testSuggestionForServerMaintenanceError() {
        // Arrange
        let error = NetworkError.serverMaintenance
        
        // Act
        let suggestion = ErrorRecoveryHelper.suggestion(for: error)
        
        // Assert
        XCTAssertEqual(suggestion, "Try again later when the server is available.")
    }
    
    func testSuggestionForEmptyDataError() {
        // Arrange
        let error = NetworkError.emptyData
        
        // Act
        let suggestion = ErrorRecoveryHelper.suggestion(for: error)
        
        // Assert
        XCTAssertEqual(suggestion, "Try adjusting your search or filter criteria.")
    }
    
    func testSuggestionForHTTPClientError() {
        // Arrange - Client error (4xx)
        let error = NetworkError.httpError(statusCode: 404)
        
        // Act
        let suggestion = ErrorRecoveryHelper.suggestion(for: error)
        
        // Assert
        XCTAssertEqual(suggestion, "There was a problem with the request. Please try again.")
    }
    
    func testSuggestionForHTTPServerError() {
        // Arrange - Server error (5xx)
        let error = NetworkError.httpError(statusCode: 500)
        
        // Act
        let suggestion = ErrorRecoveryHelper.suggestion(for: error)
        
        // Assert
        XCTAssertEqual(suggestion, "The server encountered an error. Please try again later.")
    }
    
    func testSuggestionForRequestFailedError() {
        // Arrange
        let underlyingError = NSError(domain: "test", code: 123, userInfo: [NSLocalizedDescriptionKey: "Connection failed"])
        let error = NetworkError.requestFailed(underlyingError)
        
        // Act
        let suggestion = ErrorRecoveryHelper.suggestion(for: error)
        
        // Assert
        XCTAssertEqual(suggestion, "The request failed. Please check your connection and try again.")
    }
    
    func testSuggestionForUnsupportedError() {
        // Arrange - We'll use invalidURL as a case without a specific suggestion
        let error = NetworkError.invalidURL
        
        // Act
        let suggestion = ErrorRecoveryHelper.suggestion(for: error)
        
        // Assert
        XCTAssertNil(suggestion, "Should return nil for errors without specific suggestions")
    }
    
    // MARK: - Button Label Tests
    
    func testButtonLabelForOfflineError() {
        // Arrange
        let error = NetworkError.offline
        
        // Act
        let buttonLabel = ErrorRecoveryHelper.buttonLabel(for: error)
        
        // Assert
        XCTAssertEqual(buttonLabel, "Reconnect")
    }
    
    func testButtonLabelForRateLimitedError() {
        // Arrange
        let error = NetworkError.rateLimited
        
        // Act
        let buttonLabel = ErrorRecoveryHelper.buttonLabel(for: error)
        
        // Assert
        XCTAssertEqual(buttonLabel, "Try Again Later")
    }
    
    func testButtonLabelForServerMaintenanceError() {
        // Arrange
        let error = NetworkError.serverMaintenance
        
        // Act
        let buttonLabel = ErrorRecoveryHelper.buttonLabel(for: error)
        
        // Assert
        XCTAssertEqual(buttonLabel, "Retry")
    }
    
    func testButtonLabelForDefaultError() {
        // Arrange - Using various errors that should return the default label
        let errors: [NetworkError] = [
            .invalidURL,
            .invalidResponse,
            .httpError(statusCode: 404),
            .decodingError(NSError(domain: "test", code: 123, userInfo: nil)),
            .noData,
            .emptyData
        ]
        
        // Act & Assert
        for error in errors {
            let buttonLabel = ErrorRecoveryHelper.buttonLabel(for: error)
            XCTAssertEqual(buttonLabel, "Retry", "Default button label should be 'Retry' for \(error)")
        }
    }
}
