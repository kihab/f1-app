//
//  RaceTests.swift
//  Formula1Tests
//
//  Created for Formula1Tests
//

import XCTest
@testable import Formula1

class RaceTests: XCTestCase {
    
    // MARK: - Initialization Tests
    
    func testRaceInitialization() {
        // Arrange
        let round = 1
        let name = "Australian Grand Prix"
        let url = "https://en.wikipedia.org/wiki/Australian_Grand_Prix"
        let date = "2023-03-05"
        let country = "Australia"
        let isChampion = true
        let winner = Driver(id: 1, name: "Max Verstappen", driverRef: "verstappen", nationality: "Dutch")
        
        // Act
        let race = Race(
            round: round,
            name: name,
            url: url,
            date: date,
            country: country,
            isChampion: isChampion,
            winner: winner
        )
        
        // Assert
        XCTAssertEqual(race.round, round)
        XCTAssertEqual(race.name, name)
        XCTAssertEqual(race.url, url)
        XCTAssertEqual(race.date, date)
        XCTAssertEqual(race.country, country)
        XCTAssertEqual(race.isChampion, isChampion)
        XCTAssertEqual(race.winner.id, winner.id)
        XCTAssertEqual(race.winner.name, winner.name)
        XCTAssertEqual(race.winner.driverRef, winner.driverRef)
        XCTAssertEqual(race.winner.nationality, winner.nationality)
    }
    
    func testRaceInitializationWithOptionalProperties() {
        // Arrange
        let round = 1
        let name = "Australian Grand Prix"
        let isChampion = true
        let winner = Driver(id: 1, name: "Max Verstappen", driverRef: "verstappen", nationality: "Dutch")
        
        // Act
        let race = Race(
            round: round,
            name: name,
            url: nil,
            date: nil,
            country: nil,
            isChampion: isChampion,
            winner: winner
        )
        
        // Assert
        XCTAssertEqual(race.round, round)
        XCTAssertEqual(race.name, name)
        XCTAssertNil(race.url)
        XCTAssertNil(race.date)
        XCTAssertNil(race.country)
        XCTAssertEqual(race.isChampion, isChampion)
    }
    
    // MARK: - Identifiable Conformance Tests
    
    func testIdentifiableConformance() {
        // Arrange
        let round = 3
        let race = Race(
            round: round,
            name: "Australian Grand Prix",
            url: nil,
            date: nil,
            country: nil,
            isChampion: false,
            winner: Driver(id: 1, name: "Max Verstappen", driverRef: "verstappen", nationality: "Dutch")
        )
        
        // Act & Assert
        XCTAssertEqual(race.id, round, "id should be equal to the round number")
    }
}
