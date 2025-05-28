//
//  NetworkErrorTests.swift
//  Formula1Tests
//
//  Created for Formula1Tests
//

import XCTest
@testable import Formula1

class NetworkErrorTests: XCTestCase {

    // MARK: - Error Description Tests

    func testInvalidURLErrorDescription() {
        // Arrange
        let error = NetworkError.invalidURL

        // Act
        let description = error.errorDescription

        // Assert
        XCTAssertEqual(description, "The URL provided was invalid.")
    }

    func testRequestFailedErrorDescription() {
        // Arrange
        let underlyingError = NSError(domain: "test", code: 123, userInfo: [NSLocalizedDescriptionKey: "Connection failed"])
        let error = NetworkError.requestFailed(underlyingError)

        // Act
        let description = error.errorDescription

        // Assert
        XCTAssertEqual(description, "The network request failed: Connection failed")
    }

    func testInvalidResponseErrorDescription() {
        // Arrange
        let error = NetworkError.invalidResponse

        // Act
        let description = error.errorDescription

        // Assert
        XCTAssertEqual(description, "The server returned an invalid response.")
    }

    func testHTTPErrorDescription() {
        // Arrange
        let error = NetworkError.httpError(statusCode: 404)

        // Act
        let description = error.errorDescription

        // Assert
        XCTAssertEqual(description, "Server error: HTTP Status Code 404.")
    }

    func testDecodingErrorDescription() {
        // Arrange
        let underlyingError = NSError(domain: "test", code: 123, userInfo: [NSLocalizedDescriptionKey: "Invalid JSON"])
        let error = NetworkError.decodingError(underlyingError)

        // Act
        let description = error.errorDescription

        // Assert
        XCTAssertEqual(description, "Failed to decode data: Invalid JSON.")
    }

    func testNoDataErrorDescription() {
        // Arrange
        let error = NetworkError.noData

        // Act
        let description = error.errorDescription

        // Assert
        XCTAssertEqual(description, "No data was received from the server.")
    }

    func testOfflineErrorDescription() {
        // Arrange
        let error = NetworkError.offline

        // Act
        let description = error.errorDescription

        // Assert
        XCTAssertEqual(description, "No internet connection. Please check your connection and try again.")
    }

    func testEmptyDataErrorDescription() {
        // Arrange
        let error = NetworkError.emptyData

        // Act
        let description = error.errorDescription

        // Assert
        XCTAssertEqual(description, "No results found.")
    }

    func testServerMaintenanceErrorDescription() {
        // Arrange
        let error = NetworkError.serverMaintenance

        // Act
        let description = error.errorDescription

        // Assert
        XCTAssertEqual(description, "Server is currently under maintenance. Please try again later.")
    }

    func testRateLimitedErrorDescription() {
        // Arrange
        let error = NetworkError.rateLimited

        // Act
        let description = error.errorDescription

        // Assert
        XCTAssertEqual(description, "Too many requests. Please wait and try again.")
    }

    // MARK: - Equatable Tests

    func testEquatableImplementation() {
        // Simple cases
        XCTAssertEqual(NetworkError.invalidURL, NetworkError.invalidURL)
        XCTAssertEqual(NetworkError.invalidResponse, NetworkError.invalidResponse)
        XCTAssertEqual(NetworkError.noData, NetworkError.noData)
        XCTAssertEqual(NetworkError.offline, NetworkError.offline)
        XCTAssertEqual(NetworkError.emptyData, NetworkError.emptyData)
        XCTAssertEqual(NetworkError.serverMaintenance, NetworkError.serverMaintenance)
        XCTAssertEqual(NetworkError.rateLimited, NetworkError.rateLimited)

        // Complex cases with associated values
        XCTAssertEqual(NetworkError.httpError(statusCode: 404), NetworkError.httpError(statusCode: 404))
        XCTAssertNotEqual(NetworkError.httpError(statusCode: 404), NetworkError.httpError(statusCode: 500))

        // Test errors with associated error objects
        let error1 = NSError(domain: "test", code: 123, userInfo: [NSLocalizedDescriptionKey: "Error message"])
        let error2 = NSError(domain: "test", code: 456, userInfo: [NSLocalizedDescriptionKey: "Error message"])
        let error3 = NSError(domain: "test", code: 456, userInfo: [NSLocalizedDescriptionKey: "Different message"])

        XCTAssertEqual(NetworkError.requestFailed(error1), NetworkError.requestFailed(error1))
        // Same error message should be equal even with different underlying errors
        XCTAssertEqual(NetworkError.requestFailed(error1), NetworkError.requestFailed(error2))
        // Different error messages should not be equal
        XCTAssertNotEqual(NetworkError.requestFailed(error1), NetworkError.requestFailed(error3))

        // Different error types should not be equal
        XCTAssertNotEqual(NetworkError.invalidURL, NetworkError.invalidResponse)
        XCTAssertNotEqual(NetworkError.httpError(statusCode: 404), NetworkError.noData)
    }
}
