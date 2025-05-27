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

### 1. Seasons List Screen

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

### 2. Races List Screen

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

- Progress spinner with "Loading..." text when fetching data

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
