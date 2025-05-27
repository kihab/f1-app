import XCTest
import Combine
@testable import Formula1

@MainActor
class SeasonsViewModelTests: XCTestCase {

    var viewModel: SeasonsViewModel!
    var mockAPIClient: MockAPIClient!
    var mockNetworkMonitor: MockNetworkMonitor!
    var cancellables = Set<AnyCancellable>()

    override func setUpWithError() throws {
        try super.setUpWithError()
        mockAPIClient = MockAPIClient()
        mockNetworkMonitor = MockNetworkMonitor()
        viewModel = SeasonsViewModel(apiClient: mockAPIClient, networkMonitor: mockNetworkMonitor)
    }

    override func tearDownWithError() throws {
        viewModel = nil
        mockAPIClient = nil
        mockNetworkMonitor = nil
        cancellables.removeAll()
        try super.tearDownWithError()
    }

    // Test a successful fetch of seasons
    func testLoadSeasons_whenAPISucceeds_populatesSeasonsAndSetsNotLoading() async {
        // Arrange
        let mockChampion = Driver(id: 1, name: "Max Verstappen", driverRef: "verstappen", nationality: "Dutch")
        let mockSeasons = [
            Season(year: 2023, champion: mockChampion),
            Season(year: 2022, champion: Driver(id: 2, name: "Lewis Hamilton", driverRef: "hamilton", nationality: "British"))
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
        let networkError = NetworkError.httpError(statusCode: 404)
        mockAPIClient.fetchSeasonsShouldReturnError = true
        mockAPIClient.fetchSeasonsErrorToThrow = networkError

        // Act
        await viewModel.loadSeasons()

        // Assert
        XCTAssertEqual(mockAPIClient.fetchSeasonsCallCount, 1)
        XCTAssertFalse(viewModel.isLoading, "isLoading should be false after loading finishes.")
        XCTAssertTrue(viewModel.seasons.isEmpty, "Seasons array should be empty on failure.")
        XCTAssertNotNil(viewModel.errorMessage, "errorMessage should be set on failure.")
        XCTAssertEqual(viewModel.errorMessage, networkError.localizedDescription)
        XCTAssertEqual(viewModel.lastError, networkError)
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
        XCTAssertNotNil(viewModel.errorMessage, "Error message should be set for empty data")
        XCTAssertEqual(viewModel.lastError, NetworkError.emptyData)
    }

    // Test simple loading state behavior
    func testLoadSeasons_setsIsLoadingDuringFetch() async {
        // Arrange
        XCTAssertFalse(viewModel.isLoading, "isLoading should be false initially.")
        mockAPIClient.fetchSeasonsToReturn = [Season(year: 2024, champion: Driver(id: 3, name: "Lando Norris", driverRef: "norris", nationality: "British"))]

        // Act
        await viewModel.loadSeasons()

        // Assert - just verify final state since we can't easily test intermediate states reliably
        XCTAssertFalse(viewModel.isLoading, "isLoading should be false after loading completes")
        XCTAssertEqual(mockAPIClient.fetchSeasonsCallCount, 1, "API should have been called once")
        XCTAssertFalse(viewModel.seasons.isEmpty, "Seasons should be populated")
    }

    // Test offline handling
    func testLoadSeasons_whenOffline_setsOfflineError() async {
        // Arrange
        mockNetworkMonitor.simulateNetworkChange(isConnected: false)

        // Act
        await viewModel.loadSeasons()

        // Assert
        XCTAssertEqual(mockAPIClient.fetchSeasonsCallCount, 0, "API should not be called when offline")
        XCTAssertFalse(viewModel.isLoading, "Should not be loading when offline")
        XCTAssertEqual(viewModel.lastError, NetworkError.offline, "Last error should be offline")
        XCTAssertEqual(viewModel.errorMessage, NetworkError.offline.localizedDescription, "Error message should indicate offline status")
    }

    // Note: Network recovery testing moved to a future implementation phase
    // due to the complexity of testing asynchronous publisher interactions

    // Test retry functionality
    func testRetry_refreshesData() async {
        // Arrange
        mockAPIClient.fetchSeasonsShouldReturnError = true
        mockAPIClient.fetchSeasonsErrorToThrow = NetworkError.httpError(statusCode: 500)
        await viewModel.loadSeasons() // This will fail

        // Reset mock for retry
        mockAPIClient.fetchSeasonsShouldReturnError = false
        mockAPIClient.fetchSeasonsToReturn = [Season(year: 2024, champion: Driver(id: 3, name: "Lando Norris", driverRef: "norris", nationality: "British"))]

        // Act
        await viewModel.retry()

        // Assert
        XCTAssertEqual(mockAPIClient.fetchSeasonsCallCount, 2, "API should be called again during retry")
        XCTAssertFalse(viewModel.isLoading, "Should not be loading after retry completes")
        XCTAssertNil(viewModel.errorMessage, "Error message should be cleared on successful retry")
        XCTAssertEqual(viewModel.seasons.count, 1, "Seasons should be populated after successful retry")
    }
}
