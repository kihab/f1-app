//
//  MockAPIClient.swift
//  Formula1
//
//  Created by Karim Ihab on 22/05/2025.
//

import Foundation
@testable import Formula1 // Allows access to your app's modules like Season, Race, APIClientProtocol

// Define a simple error enum for testing purposes, if you don't have a generic one.
// If your app already has a NetworkError or similar, you can use that.
enum TestError: Error, LocalizedError {
    case mockError(String)
    var errorDescription: String? {
        switch self {
        case .mockError(let message):
            return message
        }
    }
}

class MockAPIClient: APIClientProtocol {

    // MARK: - fetchSeasons Mocking
    var fetchSeasonsCallCount = 0
    var fetchSeasonsShouldReturnError = false
    var fetchSeasonsToReturn: [Season] = []
    var fetchSeasonsErrorToThrow: Error = TestError.mockError("Failed to fetch seasons")

    func fetchSeasons() async throws -> [Season] {
        fetchSeasonsCallCount += 1
        if fetchSeasonsShouldReturnError {
            throw fetchSeasonsErrorToThrow
        }
        return fetchSeasonsToReturn
    }

    // MARK: - fetchRaces Mocking
    var fetchRacesCallCount = 0
    var fetchRacesYearArgument: Int?
    var fetchRacesShouldReturnError = false
    var fetchRacesToReturn: [Race] = []
    var fetchRacesErrorToThrow: Error = TestError.mockError("Failed to fetch races")

    func fetchRaces(year: Int) async throws -> [Race] {
        fetchRacesCallCount += 1
        fetchRacesYearArgument = year
        if fetchRacesShouldReturnError {
            throw fetchRacesErrorToThrow
        }
        return fetchRacesToReturn
    }

    // MARK: - Helper to reset state
    // Call this in your test's setUp() or tearDown() if needed
    func resetMockState() {
        fetchSeasonsCallCount = 0
        fetchSeasonsShouldReturnError = false
        fetchSeasonsToReturn = []
        fetchSeasonsErrorToThrow = TestError.mockError("Failed to fetch seasons")

        fetchRacesCallCount = 0
        fetchRacesYearArgument = nil
        fetchRacesShouldReturnError = false
        fetchRacesToReturn = []
        fetchRacesErrorToThrow = TestError.mockError("Failed to fetch races")
    }
}
