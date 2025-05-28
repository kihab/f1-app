//
// LocalizableTests.swift
// Formula1Tests
//
// Unit tests for the Localizable utility

import XCTest
@testable import Formula1

final class LocalizableTests: XCTestCase {
    
    // MARK: - Home Strings Tests
    
    func testHomeStrings() {
        // Verify all Home enum string constants have expected values
        XCTAssertEqual(Localizable.Home.title, "Formula 1 Seasons")
        XCTAssertEqual(Localizable.Home.noSeasonsAvailable, "No seasons data available. Try refreshing.")
        XCTAssertEqual(Localizable.Home.seasonPrefix, "Season: ")
        XCTAssertEqual(Localizable.Home.championPrefix, "Champion: ")
        XCTAssertEqual(Localizable.Home.nationalityPrefix, "Nationality: ")
    }
    
    // MARK: - Races Strings Tests
    
    func testRacesStrings() {
        // Verify all Races enum string constants have expected values
        XCTAssertEqual(Localizable.Races.noRacesAvailable, "No races available for that year.")
        XCTAssertEqual(Localizable.Races.roundPrefix, "Round ")
        XCTAssertEqual(Localizable.Races.countryPrefix, "Country: ")
        XCTAssertEqual(Localizable.Races.datePrefix, "Date: ")
        XCTAssertEqual(Localizable.Races.winnerPrefix, "Winner: ")
        XCTAssertEqual(Localizable.Races.wikipediaLinkText, "Wikipedia Page")
    }
    
    // MARK: - Loading Strings Tests
    
    func testLoadingStrings() {
        // Verify all Loading enum string constants have expected values
        XCTAssertEqual(Localizable.Loading.generic, "Loading data...")
        XCTAssertEqual(Localizable.Loading.seasons, "Warming up engines...\nLoading Formula 1 seasons")
        XCTAssertEqual(Localizable.Loading.races, "Preparing race data...\nLoading races")
        
        // Test the closure-based string generator with a sample year
        let year = "2023"
        XCTAssertEqual(Localizable.Loading.racesWithYear(year), "Preparing race data...\nLoading races from 2023")
    }
    
    // MARK: - Error Strings Tests
    
    func testErrorStrings() {
        // Verify all Errors enum string constants have expected values
        XCTAssertEqual(Localizable.Errors.networkError, "Network error. Please check your connection.")
        XCTAssertEqual(Localizable.Errors.dataError, "Could not load data. Please try again.")
        XCTAssertEqual(Localizable.Errors.unexpectedError, "An unexpected error occurred.")
    }
    
    // MARK: - String Localization Helper Tests
    
    func testStringForKey() {
        // Test the string(for:) helper method returns the key as-is
        let testKey = "test.localization.key"
        XCTAssertEqual(Localizable.string(for: testKey), testKey)
        
        // Test with an empty string
        let emptyKey = ""
        XCTAssertEqual(Localizable.string(for: emptyKey), emptyKey)
        
        // Test with a string containing special characters
        let specialKey = "special!@#$%^&*()"
        XCTAssertEqual(Localizable.string(for: specialKey), specialKey)
    }
}
