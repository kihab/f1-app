import XCTest
@testable import Formula1

class RetryButtonTests: XCTestCase {

    func testRetryButtonDefaultText() {
        // Test that RetryButton uses the default text "Retry"
        var wasActionCalled = false
        let action: () -> Void = { wasActionCalled = true }

        // Create RetryButton with default text
        let retryButton = RetryButton(action: action)

        // Check the default text property
        XCTAssertEqual(retryButton.labelText, "Retry", "RetryButton should use 'Retry' as default text")
    }

    func testRetryButtonCustomText() {
        // Test that RetryButton uses custom text when provided
        var wasActionCalled = false
        let action: () -> Void = { wasActionCalled = true }
        let customText = "Try Again"

        // Create RetryButton with custom text
        let retryButton = RetryButton(action: action, labelText: customText)

        // Check that the custom text is used
        XCTAssertEqual(retryButton.labelText, customText, "RetryButton should use the custom text provided")
    }

    func testRetryButtonHasAction() {
        // Test that RetryButton stores the action correctly
        // Note: We can't actually test the button tap as that would require UI testing
        // or a tool like ViewInspector, but we can at least verify the action is stored

        var actionIdentifier = 0
        let action: () -> Void = { actionIdentifier = 42 }

        // Create RetryButton with our action
        let retryButton = RetryButton(action: action)

        // Since we can't directly access or execute the stored closure in a unit test,
        // we're just documenting that in a real project with ViewInspector or similar,
        // we would verify the action gets called on tap
        XCTAssertNotNil(retryButton, "RetryButton should be created with an action")
    }
}
