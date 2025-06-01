# F1 App - iOS High Level System Architecture

```mermaid
graph TD
    %% Client Layer
    subgraph "Client Layer"
        SEASONS_VIEW[SeasonsListView]
        RACES_VIEW[RacesListView]
        SEASON_ROW[SeasonRowView]
        RACE_ROW[RaceRowView]
        LOADING[LoadingView]
        SPLASH[SplashScreenView]
        RETRY[RetryButton]
        ERROR[ErrorToast]
    end

    %% ViewModel Layer
    subgraph "ViewModel Layer"
        SEASONS_VM[SeasonsViewModel]
        RACES_VM[RacesViewModel]
    end

    %% Service Layer
    subgraph "Service Layer"
        API_CLIENT[DefaultAPIClient]
        NETWORK_MONITOR[NetworkMonitor]
    end

    %% Utility Layer
    subgraph "Utility Layer"
        FLAG_MANAGER[FlagManager]
        FONT_MANAGER[FontManager]
        ERROR_RECOVERY[ErrorRecoveryHelper]
        NETWORK_ERROR[NetworkError]
    end

    %% Model Layer
    subgraph "Model Layer"
        SEASON[Season]
        RACE[Race]
        DRIVER[Driver]
    end

    %% Connections
    SEASONS_VIEW -->|Observes| SEASONS_VM
    RACES_VIEW -->|Observes| RACES_VM
    SEASONS_VM -->|Uses| API_CLIENT
    RACES_VM -->|Uses| API_CLIENT
    API_CLIENT -->|Network| NETWORK_MONITOR
    
    SEASONS_VM -->|Uses| ERROR_RECOVERY
    RACES_VM -->|Uses| ERROR_RECOVERY
    
    SEASONS_VM -->|Uses| NETWORK_ERROR
    RACES_VM -->|Uses| NETWORK_ERROR
    
    SEASON_ROW -->|Reuses| LOADING
    RACE_ROW -->|Reuses| LOADING
    SEASONS_VIEW -->|Reuses| LOADING
    RACES_VIEW -->|Reuses| LOADING
    
    SEASON_ROW -->|Reuses| ERROR
    RACE_ROW -->|Reuses| ERROR
    SEASONS_VIEW -->|Reuses| ERROR
    RACES_VIEW -->|Reuses| ERROR
    
    SEASON_ROW -->|Reuses| RETRY
    RACE_ROW -->|Reuses| RETRY
    SEASONS_VIEW -->|Reuses| RETRY
    RACES_VIEW -->|Reuses| RETRY
    
    SEASONS_VIEW -->|Navigates| RACES_VIEW
    
    SEASON -->|Shares| DRIVER
    RACE -->|Shares| DRIVER
    
    %% Styling
    classDef client fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
    classDef vm fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef service fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef utility fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px
    classDef model fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    
    class SEASONS_VIEW,RACES_VIEW,SEASON_ROW,RACE_ROW,LOADING,SPLASH,RETRY,ERROR client
    class SEASONS_VM,RACES_VM vm
    class API_CLIENT,NETWORK_MONITOR service
    class FLAG_MANAGER,FONT_MANAGER,ERROR_RECOVERY,NETWORK_ERROR utility
    class SEASON,RACE,DRIVER model
```

## Components Overview

### 1. Client Layer (UI Components)
- **SeasonsListView**: Main screen displaying list of seasons
- **RacesListView**: Screen showing races for a selected season
- **SeasonRowView**: Reusable component for displaying individual season
- **RaceRowView**: Reusable component for displaying individual race
- **LoadingView**: Reusable loading indicator with shimmer animation
- **SplashScreenView**: App launch screen with F1 branding
- **RetryButton**: Reusable button for retry actions
- **ErrorToast**: Toast-style error notification component

### 2. ViewModel Layer
- **SeasonsViewModel**: Manages seasons data and state
  - Handles API requests for seasons
  - Manages loading and error states
  - Provides data to SeasonsListView

- **RacesViewModel**: Manages races data and state
  - Handles API requests for races
  - Manages loading and error states
  - Provides data to RacesListView

### 3. Service Layer
- **DefaultAPIClient**: Handles network requests
  - Implements API protocol
  - Uses URLSession for network requests
  - Handles error mapping and response parsing

- **NetworkMonitor**: Monitors network connectivity
  - Provides real-time network status updates
  - Used by ViewModels for offline handling

### 4. Utility Layer
- **FlagManager**: Converts country codes to flag emojis
- **FontManager**: Centralizes font styling
- **ErrorRecoveryHelper**: Provides user-friendly error recovery options
- **NetworkError**: Custom error types for network operations

### 5. Model Layer
- **Season**: Data model for seasons
  - Year
  - Champion driver
  - Race count

- **Race**: Data model for races
  - Round number
  - Name
  - Date
  - Location
  - Winner driver

- **Driver**: Shared model for drivers
  - ID
  - Name
  - Nationality
  - DriverRef

## Key Features

### 1. MVVM Architecture
- **Separation of Concerns**:
  - Views handle UI presentation only
  - ViewModels manage business logic and state
  - Models represent pure data
  - Services handle data fetching

- **State Management**:
  - ViewModels expose @Published properties
  - Views observe ViewModel state changes
  - State updates trigger UI refresh

### 2. Component Reusability
- **Reusable UI Components**:
  - Loading indicators
  - Error handling
  - Retry mechanisms
  - Flag display

- **Shared Models**:
  - Driver model shared between seasons and races
  - Consistent data structures
  - Single source of truth

### 3. Error Handling
- **Comprehensive Error System**:
  - Network error handling
  - Offline mode support
  - User-friendly error messages
  - Retry mechanisms

### 4. Navigation
- **Clean Navigation Flow**:
  - Seasons list → Races list
  - Shared navigation stack
  - State preserved across screens

This architecture diagram shows how the iOS app is structured using MVVM pattern, with clear separation of concerns between UI components, business logic, data services, and models. The flow demonstrates how data moves through the system while maintaining a clean separation between presentation and logic layers.
