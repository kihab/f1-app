// Utils/Constants.swift
// Central location for app-wide constants

import Foundation
import SwiftUI

/// App-wide constants grouped by category
struct Constants {

    /// Asset names used throughout the app
    enum Assets {
        static let f1Logo = "f1logo"
    }

    /// UI-related constants
    enum Colors {
        static let backgroundColor = Color(red: 0.97, green: 0.97, blue: 0.97)
        static let championAccentColor = Color.orange
    }

    enum Spacing {
        static let standard: CGFloat = 16.0
        static let small: CGFloat = 8.0
        static let medium: CGFloat = 12.0
        static let large: CGFloat = 20.0
    }

    enum Size {
        static let accentBarWidth: CGFloat = 4.0
        static let standardCornerRadius: CGFloat = 8.0
    }

    /// Network-related constants
    enum Network {
        static let baseURL = "http://localhost:3000/api"
        static let seasonsEndpoint = "/seasons"
        static let racesEndpointPrefix = "/races/"
    }

    /// Accessibility identifiers for testing
    enum AccessibilityID {
        static let seasonsListView = "seasonsListView"
        static let racesListView = "racesListView"
        static let loadingView = "loadingView"
    }
}
