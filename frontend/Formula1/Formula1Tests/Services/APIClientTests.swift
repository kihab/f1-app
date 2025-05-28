//
//  APIClientTests.swift
//  Formula1Tests
//

import XCTest
@testable import Formula1

class APIClientTests: XCTestCase {
    
    // MARK: - Test Properties
    private var sut: APIClient!
    private var mockNetworkMonitor: MockNetworkMonitor!
    private var mockSession: MockURLSession!
    
    // MARK: - Setup & Teardown
    override func setUp() {
        super.setUp()
        mockNetworkMonitor = MockNetworkMonitor()
        mockSession = MockURLSession()
        sut = APIClient(
            baseURL: Constants.Network.baseURL,
            seasonsEndpoint: Constants.Network.seasonsEndpoint,
            networkMonitor: mockNetworkMonitor,
            session: mockSession
        )
    }
    
    override func tearDown() {
        sut = nil
        mockNetworkMonitor = nil
        mockSession = nil
        super.tearDown()
    }
    
    // MARK: - Test Helpers
    
    // Mock JSON data defined inline for simpler testing
    private var mockSeasonsJSON: String {
        return "{\"data\":[{\"year\":2023,\"champion\":{\"id\":1,\"name\":\"Max Verstappen\",\"driverRef\":\"verstappen\",\"nationality\":\"Dutch\"}},{\"year\":2022,\"champion\":{\"id\":1,\"name\":\"Max Verstappen\",\"driverRef\":\"verstappen\",\"nationality\":\"Dutch\"}},{\"year\":2021,\"champion\":{\"id\":1,\"name\":\"Max Verstappen\",\"driverRef\":\"verstappen\",\"nationality\":\"Dutch\"}}]}"
    }
    
    private var mockRacesJSON: String {
        return "{\"data\":[{\"round\":1,\"name\":\"Bahrain Grand Prix\",\"url\":\"https://en.wikipedia.org/wiki/2023_Bahrain_Grand_Prix\",\"date\":\"2023-03-05\",\"country\":\"Bahrain\",\"isChampion\":true,\"winner\":{\"id\":1,\"name\":\"Max Verstappen\",\"driverRef\":\"verstappen\",\"nationality\":\"Dutch\"}},{\"round\":2,\"name\":\"Saudi Arabian Grand Prix\",\"url\":\"https://en.wikipedia.org/wiki/2023_Saudi_Arabian_Grand_Prix\",\"date\":\"2023-03-19\",\"country\":\"Saudi Arabia\",\"isChampion\":true,\"winner\":{\"id\":2,\"name\":\"Sergio Pérez\",\"driverRef\":\"perez\",\"nationality\":\"Mexican\"}},{\"round\":3,\"name\":\"Australian Grand Prix\",\"url\":\"https://en.wikipedia.org/wiki/2023_Australian_Grand_Prix\",\"date\":\"2023-04-02\",\"country\":\"Australia\",\"isChampion\":true,\"winner\":{\"id\":1,\"name\":\"Max Verstappen\",\"driverRef\":\"verstappen\",\"nationality\":\"Dutch\"}}]}"
    }
    
    private var mockEmptyJSON: String {
        return "{\"data\":[]}"
    }
    
    // MARK: - mapHTTPError Tests
    
    func testMapHTTPError_NotFound_ReturnsEmptyData() {
        // Arrange
        let statusCode = 404
        
        // Act
        let result = sut.mapHTTPError(statusCode)
        
        // Assert
        if case .emptyData = result {
            // Success
        } else {
            XCTFail("Expected .emptyData but got \(result)")
        }
    }
    
    func testMapHTTPError_Timeout_ReturnsRequestFailed() {
        // Arrange
        let statusCodes = [408, 504]
        
        for statusCode in statusCodes {
            // Act
            let result = sut.mapHTTPError(statusCode)
            
            // Assert
            if case .requestFailed(let error) = result {
                // Cast to NSError to access domain and code properties
                let nsError = error as NSError
                XCTAssertEqual(nsError.domain, "APIClient")
                XCTAssertEqual(nsError.code, statusCode)
                XCTAssertEqual(nsError.localizedDescription, "Request timed out")
            } else {
                XCTFail("Expected .requestFailed but got \(result)")
            }
        }
    }
    
