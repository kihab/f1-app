# Formula 1 App - Folder Structure

## Overview

The Formula 1 App follows MVVM architecture with clear separation of concerns. This document outlines the folder structure and key file responsibilities.

## Root Structure

```
Formula1/
├── Assets.xcassets/         # App icons and color assets
├── Formula1App.swift        # App entry point and DI setup
├── Models/                  # Data models
├── Preview Content/         # SwiftUI preview assets
├── Services/                # API and network services
├── Utils/                   # Utility helpers
├── ViewModels/              # View logic and state management
├── Views/                   # UI components
└── docs/                    # Documentation
```

## Key Folders and Files

### Models/

Contains data structures that represent domain entities:

- `Driver.swift`: Driver model with ID, name, and nationality
- `Race.swift`: Race model with round, name, date, country, and winner info
- `Season.swift`: Season model with year and champion driver

### Services/

Network and data services:

- `APIClient.swift`: Interface for API requests
- `NetworkError.swift`: Custom error types for network operations

### Utils/

Reusable utility functions and helpers:

- `FlagManager.swift`: Converts country/nationality strings to flag emojis
- `FontManager.swift`: Centralizes font styling across the app
- `Constants.swift`: Central repository for app-wide constants (UI, network, etc.)
- `Localizable.swift`: Structured string management for future localization support
- `NetworkError.swift`: Custom error types for network operations
- `ErrorRecoveryHelper.swift`: Provides user-friendly recovery suggestions for different error types
- `NetworkMonitor.swift`: Monitors device network connectivity status

### ViewModels/

Manages business logic and state for views:

- `RacesViewModel.swift`: Handles races list state and API requests
- `SeasonsViewModel.swift`: Manages seasons list state and API requests

### Views/

UI components structured by screen:

- `RaceRowView.swift`: Individual race row in list
- `RacesListView.swift`: Screen showing races for a selected season
- `SeasonRowView.swift`: Individual season row in list
- `SeasonsListView.swift`: Main screen showing all seasons
- `LoadingView.swift`: Reusable loading component with shimmer animation
- `SplashScreenView.swift`: App launch screen with F1 logo and shimmer effect

#### Components/

Reusable UI components:

- `RetryButton.swift`: Reusable button for retry actions
- `ErrorToast.swift`: Toast-style error notification component

### docs/

Project documentation:

- `ios_app_structure.md`: Technical architecture overview
- `ui_design_guide.md`: UI standards and visual components
- `folder_structure.md`: This document (folder structure and file responsibilities)
- `error_handling.md`: Error handling strategy and implementation details
