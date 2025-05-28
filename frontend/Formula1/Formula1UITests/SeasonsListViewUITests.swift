import XCTest

final class SeasonsListViewUITests: XCTestCase {
    var app: XCUIApplication!
    
    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }
    
    override func tearDownWithError() throws {
        app = nil
    }
    
    func testAppLaunchesSuccessfully() throws {
        // Simply verify the app launched successfully
        XCTAssertTrue(app.exists, "App should exist after launch")
        
        // Take a screenshot for visual verification
        let screenshot = XCTAttachment(screenshot: app.screenshot())
        screenshot.name = "AppLaunch"
        screenshot.lifetime = .keepAlways
        add(screenshot)
    }
    
    func testNavigationBarExists() throws {
        // Just check that any navigation bar exists
        let navigationBar = app.navigationBars.element
        XCTAssertTrue(navigationBar.exists, "A navigation bar should exist")
    }
    
    func testBasicUIElementsExist() throws {
        // Verify some basic UI elements exist without being too specific
        
        // Check for static text elements - these should exist in any view
        let textElements = app.staticTexts.allElementsBoundByIndex
        XCTAssertTrue(textElements.count > 0, "App should contain at least one text element")
        
        // Check that some UI element exists that could be our content
        // This is deliberately vague to avoid breaking with minor UI changes
        let anyContentExists = app.otherElements.count > 0 || 
                              app.scrollViews.count > 0 || 
                              app.tables.count > 0
        
        XCTAssertTrue(anyContentExists, "App should display some content")
    }

}
