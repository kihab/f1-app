// Views/Components/ErrorToast.swift
// A reusable toast-style error component that appears at the bottom of the screen

import SwiftUI

struct ErrorToast: View {
    // The error message to display
    let message: String
    
    // Optional suggestion text
    var suggestion: String? = nil
    
    // Action to perform when retry button is tapped
    var retryAction: (() -> Void)? = nil
    
    // Button text
    var buttonText: String = "Retry"
    
    // Whether this is a critical error (persistent) or non-critical (auto-dismissible)
    var isCritical: Bool = true
    
    // Auto-dismiss timeout for non-critical errors (in seconds)
    var autoDismissDelay: Double = 5.0
    
    // For animation and dismiss logic
    @State private var isVisible = false
    @State private var opacity: Double = 0.0
    
    // For auto-dismiss timer
    @State private var dismissTimer: Timer? = nil
    
    var body: some View {
        HStack(spacing: 12) {
            // Simple, compact error message - using the suggestion text only if available
            Text(suggestion ?? message)
                .font(FontManager.caption())
                .foregroundColor(.white)
                .lineLimit(2)
                .fixedSize(horizontal: false, vertical: true)
            
            Spacer()
            
            // Compact retry button for critical errors
            if let retryAction = retryAction {
                Button(action: {
                    retryAction()
                }) {
                    Text(buttonText)
                        .font(FontManager.caption2())
                        .foregroundColor(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(Color.white.opacity(0.2))
                        .cornerRadius(4)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Color(red: 0.95, green: 0.3, blue: 0.3))
        .cornerRadius(4)
        .opacity(opacity)
        .onAppear {
            withAnimation(.easeInOut(duration: 0.3)) {
                opacity = 1.0
            }
            
            // Setup auto-dismiss timer for non-critical errors
            if !isCritical {
                dismissTimer = Timer.scheduledTimer(withTimeInterval: autoDismissDelay, repeats: false) { _ in
                    withAnimation(.easeInOut(duration: 0.3)) {
                        opacity = 0.0
                    }
                }
            }
        }
        .onDisappear {
            dismissTimer?.invalidate()
            dismissTimer = nil
        }
    }
}

struct ErrorToastModifier: ViewModifier {
    // Error object to display
    let error: NetworkError?
    
    // Error message text
    let errorMessage: String?
    
    // Retry action
    let retryAction: (() -> Void)?
    
    func body(content: Content) -> some View {
        ZStack {
            content
            
            if let errorMessage = errorMessage {
                VStack {
                    Spacer()
                    
                    ErrorToast(
                        message: errorMessage,
                        suggestion: error.flatMap { ErrorRecoveryHelper.suggestion(for: $0) },
                        retryAction: retryAction,
                        buttonText: error.map { ErrorRecoveryHelper.buttonLabel(for: $0) } ?? "Retry",
                        isCritical: isCriticalError(error)
                    )
                    .padding(.horizontal, 20)
                    .padding(.bottom, 16)
                }
            }
        }
    }
    
    // Determine if the error is critical (should not auto-dismiss)
    private func isCriticalError(_ error: NetworkError?) -> Bool {
        guard let error = error else { return true }
        
        switch error {
        case .offline, .serverMaintenance, .rateLimited, .requestFailed:
            return true  // Critical errors that should not auto-dismiss
        default:
            return false // Non-critical errors that can auto-dismiss
        }
    }
}

extension View {
    func errorToast(error: NetworkError?, errorMessage: String?, retryAction: (() -> Void)? = nil) -> some View {
        self.modifier(ErrorToastModifier(error: error, errorMessage: errorMessage, retryAction: retryAction))
    }
}