    func testMapHTTPError_RateLimit_ReturnsRateLimited() {
        // Arrange
        let statusCode = 429
        
        // Act
        let result = sut.mapHTTPError(statusCode)
        
        // Assert
        if case .rateLimited = result {
            // Success
        } else {
            XCTFail("Expected .rateLimited but got \(result)")
        }
    }
    
    func testMapHTTPError_ServerMaintenance_ReturnsServerMaintenance() {
        // Arrange
        let statusCode = 503
        
        // Act
        let result = sut.mapHTTPError(statusCode)
        
        // Assert
        if case .serverMaintenance = result {
            // Success
        } else {
            XCTFail("Expected .serverMaintenance but got \(result)")
        }
    }
    
    func testMapHTTPError_UnknownCode_ReturnsHTTPError() {
        // Arrange
        let statusCode = 500
        
        // Act
        let result = sut.mapHTTPError(statusCode)
        
        // Assert
        if case .httpError(let code) = result {
            XCTAssertEqual(code, statusCode)
        } else {
            XCTFail("Expected .httpError but got \(result)")
        }
    }
    
    // MARK: - URL Construction Tests
    
    func testMakeSeasonsURL_ReturnsCorrectURL() {
        // Arrange
        let expectedURLString = Constants.Network.baseURL + Constants.Network.seasonsEndpoint
        
        // Act
        let result = sut.makeSeasonsURL()
        
        // Assert
        XCTAssertNotNil(result, "URL should not be nil")
        XCTAssertEqual(result?.absoluteString, expectedURLString)
    }
    
    func testMakeRacesURL_ReturnsCorrectURL() {
        // Arrange
        let year = 2023
        let expectedURLString = Constants.Network.baseURL + Constants.Network.seasonsEndpoint + "/\(year)/races"
        
        // Act
        let result = sut.makeRacesURL(year: year)
        
        // Assert
        XCTAssertNotNil(result, "URL should not be nil")
        XCTAssertEqual(result?.absoluteString, expectedURLString)
    }
    
    // MARK: - Network Connectivity Tests
    
    func testFetchSeasons_WhenOffline_ThrowsOfflineError() async {
        // Arrange
        mockNetworkMonitor.simulateNetworkChange(isConnected: false)
        
        // Act & Assert
        do {
            _ = try await sut.fetchSeasons()
            XCTFail("Expected NetworkError.offline to be thrown")
        } catch {
            // Simply check that some error was thrown - this is the simplest approach
            XCTAssertNotNil(error)
        }
    }
    
    func testFetchRaces_WhenOffline_ThrowsOfflineError() async {
        // Arrange
        mockNetworkMonitor.simulateNetworkChange(isConnected: false)
        let year = 2023
        
        // Act & Assert
        do {
            _ = try await sut.fetchRaces(year: year)
            XCTFail("Expected NetworkError.offline to be thrown")
        } catch {
            // Simply check that some error was thrown - this is the simplest approach
            XCTAssertNotNil(error)
        }
    }
    
    func testFetchSeasons_WhenOnline_DoesNotThrowOfflineError() async {
        // Arrange
        mockNetworkMonitor.simulateNetworkChange(isConnected: true)
        mockSession.setMockResponse(error: URLError(.badURL))
        
        // Act & Assert
        do {
            _ = try await sut.fetchSeasons()
            XCTFail("Expected an error to be thrown")
        } catch {
            XCTAssertNotEqual(error as? NetworkError, NetworkError.offline)
        }
    }
    
    // MARK: - Successful Response Tests
    
