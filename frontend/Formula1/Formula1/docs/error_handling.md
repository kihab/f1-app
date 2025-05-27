# Formula 1 App - Error Handling Strategy

## Overview

The Formula 1 App implements a comprehensive error handling strategy focused on providing clear user feedback while preserving context and offering recovery paths. This document outlines our approach to error handling, the components involved, and implementation details.

## Core Philosophy

Our error handling is built around these key principles:

1. **User-Centered**: Errors are communicated in user-friendly language with actionable suggestions
2. **Context-Aware**: Each error type provides specific guidance based on its context
3. **Recovery-Focused**: Users are always provided with a path to recover from errors
4. **Minimally Intrusive**: Error UI is compact and doesn't overwhelm the interface
5. **Persistence-Appropriate**: Critical errors persist until resolved, minor errors auto-dismiss

## Key Components

### 1. Network Error Types

The `NetworkError` enum defines specific error cases to provide granular error context:

```swift
enum NetworkError: Error, LocalizedError, Equatable {
    case invalidURL
    case requestFailed(Error)
    case invalidResponse
    case httpError(statusCode: Int)
    case decodingError(Error)
    case noData
    case offline            // No internet connection
    case emptyData          // Data is empty but request succeeded
    case serverMaintenance  // Server is under maintenance
    case rateLimited        // Too many requests, rate limited
}
```

Each error type provides a localized description through the `errorDescription` property.

### 2. Error Recovery Helper

The `ErrorRecoveryHelper` class provides recovery suggestions and action labels tailored to each error type:

```swift
class ErrorRecoveryHelper {
    static func suggestion(for error: NetworkError) -> String? {
        // Returns a user-facing suggestion for the error
    }
    
    static func buttonLabel(for error: NetworkError) -> String {
        // Returns context-appropriate button text
    }
}
```

### 3. Error Toast Component

The `ErrorToast` view displays errors in a minimally intrusive format:

- Appears at the bottom of the screen
- Shows concise error message with recovery suggestion
- Includes a context-appropriate action button
- Critical errors persist until resolved
- Non-critical errors auto-dismiss after a timeout

```swift
struct ErrorToast: View {
    let message: String
    var suggestion: String? = nil
    var retryAction: (() -> Void)? = nil
    var buttonText: String = "Retry"
    var isCritical: Bool = true
    // ...
}
```

Extension to apply the toast to any view:

```swift
extension View {
    func errorToast(error: NetworkError?, errorMessage: String?, retryAction: (() -> Void)? = nil) -> some View
}
```

### 4. ViewModel Error Handling

ViewModels maintain error context and provide retry functionality:

```swift
class SeasonsViewModel: ObservableObject {
    @Published var errorMessage: String? = nil
    @Published var lastError: NetworkError? = nil
    
    // Retry functionality
    func retry() async {
        await fetchData()
    }
}
```

## Implementation Details

### Critical vs. Non-Critical Errors

Errors are classified as:

- **Critical** (persistent): Network connectivity issues, server maintenance, rate limiting
- **Non-Critical** (auto-dismiss): Information messages, minor issues

### Network Status Monitoring

The app monitors network connectivity using `NetworkMonitor` to:

1. Detect when the device goes offline
2. Provide appropriate errors when attempting requests without connectivity
3. Notify when connectivity is restored

### Error Presentation

Errors are presented through a toast interface that:

1. Shows the most relevant information (prioritizing suggestions over raw error messages)
2. Provides context-appropriate action buttons
3. Uses appropriate persistence based on error severity

## Usage Example

```swift
// In a SwiftUI view
Struct ContentView: View {
    @StateObject var viewModel: SeasonsViewModel
    
    var body: some View {
        ScrollView {
            // Content here
        }
        .errorToast(
            error: viewModel.lastError,
            errorMessage: viewModel.errorMessage,
            retryAction: {
                Task { await viewModel.retry() }
            }
        )
    }
}
```
