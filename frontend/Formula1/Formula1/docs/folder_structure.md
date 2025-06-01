# Formula 1 App - Folder Structure

## Overview

The Formula 1 App follows MVVM architecture with clear separation of concerns. This document outlines the folder structure and key file responsibilities.

## Root Structure

```
Formula1/
├── Assets.xcassets/         # App icons and color assets
├── Formula1App.swift        # App entry point and DI setup
├── Models/                  # Data models and DTOs
├── Preview Content/         # SwiftUI preview assets
├── Protocols/               # Protocol definitions
├── Services/                # API and network services
├── Utils/                   # Utility helpers and extensions
├── ViewModels/              # View logic and state management
├── Views/                   # UI components and screens
└── docs/                    # Documentation
```

## Key Folders and Files

### Models/

Contains data structures that represent domain entities and their DTOs:

- `Driver.swift`: Driver model with ID, name, and reference
- `DriverDTO.swift`: Data Transfer Object for Driver model
- `Race.swift`: Race model with round, name, date, and circuit info
- `RaceDTO.swift`: Data Transfer Object for Race model
- `Season.swift`: Season model with year and champion info
- `SeasonDTO.swift`: Data Transfer Object for Season model
- `APIResponse.swift`: Generic response wrapper for API responses

### Protocols/

Protocol definitions for dependency injection and abstraction:

- `APIClientProtocol.swift`: Defines the interface for API clients
- `URLSessionProtocol.swift`: Protocol for URLSession to enable testing

### Services/

Network and data services:

- `APIClient.swift`: Implementation of APIClientProtocol for making API requests
- `APIClientProtocol.swift`: Protocol definition for API client

### Utils/

Reusable utility functions and helpers:

- `Constants.swift`: Central repository for app-wide constants (UI, network, etc.)
- `ErrorRecoveryHelper.swift`: Provides user-friendly recovery suggestions for different error types
- `FlagManager.swift`: Converts country/nationality strings to flag emojis
- `FontManager.swift`: Centralizes font styling across the app
- `Localizable.swift`: Structured string management for localization
- `NetworkError.swift`: Custom error types for network operations
- `NetworkMonitor.swift`: Monitors device network connectivity status

### ViewModels/

Manages business logic and state for views:

- `RacesViewModel.swift`: Handles races list state and API requests
- `SeasonsViewModel.swift`: Manages seasons list state and API requests

### Views/

UI components structured by screen:

- `LoadingView.swift`: Reusable loading component
- `RaceRowView.swift`: Individual race row in list
- `RacesListView.swift`: Screen showing races for a selected season
- `SeasonRowView.swift`: Individual season row in list
- `SeasonsListView.swift`: Main screen showing all seasons
- `SplashScreenView.swift`: App launch screen

#### Components/

Reusable UI components:
- `ErrorToast.swift`: Toast-style error notification component
- `RetryButton.swift`: Reusable button for retry actions

### docs/

Project documentation:

- `folder_structure.md`: This document (folder structure and file responsibilities)
- Additional documentation files as needed