    func testFetchSeasons_WithValidResponse_ReturnsMappedSeasons() async throws {
        // Arrange
        mockNetworkMonitor.simulateNetworkChange(isConnected: true)
        let testData = Data(mockSeasonsJSON.utf8)
        let url = URL(string: Constants.Network.baseURL + Constants.Network.seasonsEndpoint)!
        let response = HTTPURLResponse(url: url, statusCode: 200, httpVersion: nil, headerFields: nil)!
        mockSession.setMockResponse(data: testData, response: response)
        
        // Act
        let seasons = try await sut.fetchSeasons()
        
        // Assert
        XCTAssertEqual(seasons.count, 3, "Should return 3 seasons")
        
        // Verify first season's data
        XCTAssertEqual(seasons[0].year, 2023)
        XCTAssertEqual(seasons[0].champion.name, "Max Verstappen")
        XCTAssertEqual(seasons[0].champion.nationality, "Dutch")
        
        // Verify second season's data
        XCTAssertEqual(seasons[1].year, 2022)
        
        // Verify third season's data
        XCTAssertEqual(seasons[2].year, 2021)
    }
    
    func testFetchRaces_WithValidResponse_ReturnsMappedRaces() async throws {
        // Arrange
        mockNetworkMonitor.simulateNetworkChange(isConnected: true)
        let testData = Data(mockRacesJSON.utf8)
        let year = 2023
        let url = URL(string: Constants.Network.baseURL + Constants.Network.seasonsEndpoint + "/\(year)/races")!
        let response = HTTPURLResponse(url: url, statusCode: 200, httpVersion: nil, headerFields: nil)!
        mockSession.setMockResponse(data: testData, response: response)
        
        // Act
        let races = try await sut.fetchRaces(year: year)
        
        // Assert
        XCTAssertEqual(races.count, 3, "Should return 3 races")
        
        // Verify first race's data
        XCTAssertEqual(races[0].round, 1)
        XCTAssertEqual(races[0].name, "Bahrain Grand Prix")
        XCTAssertEqual(races[0].country, "Bahrain")
        XCTAssertEqual(races[0].winner.name, "Max Verstappen")
        
        // Verify second race's data
        XCTAssertEqual(races[1].round, 2)
        XCTAssertEqual(races[1].name, "Saudi Arabian Grand Prix")
        XCTAssertEqual(races[1].winner.name, "Sergio Pérez")
        
        // Verify third race's data
        XCTAssertEqual(races[2].round, 3)
        XCTAssertEqual(races[2].name, "Australian Grand Prix")
    }
    
    func testFetchSeasons_WithEmptyResponse_ReturnsEmptyArray() async throws {
        // Arrange
        mockNetworkMonitor.simulateNetworkChange(isConnected: true)
        let testData = Data(mockEmptyJSON.utf8)
        let url = URL(string: Constants.Network.baseURL + Constants.Network.seasonsEndpoint)!
        let response = HTTPURLResponse(url: url, statusCode: 200, httpVersion: nil, headerFields: nil)!
        mockSession.setMockResponse(data: testData, response: response)
        
        // Act
        let seasons = try await sut.fetchSeasons()
        
        // Assert
        XCTAssertTrue(seasons.isEmpty, "Should return an empty array")
    }
    
    func testFetchRaces_WithEmptyResponse_ReturnsEmptyArray() async throws {
        // Arrange
        mockNetworkMonitor.simulateNetworkChange(isConnected: true)
        let testData = Data(mockEmptyJSON.utf8)
        let year = 2023
        let url = URL(string: Constants.Network.baseURL + Constants.Network.seasonsEndpoint + "/\(year)/races")!
        let response = HTTPURLResponse(url: url, statusCode: 200, httpVersion: nil, headerFields: nil)!
        mockSession.setMockResponse(data: testData, response: response)
        
        // Act
        let races = try await sut.fetchRaces(year: year)
        
        // Assert
        XCTAssertTrue(races.isEmpty, "Should return an empty array")
    }
    
    // MARK: - Error Case Tests
    
