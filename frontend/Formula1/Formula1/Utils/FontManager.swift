// Utils/FontManager.swift
// Centralizes font styling across the application

import SwiftUI

/// Provides consistent font styling throughout the application
struct FontManager {
    // MARK: - Custom Font Constants
    private static let customFontName = "SF Pro Medium"

    // MARK: - Font Creation Helper
    /// Tries to use SF Pro Medium if available, otherwise falls back to system font
    private static func createFont(size: CGFloat, weight: Font.Weight = .regular) -> Font {
        // Try to use the custom font first
        if let _ = UIFont(name: customFontName, size: size) {
            return Font.custom(customFontName, size: size)
        }

        // Fall back to system font if custom font is not available
        let systemFont = UIFont.systemFont(ofSize: size, weight: weight.uiFontWeight)
        return Font(systemFont)
    }

    // MARK: - Title Fonts
    static func title() -> Font {
        return createFont(size: UIFont.preferredFont(forTextStyle: .title1).pointSize, weight: .medium)
    }

    // MARK: - Headline Fonts
    static func headline() -> Font {
        return createFont(size: UIFont.preferredFont(forTextStyle: .headline).pointSize, weight: .medium)
    }

    // MARK: - Subheadline Fonts
    static func subheadline() -> Font {
        return createFont(size: UIFont.preferredFont(forTextStyle: .subheadline).pointSize, weight: .regular)
    }

    // MARK: - Body Fonts
    static func body() -> Font {
        return createFont(size: UIFont.preferredFont(forTextStyle: .body).pointSize, weight: .regular)
    }

    // MARK: - Caption Fonts
    static func caption() -> Font {
        return createFont(size: UIFont.preferredFont(forTextStyle: .caption1).pointSize, weight: .regular)
    }

    // MARK: - Caption2 Fonts (smaller caption)
    static func caption2() -> Font {
        return createFont(size: UIFont.preferredFont(forTextStyle: .caption2).pointSize, weight: .regular)
    }
}

// Extension to convert SwiftUI Font.Weight to UIKit UIFont.Weight
extension Font.Weight {
    var uiFontWeight: UIFont.Weight {
        switch self {
        case .black: return .black
        case .bold: return .bold
        case .heavy: return .heavy
        case .light: return .light
        case .medium: return .medium
        case .regular: return .regular
        case .semibold: return .semibold
        case .thin: return .thin
        case .ultraLight: return .ultraLight
        default: return .regular
        }
    }
}
