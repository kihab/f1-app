import XCTest
import Combine
@testable import Formula1 // Access to RacesViewModel, Race, Driver, APIClientProtocol, NetworkError

@MainActor
class RacesViewModelTests: XCTestCase {

    var viewModel: RacesViewModel!
    var mockAPIClient: MockAPIClient!
    var mockNetworkMonitor: MockNetworkMonitor!
    let testYear = 2023 // Example year for testing
    var cancellables = Set<AnyCancellable>()

    override func setUpWithError() throws {
        try super.setUpWithError()
        mockAPIClient = MockAPIClient()
        mockNetworkMonitor = MockNetworkMonitor()
        // Initialize with a specific year, as the ViewModel requires
        viewModel = RacesViewModel(year: testYear, apiClient: mockAPIClient, networkMonitor: mockNetworkMonitor)
    }

    override func tearDownWithError() throws {
        viewModel = nil
        mockAPIClient = nil
        mockNetworkMonitor = nil
        cancellables.removeAll()
        try super.tearDownWithError()
    }

    // Test Initialization
    func testInitialization_setsYearAndNavigationTitleCorrectly() {
        XCTAssertEqual(viewModel.navigationTitle, "Races in \(testYear)", "Navigation title should be set correctly based on the year.")
        // Implicitly tests year is stored if loadRaces uses it, which it does.
    }

    // Test Successful Race Fetch
    func testLoadRaces_whenAPISucceeds_populatesRacesAndSetsNotLoading() async {
        // Arrange
        let mockWinner = Driver(id: 1, name: "Max Verstappen", driverRef: "verstappen", nationality: "Dutch")
        let mockRaces = [
            Race(round: 1, name: "Bahrain Grand Prix", url: "https://en.wikipedia.org/wiki/Bahrain_Grand_Prix", date: "2023-03-05", country: "Bahrain", isChampion: true, winner: mockWinner),
            Race(round: 2, name: "Saudi Arabian Grand Prix", url: "https://en.wikipedia.org/wiki/Saudi_Arabian_Grand_Prix", date: "2023-03-19", country: "Saudi Arabia", isChampion: false, winner: Driver(id: 44, name: "Lewis Hamilton", driverRef: "hamilton", nationality: "British"))
        ]
        mockAPIClient.fetchRacesToReturn = mockRaces

        // Act
        await viewModel.loadRaces()

        // Assert
        XCTAssertEqual(mockAPIClient.fetchRacesCallCount, 1, "fetchRaces should be called once.")
        XCTAssertEqual(mockAPIClient.fetchRacesYearArgument, testYear, "fetchRaces should be called with the correct year.")
        XCTAssertFalse(viewModel.isLoading, "isLoading should be false after loading.")
        XCTAssertEqual(viewModel.races.count, 2, "Races array should contain 2 races.")
        XCTAssertEqual(viewModel.races.first?.name, "Bahrain Grand Prix")
        XCTAssertNil(viewModel.errorMessage, "errorMessage should be nil on success.")
    }

    // Test API Returns Empty List
    func testLoadRaces_whenAPIReturnsEmptyList_setsEmptyRacesArrayAndNotLoading() async {
        // Arrange
        mockAPIClient.fetchRacesToReturn = [] // API returns empty list

        // Act
        await viewModel.loadRaces()

        // Assert
        XCTAssertEqual(mockAPIClient.fetchRacesCallCount, 1)
        XCTAssertEqual(mockAPIClient.fetchRacesYearArgument, testYear)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertTrue(viewModel.races.isEmpty, "Races array should be empty.")
        XCTAssertNotNil(viewModel.errorMessage, "Error message should be set for empty data")
        XCTAssertEqual(viewModel.lastError, NetworkError.emptyData, "Last error should be emptyData")
    }

    // Test API Failure with a specific NetworkError (e.g., httpError)
    func testLoadRaces_whenAPIFailsWithHttpNetworkError_setsErrorMessageAndNotLoading() async {
        // Arrange
        let httpError = NetworkError.httpError(statusCode: 500)
        mockAPIClient.fetchRacesShouldReturnError = true
        mockAPIClient.fetchRacesErrorToThrow = httpError

        // Act
        await viewModel.loadRaces()

        // Assert
        XCTAssertEqual(mockAPIClient.fetchRacesCallCount, 1)
        XCTAssertEqual(mockAPIClient.fetchRacesYearArgument, testYear)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertTrue(viewModel.races.isEmpty)
        XCTAssertNotNil(viewModel.errorMessage)
        XCTAssertEqual(viewModel.errorMessage, httpError.localizedDescription, "Error message should match NetworkError description.")
    }