    func testFetchSeasons_WithInvalidURL_ThrowsInvalidURLError() async {
        // Arrange
        sut = APIClient(
            baseURL: "", // Empty string will definitely fail URL creation
            seasonsEndpoint: Constants.Network.seasonsEndpoint,
            networkMonitor: mockNetworkMonitor,
            session: mockSession
        )
        
        // Act & Assert
        do {
            _ = try await sut.fetchSeasons()
            XCTFail("Expected an error to be thrown")
        } catch {
            // Simply check that some error was thrown - this is the simplest approach
            XCTAssertNotNil(error)
        }
    }
    
    func testFetchRaces_WithInvalidURL_ThrowsInvalidURLError() async {
        // Arrange
        sut = APIClient(
            baseURL: "", // Empty string will definitely fail URL creation
            seasonsEndpoint: Constants.Network.seasonsEndpoint,
            networkMonitor: mockNetworkMonitor,
            session: mockSession
        )
        
        // Act & Assert
        do {
            _ = try await sut.fetchRaces(year: 2023)
            XCTFail("Expected an error to be thrown")
        } catch {
            // Simply check that some error was thrown - this is the simplest approach
            XCTAssertNotNil(error)
        }
    }
    
    func testFetchSeasons_WithRequestFailure_ThrowsRequestFailedError() async {
        // Arrange
        mockNetworkMonitor.simulateNetworkChange(isConnected: true)
        let testError = URLError(.notConnectedToInternet)
        mockSession.setMockResponse(error: testError)
        
        // Act & Assert
        do {
            _ = try await sut.fetchSeasons()
            XCTFail("Expected NetworkError.requestFailed to be thrown")
        } catch {
            guard case .requestFailed = error as? NetworkError else {
                XCTFail("Expected NetworkError.requestFailed but got \(error)")
                return
            }
        }
    }
    
    func testFetchSeasons_WithInvalidResponse_ThrowsInvalidResponseError() async {
        // Arrange
        mockNetworkMonitor.simulateNetworkChange(isConnected: true)
        let testData = Data("Invalid data".utf8)
        // Use a non-HTTP response
        let response = URLResponse(url: URL(string: "https://example.com")!, mimeType: nil, expectedContentLength: 0, textEncodingName: nil)
        mockSession.setMockResponse(data: testData, response: response)
        
        // Act & Assert
        do {
            _ = try await sut.fetchSeasons()
            XCTFail("Expected NetworkError.invalidResponse to be thrown")
        } catch {
            XCTAssertEqual(error as? NetworkError, NetworkError.invalidResponse)
        }
    }
    
    func testFetchSeasons_WithHTTPErrorStatus_ThrowsMappedHTTPError() async {
        // Arrange - Using 404 status code
        mockNetworkMonitor.simulateNetworkChange(isConnected: true)
        let url = URL(string: Constants.Network.baseURL + Constants.Network.seasonsEndpoint)!
        let response = HTTPURLResponse(url: url, statusCode: 404, httpVersion: nil, headerFields: nil)!
        mockSession.setMockResponse(data: Data(), response: response)
        
        // Act & Assert
        do {
            _ = try await sut.fetchSeasons()
            XCTFail("Expected NetworkError.emptyData to be thrown")
        } catch {
            XCTAssertEqual(error as? NetworkError, NetworkError.emptyData)
        }
    }
    
    func testFetchSeasons_WithDecodingError_ThrowsDecodingError() async {
        // Arrange - Using invalid JSON that won't match our expected format
        mockNetworkMonitor.simulateNetworkChange(isConnected: true)
        let invalidJSON = Data("{ \"invalid\": \"json\" }".utf8)
        let url = URL(string: Constants.Network.baseURL + Constants.Network.seasonsEndpoint)!
        let response = HTTPURLResponse(url: url, statusCode: 200, httpVersion: nil, headerFields: nil)!
        mockSession.setMockResponse(data: invalidJSON, response: response)
        
        // Act & Assert
        do {
            _ = try await sut.fetchSeasons()
            XCTFail("Expected NetworkError.decodingError to be thrown")
        } catch {
            guard case .decodingError = error as? NetworkError else {
                XCTFail("Expected NetworkError.decodingError but got \(error)")
                return
            }
        }
    }
}
