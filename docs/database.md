## Database & ORM

**Database:**  
- **PostgreSQL** (relational)

**Why:**  
- Structured, relational data with predictable relationships (seasons, races, winners)
- Industry standard, free, and open source
- Tons of guides, easy Docker Compose setup, works with all modern Node.js ORMs
- Powerful for future expansion, complex queries, and data integrity
- Easy to add admin GUI (pgAdmin) if needed

**Alternatives considered:**  
- **MySQL:** Equally solid, slightly less feature-rich, also easy to use and integrate.
- **MongoDB (NoSQL):** Very easy for quick prototyping, but lacks built-in relations and data integrity; more suitable for unstructured, evolving data.

**ORM:**  
- **Prisma** (Node.js ORM)

**Why Prisma:**  
- Modern, type-safe, easy to set up, integrates perfectly with Node.js/TypeScript.
- Schema-based migrations and model definitions.
- Massive community support, clear documentation.

**Sensible Indexes & Constraints:**  
- Ensures fast search (indexes on commonly searched fields)
- Enforces data integrity (primary keys, foreign keys, unique and not-null constraints)
- Prisma makes it easy to add and maintain these through its schema definitions.


# Database Schema (First Iteration)

## Overview

This schema is designed to support two screens:
1. List of F1 seasons (2005-present) and each season’s World Champion
2. For a selected season: all races + each race’s winner (with champion highlighted)

## Tables

### drivers
| Field         | Type      | Description           |
|---------------|-----------|----------------------|
| id            | PK        | Internal DB ID       |
| driver_ref    | String    | Ergast driver ID     |
| name          | String    | Full name            |

### seasons
| Field                | Type      | Description                          |
|----------------------|-----------|--------------------------------------|
| year                 | PK        | Season year (e.g. 2021)              |
| champion_driver_id   | FK        | Winner (driver) of the season        |

### races
| Field              | Type      | Description                           |
|--------------------|-----------|---------------------------------------|
| id                 | PK        | Internal DB ID                        |
| season_year        | FK        | Linked to season (year)               |
| name               | String    | Race name (e.g. “Australian GP”)      |
| round              | Int       | Race number in season                 |
| winner_driver_id   | FK        | Winner (driver) of the race           |

## Indexes and Constraints

- `seasons.champion_driver_id` → `drivers.id` (FK)
- `races.season_year` → `seasons.year` (FK)
- `races.winner_driver_id` → `drivers.id` (FK)
- Unique: (season_year, round)
- Indexes on `year`, `driver_id`, and `season_year` for fast lookup

## Why so simple?

- Only stores data needed for the UI/screens.
- Easy to expand later if features are added.
- Keeps maintenance and debugging minimal.

## Highlighting Champion Race Winners – Design Decision

When showing race winners for a season, the app must highlight if the winner is also the champion of that year.

### Trade-Offs Considered

**1. FE Does the Logic**
- Frontend receives race data and champion info, then compares `winner_driver_id` with `champion_driver_id`.
- *Pros:* No backend or API changes needed, logic is simple.
- *Cons:* Logic duplicated across platforms, frontend must “know” the business rule, risk of inconsistent behavior if not handled uniformly.

**2. Backend Returns `isChampion` Field in API Response (Chosen Solution)**
- Backend computes an `isChampion` boolean for each race winner before sending data to frontend.
- *Pros:* Keeps frontend simple (“dumb rendering”), enforces consistent logic everywhere, easier for new platforms or clients, and keeps business rules in one place.
- *Cons:* Slightly more logic in backend, but trivial and easy to test.

**3. Store `isChampion` in the Database**
- A column is added to the race record to persist whether the winner was the season’s champion.
- *Pros:* Querying is fast and requires no computation.
- *Cons:* Adds risk of data getting out of sync (e.g., if champion changes), unnecessary denormalization for a small and predictable dataset.

### Final Decision

We chose **Option 2**:  
> The backend computes an `isChampion` boolean for each race in the API response. The frontend simply renders races as highlighted if `isChampion` is true, with no business logic needed on the UI side.

**Why:**  
- Keeps business logic in one place (the backend), avoiding duplication.
- Makes it easy to add other clients (web, mobile, etc.) in the future with no extra effort.
- Minimizes risk of data inconsistency (no denormalized “isChampion” column).
- Keeps the frontend code simple, just responsible for UI rendering.

**Implementation:**  
- `seasons` table stores `champion_driver_id`.
- `races` table stores `winner_driver_id` for each race.
- When the API serves race data for a season, it adds an `isChampion` field:  
  `isChampion = (race.winner_driver_id === season.champion_driver_id)`

**Example API Response:**
```json
{
  "races": [
    {
      "name": "Australian GP",
      "winner_name": "Lewis Hamilton",
      "winner_driver_id": "hamilton",
      "isChampion": true
    },
    {
      "name": "Bahrain GP",
      "winner_name": "Sebastian Vettel",
      "winner_driver_id": "vettel",
      "isChampion": false
    }
  ]
}



