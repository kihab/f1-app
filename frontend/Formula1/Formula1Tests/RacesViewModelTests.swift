import XCTest
@testable import Formula1 // Access to RacesViewModel, Race, Driver, APIClientProtocol, NetworkError

@MainActor
class RacesViewModelTests: XCTestCase {

    var viewModel: RacesViewModel!
    var mockAPIClient: MockAPIClient!
    let testYear = 2023 // Example year for testing

    override func setUpWithError() throws {
        try super.setUpWithError()
        mockAPIClient = MockAPIClient()
        // Initialize with a specific year, as the ViewModel requires
        viewModel = RacesViewModel(year: testYear, apiClient: mockAPIClient)
    }

    override func tearDownWithError() throws {
        viewModel = nil
        mockAPIClient = nil
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
        let mockWinner = Driver(id: 1, name: "Max Verstappen", driverRef: "verstappen")
        let mockRaces = [
            Race(round: 1, name: "Bahrain Grand Prix", isChampion: true, winner: mockWinner),
            Race(round: 2, name: "Saudi Arabian Grand Prix", isChampion: false, winner: Driver(id: 44, name: "Lewis Hamilton", driverRef: "hamilton"))
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
        XCTAssertNil(viewModel.errorMessage)
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

    //TODO:: 
    // Test isLoading state transitions
//    func testLoadRaces_isLoadingStateTransitions() async {
//        XCTAssertFalse(viewModel.isLoading, "isLoading should be false initially.")
//
//        let expectation = XCTestExpectation(description: "Load races network call finishes")
//        
//        mockAPIClient.fetchRacesToReturn = [Race(round: 1, name: "Monaco Grand Prix", isChampion: false, winner: Driver(id: 16, name: "Charles Leclerc", driverRef: "leclerc"))]
//        
//        Task {
//            await viewModel.loadRaces() // This will set isLoading = true at the start
//            expectation.fulfill()
//        }
//        
//        await Task.yield() // Allow the Task to start and set isLoading
//
//        XCTAssertTrue(viewModel.isLoading, "isLoading should be true after loadRaces starts and before it completes.")
//        
//        await fulfillment(of: [expectation], timeout: 2.0) // Wait for loadRaces to complete
//
//        XCTAssertFalse(viewModel.isLoading, "isLoading should be false after loading finishes.")
//        XCTAssertEqual(mockAPIClient.fetchRacesCallCount, 1)
//        XCTAssertFalse(viewModel.races.isEmpty)
//    }
}
