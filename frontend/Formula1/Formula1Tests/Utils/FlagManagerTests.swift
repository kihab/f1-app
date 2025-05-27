//
//  FlagManagerTests.swift
//  Formula1Tests
//
//  Created for Formula1Tests
//

import XCTest
@testable import Formula1

class FlagManagerTests: XCTestCase {
    
    // MARK: - Nationality Flag Tests
    
    func testFlagEmojiForKnownNationalities() {
        // Test various nationalities with known mappings
        let testCases: [(nationality: String, expectedFlag: String)] = [
            ("British", "🇬🇧"),
            ("German", "🇩🇪"),
            ("Spanish", "🇪🇸"),
            ("Finnish", "🇫🇮"),
            ("Australian", "🇦🇺"),
            ("Brazilian", "🇧🇷"),
            ("Italian", "🇮🇹"),
            ("French", "🇫🇷"),
            ("Canadian", "🇨🇦"),
            ("Dutch", "🇳🇱"),
            ("American", "🇺🇸"),
            ("Mexican", "🇲🇽"),
            ("Japanese", "🇯🇵")
        ]
        
        for testCase in testCases {
            // Act
            let flag = FlagManager.flagEmoji(for: testCase.nationality)
            
            // Assert
            XCTAssertEqual(flag, testCase.expectedFlag, "Flag for \(testCase.nationality) should be \(testCase.expectedFlag)")
        }
    }
    
    func testFlagEmojiForUnknownNationality() {
        // Arrange
        let unknownNationality = "Unknown"
        
        // Act
        let flag = FlagManager.flagEmoji(for: unknownNationality)
        
        // Assert
        XCTAssertEqual(flag, "🏳️", "Should return neutral flag for unknown nationality")
    }
    
    func testFlagEmojiForNilNationality() {
        // Act
        let flag = FlagManager.flagEmoji(for: nil)
        
        // Assert
        XCTAssertEqual(flag, "🏳️", "Should return neutral flag for nil nationality")
    }
    
    // MARK: - Country Flag Tests
    
    func testCountryFlagForKnownCountries() {
        // Test various countries with known mappings
        let testCases: [(country: String, expectedFlag: String)] = [
            ("United Kingdom", "🇬🇧"),
            ("Great Britain", "🇬🇧"),
            ("UK", "🇬🇧"),
            ("Germany", "🇩🇪"),
            ("Spain", "🇪🇸"),
            ("Finland", "🇫🇮"),
            ("Australia", "🇦🇺"),
            ("Brazil", "🇧🇷"),
            ("Italy", "🇮🇹"),
            ("France", "🇫🇷"),
            ("Canada", "🇨🇦"),
            ("Netherlands", "🇳🇱"),
            ("Holland", "🇳🇱"),
            ("Austria", "🇦🇹"),
            ("USA", "🇺🇸"),
            ("United States", "🇺🇸"),
            ("America", "🇺🇸"),
            ("Mexico", "🇲🇽"),
            ("Monaco", "🇲🇨"),
            ("Belgium", "🇧🇪"),
            ("Japan", "🇯🇵")
        ]
        
        for testCase in testCases {
            // Act
            let flag = FlagManager.countryFlag(for: testCase.country)
            
            // Assert
            XCTAssertEqual(flag, testCase.expectedFlag, "Flag for \(testCase.country) should be \(testCase.expectedFlag)")
        }
    }
    
    func testCountryFlagForUnknownCountry() {
        // Arrange
        let unknownCountry = "Unknown Country"
        
        // Act
        let flag = FlagManager.countryFlag(for: unknownCountry)
        
        // Assert
        XCTAssertEqual(flag, "🏳️", "Should return neutral flag for unknown country")
    }
    
    func testCountryFlagForNilCountry() {
        // Act
        let flag = FlagManager.countryFlag(for: nil)
        
        // Assert
        XCTAssertEqual(flag, "🏳️", "Should return neutral flag for nil country")
    }
    
    // MARK: - Edge Cases
    
    func testCaseSensitivity() {
        // Arrange - Different case variations of "British"
        let variations = ["british", "BRITISH", "British", "BrItIsH"]
        
        // Act & Assert
        for variation in variations {
            let flag = FlagManager.flagEmoji(for: variation)
            if variation == "British" {
                XCTAssertEqual(flag, "🇬🇧", "Flag for exact match 'British' should be the UK flag")
            } else {
                XCTAssertEqual(flag, "🏳️", "FlagManager should be case-sensitive. \(variation) is not an exact match for 'British'")
            }
        }
    }
}
