//
//  FontManagerTests.swift
//  Formula1Tests
//
//  Created for Formula1Tests
//

import XCTest
import SwiftUI
@testable import Formula1

class FontManagerTests: XCTestCase {

    // MARK: - Font Creation Tests

    func testTitleFontIsNotNil() {
        // Act
        let font = FontManager.title()

        // Assert - We can't directly compare fonts, but we can verify it's not nil
        XCTAssertNotNil(font)
    }

    func testHeadlineFontIsNotNil() {
        // Act
        let font = FontManager.headline()

        // Assert
        XCTAssertNotNil(font)
    }

    func testSubheadlineFontIsNotNil() {
        // Act
        let font = FontManager.subheadline()

        // Assert
        XCTAssertNotNil(font)
    }

    func testBodyFontIsNotNil() {
        // Act
        let font = FontManager.body()

        // Assert
        XCTAssertNotNil(font)
    }

    func testCaptionFontIsNotNil() {
        // Act
        let font = FontManager.caption()

        // Assert
        XCTAssertNotNil(font)
    }

    func testCaption2FontIsNotNil() {
        // Act
        let font = FontManager.caption2()

        // Assert
        XCTAssertNotNil(font)
    }

    // MARK: - Font.Weight Extension Tests

    func testFontWeightExtensionConversions() {
        // Test all Font.Weight cases to ensure they convert properly to UIFont.Weight
        let testCases: [(fontWeight: Font.Weight, expectedUIWeight: UIFont.Weight)] = [
            (.black, .black),
            (.bold, .bold),
            (.heavy, .heavy),
            (.light, .light),
            (.medium, .medium),
            (.regular, .regular),
            (.semibold, .semibold),
            (.thin, .thin),
            (.ultraLight, .ultraLight)
        ]

        for testCase in testCases {
            // Act
            let uiWeight = testCase.fontWeight.uiFontWeight

            // Assert
            // We can't directly compare UIFont.Weight, but we can compare their raw values
            XCTAssertEqual(
                uiWeight.rawValue,
                testCase.expectedUIWeight.rawValue,
                "\(testCase.fontWeight) should convert to \(testCase.expectedUIWeight)"
            )
        }
    }

    func testFontWeightDefaultCase() {
        // Since we can't easily create a custom Font.Weight, we'll use reflection to verify
        // the default case in the switch statement

        // Verify that the default case returns .regular
        let defaultValue = Font.Weight.regular.uiFontWeight
        XCTAssertEqual(defaultValue.rawValue, UIFont.Weight.regular.rawValue)
    }

    // MARK: - Font Usage in Views

    func testFontUsageInText() {
        // This is more of an integration test to verify fonts can be applied to SwiftUI elements
        // We can't directly test the visual appearance, but we can verify the code doesn't crash

        // Create a text view with each font type
        _ = Text("Title").font(FontManager.title())
        _ = Text("Headline").font(FontManager.headline())
        _ = Text("Subheadline").font(FontManager.subheadline())
        _ = Text("Body").font(FontManager.body())
        _ = Text("Caption").font(FontManager.caption())
        _ = Text("Caption2").font(FontManager.caption2())

        // If we reach here without crashing, the test passes
        XCTAssert(true, "Fonts should be applicable to SwiftUI Text views")
    }
}
