//
//  MockNetworkMonitor.swift
//  Formula1Tests
//
//  Created for Formula1Tests
//

import Foundation
import Combine
@testable import Formula1

/// Mock implementation of NetworkMonitor for testing
class MockNetworkMonitor: NetworkMonitor {
    // Override the initializer to set up our mock implementation
    override init() {
        super.init()
        // Set default connection status
        _isConnected = true
    }
    
    // Override the published property
    override var isConnected: Bool {
        get { _isConnected }
        set {
            // First update the backing value
            _isConnected = newValue
            // Then update the published value to trigger the publisher
            super.isConnected = newValue
        }
    }
    
    // Private backing variable to store the connection state
    private var _isConnected: Bool = true
    
    // Helper for tests to simulate network changes
    func simulateNetworkChange(isConnected: Bool) {
        self.isConnected = isConnected
    }
}
