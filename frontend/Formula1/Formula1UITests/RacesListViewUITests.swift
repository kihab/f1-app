import XCTest

final class RacesListViewUITests: XCTestCase {
    var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }

    override func tearDownWithError() throws {
        app = nil
    }

    func testAppHasNavigationBar() throws {
        // Verify some navigation element exists
        let navigationBar = app.navigationBars.element
        XCTAssertTrue(navigationBar.exists, "A navigation bar should exist")

        // Take a screenshot for visual verification
        let screenshot = XCTAttachment(screenshot: app.screenshot())
        screenshot.name = "RacesView"
        screenshot.lifetime = .keepAlways
        add(screenshot)
    }

    func testUIContainsTextElements() throws {
        // Check for text elements - any view should have some text
        let textElements = app.staticTexts.allElementsBoundByIndex
        XCTAssertTrue(textElements.count > 0, "App should contain at least one text element")
    }
}
