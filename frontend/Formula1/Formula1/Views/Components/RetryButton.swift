// Views/Components/RetryButton.swift
// A reusable button component for retry actions

import SwiftUI

struct RetryButton: View {
    // The action to perform when the button is tapped
    var action: () -> Void
    
    // Optional label text override
    var labelText: String = "Retry"
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Image(systemName: "arrow.clockwise")
                    .font(.system(size: 14, weight: .medium))
                Text(labelText)
                    .font(FontManager.caption())
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(Color.blue)
            .foregroundColor(.white)
            .cornerRadius(8)
        }
    }
}
