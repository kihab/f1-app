# Formula 1 App - UI Design Guide

## Overview

The Formula 1 App provides a clean, modern interface for browsing historical Formula 1 data. This document describes the UI elements, screens, and visual indicators used throughout the application.

## Color Scheme

- **Background**: Light off-white (RGB: 0.97, 0.97, 0.97)
- **Content Areas**: White with rounded corners
- **Accents**: 
  - Orange (for champion highlighting)
  - Blue (for links)
- **Text**: Black (primary), Gray (secondary information)

## Typography

The app uses a consistent font system throughout:
- **Primary Font**: SF Pro Medium (falls back to system font if unavailable)
- **Font Sizing**: Hierarchical sizing from headlines to captions
- **Special Formatting**: Bold weight for champion names

## Screens

### 1. Splash Screen

Displayed when the app is first launched.

**Content Elements**:
- F1 logo centered on screen
- Professional shimmer effect that passes across the logo
- Neutral background matching app color scheme

### 2. Seasons List Screen

![Seasons Screen](placeholder_for_seasons_screen.png)

**Content Elements**:
- Navigation title: "Formula 1 Seasons"
- List of seasons with:
  - Season year
  - Champion name with country flag emoji
  - Champion nationality
  - Chevron indicator for navigation

**Visual Indicators**:
- Country flags shown as emojis before champion names
- Custom dividers between rows that don't touch screen edges

### 3. Races List Screen

![Races Screen](placeholder_for_races_screen.png)

**Content Elements**:
- Navigation title: Season year (e.g., "2021")
- List of races with:
  - Race round and name
  - Country with flag emoji
  - Race date
  - Winner name and nationality
  - Wikipedia link

**Visual Indicators for Champions**:
- Orange vertical accent bar on left side of champion race rows
- Trophy emoji (🏆) in top-right corner of champion race rows
- Winner name in bold orange text if they were that season's champion

## Navigation

- Hierarchical navigation from seasons to individual season races
- Tap on any season row to view races from that season
- Wikipedia links open in the device's browser

## UI Elements

### Lists and Rows

- **Lists**: White background with rounded corners and shadow
- **Row Separators**: Gray dividers with horizontal margins (don't touch edges)
- **Row Padding**: Consistent vertical (10pt) and horizontal (16pt) padding

### Loading States

- Custom LoadingView with F1 logo and shimmer effect
- Context-specific loading messages:
  - "Warming up engines..." for seasons screen
  - "Preparing race data..." for races screen
- Shimmer animation provides subtle visual feedback during loading

### Error States

- Red error banner with white text for API or network errors
- Empty state message when no data is available

### Interactive Elements

- **Navigation**: Chevron indicators for row navigation
- **Links**: Blue underlined text for Wikipedia links

## Special Features

### Champion Highlighting

Champion races (where the winner was the season champion) receive special visual treatment:
1. Orange accent bar on the left side of the row
2. Trophy emoji in the top-right corner
3. Winner name shown in bold orange text

This multi-layered approach makes champion races immediately distinguishable.

### Country/Nationality Representation

Flag emojis provide a visual identifier for countries and nationalities, improving scanability and adding visual interest without requiring image assets.

### Internationalization

The app is structured to support multiple languages in the future:
- All user-facing strings are organized in a dedicated localization system
- Context-based organization (Home, Races, Loading, Errors)
- Text messages support parameterization for dynamic content

### Design Constants

The app maintains design consistency through a centralized constants system:
- Standardized spacing values (small: 8pt, standard: 16pt, etc.)
- Consistent corner radius (8pt)
- Defined accent colors and styling metrics
- Centralized asset names
