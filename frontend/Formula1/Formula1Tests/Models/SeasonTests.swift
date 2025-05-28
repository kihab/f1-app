//
//  SeasonTests.swift
//  Formula1Tests
//
//  Created for Formula1Tests
//

import XCTest
@testable import Formula1

class SeasonTests: XCTestCase {

    // MARK: - Initialization Tests

    func testSeasonInitialization() {
        // Arrange
        let year = 2023
        let champion = Driver(id: 1, name: "Max Verstappen", driverRef: "verstappen", nationality: "Dutch")

        // Act
        let season = Season(year: year, champion: champion)

        // Assert
        XCTAssertEqual(season.year, year)
        XCTAssertEqual(season.champion.id, champion.id)
        XCTAssertEqual(season.champion.name, champion.name)
        XCTAssertEqual(season.champion.driverRef, champion.driverRef)
        XCTAssertEqual(season.champion.nationality, champion.nationality)
    }

    // MARK: - Identifiable Conformance Tests

    func testIdentifiableConformance() {
        // Arrange
        let year = 2022
        let season = Season(
            year: year,
            champion: Driver(id: 1, name: "Max Verstappen", driverRef: "verstappen", nationality: "Dutch")
        )

        // Act & Assert
        XCTAssertEqual(season.id, year, "id should be equal to the year")
    }

    // MARK: - Edge Cases

    func testHistoricalSeason() {
        // Test with an early F1 season
        // Arrange
        let year = 1950
        let champion = Driver(id: 24, name: "Juan Manuel Fangio", driverRef: "fangio", nationality: "Argentine")

        // Act
        let season = Season(year: year, champion: champion)

        // Assert
        XCTAssertEqual(season.year, year)
        XCTAssertEqual(season.champion.name, "Juan Manuel Fangio")
    }

    func testFutureSeason() {
        // Test with a future season
        // Arrange
        let year = 2030
        let champion = Driver(id: 33, name: "Future Champion", driverRef: "future", nationality: "International")

        // Act
        let season = Season(year: year, champion: champion)

        // Assert
        XCTAssertEqual(season.year, year)
        XCTAssertEqual(season.champion.name, "Future Champion")
    }
}
