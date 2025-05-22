import XCTest
@testable import Formula1

@MainActor
class SeasonsViewModelTests: XCTestCase {

    var viewModel: SeasonsViewModel!
    var mockAPIClient: MockAPIClient!

    override func setUpWithError() throws {
        try super.setUpWithError()
        mockAPIClient = MockAPIClient()
        viewModel = SeasonsViewModel(apiClient: mockAPIClient)
    }

    override func tearDownWithError() throws {
        viewModel = nil
        mockAPIClient = nil
        try super.tearDownWithError()
    }

    // Test a successful fetch of seasons
    func testLoadSeasons_whenAPISucceeds_populatesSeasonsAndSetsNotLoading() async {
        // Arrange
        let mockChampion = Driver(id: 1, name: "Max Verstappen", driverRef: "verstappen")
        let mockSeasons = [
            Season(year: 2023, champion: mockChampion),
            Season(year: 2022, champion: Driver(id: 2, name: "Lewis Hamilton", driverRef: "hamilton"))
        ]
        mockAPIClient.fetchSeasonsToReturn = mockSeasons
        
        // Act
        await viewModel.loadSeasons()
        
        // Assert
        XCTAssertEqual(mockAPIClient.fetchSeasonsCallCount, 1, "fetchSeasons should be called once.")
        XCTAssertFalse(viewModel.isLoading, "isLoading should be false after loading finishes.")
        XCTAssertEqual(viewModel.seasons.count, 2, "Seasons array should contain 2 seasons.")
        XCTAssertEqual(viewModel.seasons.first?.year, 2023)
        XCTAssertNil(viewModel.errorMessage, "errorMessage should be nil on successful fetch.")
    }

    // Test API failure with a specific NetworkError
    func testLoadSeasons_whenAPIFailsWithNetworkError_setsErrorMessageAndNotLoading() async {
        // Arrange
        let networkError = TestError.mockError("Simulated Network Error")
        mockAPIClient.fetchSeasonsShouldReturnError = true
        mockAPIClient.fetchSeasonsErrorToThrow = networkError
        
        // Act
        await viewModel.loadSeasons()
        
        // Assert
        XCTAssertEqual(mockAPIClient.fetchSeasonsCallCount, 1)
        XCTAssertFalse(viewModel.isLoading, "isLoading should be false after loading finishes.")
        XCTAssertTrue(viewModel.seasons.isEmpty, "Seasons array should be empty on failure.")
        XCTAssertNotNil(viewModel.errorMessage, "errorMessage should be set on failure.")
    }

    // Test API failure with a generic error
    func testLoadSeasons_whenAPIFailsWithOtherError_setsGenericErrorMessageAndNotLoading() async {
        // Arrange
        let genericError = TestError.mockError("A wild error appeared!")
        mockAPIClient.fetchSeasonsShouldReturnError = true
        mockAPIClient.fetchSeasonsErrorToThrow = genericError
        
        // Act
        await viewModel.loadSeasons()
        
        // Assert
        XCTAssertEqual(mockAPIClient.fetchSeasonsCallCount, 1)
        XCTAssertFalse(viewModel.isLoading, "isLoading should be false after loading finishes.")
        XCTAssertTrue(viewModel.seasons.isEmpty)
        XCTAssertNotNil(viewModel.errorMessage)
        XCTAssertEqual(viewModel.errorMessage, "An unexpected error occurred: \(genericError.localizedDescription)", "Error message for unexpected errors should be specific.")
    }
    
    // Test API success with an empty list of seasons
    func testLoadSeasons_whenAPIReturnsEmptyList_populatesEmptySeasonsAndSetsNotLoading() async {
        // Arrange
        mockAPIClient.fetchSeasonsToReturn = [] // API returns an empty list
        
        // Act
        await viewModel.loadSeasons()
        
        // Assert
        XCTAssertEqual(mockAPIClient.fetchSeasonsCallCount, 1)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertTrue(viewModel.seasons.isEmpty, "Seasons array should be empty when API returns empty list.")
        XCTAssertNil(viewModel.errorMessage, "errorMessage should be nil when API returns empty list successfully.")
    }

    // Test isLoading state transitions
    func testLoadSeasons_isLoadingStateTransitions() async {
        XCTAssertFalse(viewModel.isLoading, "isLoading should be false initially.")

        let expectation = XCTestExpectation(description: "Load seasons network call finishes")
        
        mockAPIClient.fetchSeasonsToReturn = [Season(year: 2024, champion: Driver(id: 3, name: "Lando Norris", driverRef: "norris"))]
        
        Task {
            await viewModel.loadSeasons()
            expectation.fulfill()
        }
        
        await Task.yield() 

        XCTAssertTrue(viewModel.isLoading, "isLoading should be true after loadSeasons starts and before it completes.")
        
        await fulfillment(of: [expectation], timeout: 2.0)

        XCTAssertFalse(viewModel.isLoading, "isLoading should be false after loading finishes.")
        XCTAssertEqual(mockAPIClient.fetchSeasonsCallCount, 1)
        XCTAssertFalse(viewModel.seasons.isEmpty)
    }
}