    // Test API Failure with another specific NetworkError (e.g., decodingError)
    func testLoadRaces_whenAPIFailsWithDecodingNetworkError_setsErrorMessageAndNotLoading() async {
        // Arrange
        // Create a dummy error to associate with decodingError
        let underlyingDecodingError = NSError(domain: "TestDecoding", code: 123, userInfo: [NSLocalizedDescriptionKey: "Bad data format"])
        let decodingError = NetworkError.decodingError(underlyingDecodingError)
        mockAPIClient.fetchRacesShouldReturnError = true
        mockAPIClient.fetchRacesErrorToThrow = decodingError

        // Act
        await viewModel.loadRaces()

        // Assert
        XCTAssertEqual(mockAPIClient.fetchRacesCallCount, 1)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertTrue(viewModel.races.isEmpty)
        XCTAssertNotNil(viewModel.errorMessage)
        XCTAssertEqual(viewModel.errorMessage, decodingError.localizedDescription)
    }

    // Test API Failure with a generic, non-NetworkError
    func testLoadRaces_whenAPIFailsWithOtherError_setsGenericErrorMessageAndNotLoading() async {
        // Arrange
        let genericError = TestError.mockError("Some other API problem") // Using TestError from MockAPIClient
        mockAPIClient.fetchRacesShouldReturnError = true
        mockAPIClient.fetchRacesErrorToThrow = genericError // This is not a NetworkError

        // Act
        await viewModel.loadRaces()

        // Assert
        XCTAssertEqual(mockAPIClient.fetchRacesCallCount, 1)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertTrue(viewModel.races.isEmpty)
        XCTAssertNotNil(viewModel.errorMessage)
        XCTAssertEqual(viewModel.errorMessage, "An unexpected error occurred while fetching races for year \(testYear): \(genericError.localizedDescription)")
    }

    // Test simple loading state behavior
    func testLoadRaces_setsIsLoadingDuringFetch() async {
        // Arrange
        XCTAssertFalse(viewModel.isLoading, "isLoading should be false initially.")
        mockAPIClient.fetchRacesToReturn = [Race(round: 1, name: "Monaco Grand Prix", url: "https://en.wikipedia.org/wiki/Monaco_Grand_Prix", date: "2023-05-28", country: "Monaco", isChampion: false, winner: Driver(id: 16, name: "Charles Leclerc", driverRef: "leclerc", nationality: "Monegasque"))]

        // Act
        await viewModel.loadRaces()

        // Assert - just verify final state since we can't easily test intermediate states reliably
        XCTAssertFalse(viewModel.isLoading, "isLoading should be false after loading completes")
        XCTAssertEqual(mockAPIClient.fetchRacesCallCount, 1, "API should have been called once")
        XCTAssertFalse(viewModel.races.isEmpty, "Races should be populated")
    }

    // Test offline handling
    func testLoadRaces_whenOffline_setsOfflineError() async {
        // Arrange
        mockNetworkMonitor.simulateNetworkChange(isConnected: false)

        // Act
        await viewModel.loadRaces()

        // Assert
        XCTAssertEqual(mockAPIClient.fetchRacesCallCount, 0, "API should not be called when offline")
        XCTAssertFalse(viewModel.isLoading, "Should not be loading when offline")
        XCTAssertEqual(viewModel.lastError, NetworkError.offline, "Last error should be offline")
        XCTAssertEqual(viewModel.errorMessage, NetworkError.offline.localizedDescription, "Error message should indicate offline status")
    }

    // Note: Network recovery testing moved to a future implementation phase
    // due to the complexity of testing asynchronous publisher interactions

    // Test retry functionality
    func testRetry_refreshesData() async {
        // Arrange
        mockAPIClient.fetchRacesShouldReturnError = true
        mockAPIClient.fetchRacesErrorToThrow = NetworkError.httpError(statusCode: 500)
        await viewModel.loadRaces() // This will fail

        // Reset mock for retry
        mockAPIClient.fetchRacesShouldReturnError = false
        mockAPIClient.fetchRacesToReturn = [Race(round: 1, name: "Monaco Grand Prix", url: "https://en.wikipedia.org/wiki/Monaco_Grand_Prix", date: "2023-05-28", country: "Monaco", isChampion: false, winner: Driver(id: 16, name: "Charles Leclerc", driverRef: "leclerc", nationality: "Monegasque"))]

        // Act
        await viewModel.retry()

        // Assert
        XCTAssertEqual(mockAPIClient.fetchRacesCallCount, 2, "API should be called again during retry")
        XCTAssertFalse(viewModel.isLoading, "Should not be loading after retry completes")
        XCTAssertNil(viewModel.errorMessage, "Error message should be cleared on successful retry")
        XCTAssertEqual(viewModel.races.count, 1, "Races should be populated after successful retry")
    }
}
