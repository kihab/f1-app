//
//  DriverTests.swift
//  Formula1Tests
//
//  Created for Formula1Tests
//

import XCTest
@testable import Formula1

class DriverTests: XCTestCase {

    // MARK: - Initialization Tests

    func testDriverInitialization() {
        // Arrange
        let id = 44
        let name = "Lewis Hamilton"
        let driverRef = "hamilton"
        let nationality = "British"

        // Act
        let driver = Driver(id: id, name: name, driverRef: driverRef, nationality: nationality)

        // Assert
        XCTAssertEqual(driver.id, id)
        XCTAssertEqual(driver.name, name)
        XCTAssertEqual(driver.driverRef, driverRef)
        XCTAssertEqual(driver.nationality, nationality)
    }

    func testDriverInitializationWithOptionalNationality() {
        // Arrange
        let id = 44
        let name = "Lewis Hamilton"
        let driverRef = "hamilton"

        // Act
        let driver = Driver(id: id, name: name, driverRef: driverRef, nationality: nil)

        // Assert
        XCTAssertEqual(driver.id, id)
        XCTAssertEqual(driver.name, name)
        XCTAssertEqual(driver.driverRef, driverRef)
        XCTAssertNil(driver.nationality)
    }

    // MARK: - Identifiable Conformance Test

    func testDriverIdentifiableConformance() {
        // Arrange
        let id = 33
        let driver = Driver(id: id, name: "Max Verstappen", driverRef: "verstappen", nationality: "Dutch")

        // Act & Assert
        XCTAssertEqual(driver.id, id, "Driver's id property should match the id used in initialization")
    }

    // MARK: - Edge Cases

    func testDriverWithSpecialCharactersInName() {
        // Arrange & Act
        let driver = Driver(id: 99, name: "António Félix da Costa", driverRef: "dacosta", nationality: "Portuguese")

        // Assert
        XCTAssertEqual(driver.name, "António Félix da Costa", "Name with special characters should be preserved")
    }

    func testDriverWithLongDriverRef() {
        // Arrange
        let veryLongDriverRef = String(repeating: "a", count: 100)

        // Act
        let driver = Driver(id: 100, name: "Test Driver", driverRef: veryLongDriverRef, nationality: "Test")

        // Assert
        XCTAssertEqual(driver.driverRef, veryLongDriverRef, "Long driverRef should be preserved")
    }
}
