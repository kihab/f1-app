//
//  URLSessionProtocol.swift
//  Formula1Tests
//

import Foundation
@testable import Formula1

/// Mock implementation of URLSessionProtocol for testing
class MockURLSession: URLSessionProtocol {
    // Mock response data to be returned for data tasks
    var mockData: Data?
    var mockResponse: URLResponse?
    var mockError: Error?
    
    // Track the URLs that were requested for verification in tests
    private(set) var lastURL: URL?
    private(set) var requestedURLs: [URL] = []
    
    // Configuration for simulating different network conditions
    var simulateNetworkDelay: Bool = false
    var networkDelayInSeconds: TimeInterval = 0.1
    
    /// Initialize with optional mock response values
    /// - Parameters:
    ///   - data: The data to return from the data task
    ///   - response: The URLResponse to return
    ///   - error: Any error to simulate
    init(data: Data? = nil, response: URLResponse? = nil, error: Error? = nil) {
        self.mockData = data
        self.mockResponse = response
        self.mockError = error
    }
    
    /// Simulates fetching data from a URL
    /// - Parameter url: The URL to fetch data from
    /// - Returns: A tuple containing the mock data and response
    /// - Throws: The mock error if one was provided
    func data(from url: URL) async throws -> (Data, URLResponse) {
        // Record the requested URL for test verification
        lastURL = url
        requestedURLs.append(url)
        
        // Simulate network delay if configured
        if simulateNetworkDelay {
            try await Task.sleep(nanoseconds: UInt64(networkDelayInSeconds * 1_000_000_000))
        }
        
        // Throw the mock error if provided
        if let error = mockError {
            throw error
        }
        
        // Return the mock data and response
        guard let data = mockData, let response = mockResponse else {
            throw URLError(.unknown)
        }
        
        return (data, response)
    }
    
    /// Helper method to set up the mock response
    /// - Parameters:
    ///   - data: The data to return
    ///   - response: The URLResponse to return
    ///   - error: Any error to simulate
    func setMockResponse(data: Data? = nil, response: URLResponse? = nil, error: Error? = nil) {
        self.mockData = data
        self.mockResponse = response
        self.mockError = error
    }
    
    /// Creates a mock HTTP response with the given status code
    /// - Parameters:
    ///   - url: The URL for the response
    ///   - statusCode: The HTTP status code
    /// - Returns: A mock HTTPURLResponse
    func createMockHTTPResponse(url: URL, statusCode: Int) -> HTTPURLResponse {
        return HTTPURLResponse(url: url, statusCode: statusCode, httpVersion: "HTTP/1.1", headerFields: nil)!
    }
}
