// Utils/FontManager.swift
// Centralizes font styling across the application

import SwiftUI

/// Provides consistent font styling throughout the application
struct FontManager {
    // MARK: - Title Fonts
    static func title() -> Font {
        return Font.system(.title, design: .default).weight(.medium)
    }
    
    // MARK: - Headline Fonts
    static func headline() -> Font {
        return Font.system(.headline, design: .default).weight(.medium)
    }
    
    // MARK: - Subheadline Fonts
    static func subheadline() -> Font {
        return Font.system(.subheadline, design: .default).weight(.regular)
    }
    
    // MARK: - Body Fonts
    static func body() -> Font {
        return Font.system(.body, design: .default).weight(.regular)
    }
    
    // MARK: - Caption Fonts
    static func caption() -> Font {
        return Font.system(.caption, design: .default).weight(.regular)
    }
    
    // MARK: - Caption2 Fonts (smaller caption)
    static func caption2() -> Font {
        return Font.system(.caption2, design: .default).weight(.regular)
    }
}
