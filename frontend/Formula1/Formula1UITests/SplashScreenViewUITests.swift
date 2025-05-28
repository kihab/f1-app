import XCTest

final class SplashScreenViewUITests: XCTestCase {
    var app: XCUIApplication!
    
    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }
    
    override func tearDownWithError() throws {
        app = nil
    }
    
    func testSplashScreenLoads() throws {
        // Verify the app exists (most basic test possible)
        XCTAssertTrue(app.exists, "App should exist after launch")
        
        // Take a screenshot for visual verification
        let screenshot = XCTAttachment(screenshot: app.screenshot())
        screenshot.name = "SplashScreen"
        screenshot.lifetime = .keepAlways
        add(screenshot)
    }
}
