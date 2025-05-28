# Formula 1 App - Testing Strategy

## Overview

The Formula 1 App implements a comprehensive testing strategy designed to maintain code quality and prevent regressions. Our target is 70%+ code coverage across the codebase, with higher coverage in critical areas like networking and data handling.

## Testing Pyramid

Our testing approach follows the standard testing pyramid:

1. **Unit Tests** (Base layer - most tests)
   - Individual functions and classes in isolation
   - Mock dependencies for controlled testing

2. **Component Tests** (Middle layer)
   - Integration of related components
   - Testing workflows and interaction between components

3. **UI Tests** (Top layer - fewest tests)
   - Basic validation of UI elements
   - Simple app flow verification

## What We Test

### Unit Tests

- **APIClient**: Network requests, error mapping, URL construction
- **ViewModels**: State management, error handling, data processing
- **Components**: RetryButton, SeasonRowView, RaceRowView
- **Error Handling**: Various error scenarios and recovery strategies

### Component Tests

- **ViewModel + APIClient**: Integration between data fetching and state updates
- **ViewModel + NetworkMonitor**: Offline handling and connectivity recovery
- **Retry Mechanisms**: Data refresh after errors

### UI Tests

- **App Launch**: Basic verification app launches successfully
- **Screen Existence**: Verification that key screens render
- **Navigation**: Basic navigation flows

## Testing Tools & Approaches

- **XCTest**: Native testing framework for all test types
- **XCUITest**: UI testing capabilities
- **Protocol-Based Mocking**: Defining protocols for dependencies and creating mock implementations
- **Dependency Injection**: Making components testable by injecting dependencies

## Coverage Exclusions

Some files are excluded from coverage metrics as they don't contain testable logic:

- Generated files
- App/Scene delegates
- SwiftUI previews
- Constants and string localizations

## Test Data Strategy

- **Mock Data**: Inline JSON for network responses
- **Test Fixtures**: Mock models for consistent test data
- **No External Dependencies**: Tests don't rely on external files or services

## Running Tests

Tests can be run using:
- Xcode Test Navigator
- Command line: `xcodebuild test -project Formula1.xcodeproj -scheme Formula1`

## Continuous Improvement

Our testing strategy is continuously evolving. Future improvements include:

- Adding ViewInspector for more comprehensive SwiftUI testing
- Implementing snapshot tests for UI consistency
- Adding performance tests for critical paths
