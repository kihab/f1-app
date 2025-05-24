# API Design Decisions

## Throttling & Retry Strategy for Ergast API Fetching

### Context

* **Requirement**: On first request, fetch season champions from the Ergast API (via proxy) for years 2005–present, store in DB, then serve from DB on subsequent requests.
* **Challenge**: Ergast proxy (`https://api.jolpi.ca/ergast`) enforces rate limits. Rapid sequential calls (one per year) trigger HTTP 429 (Too Many Requests).

### Options Considered

| Strategy                               | Description                                                                                      | Pros                                                              | Cons                                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **No throttling, naive loop**          | Fire 21 sequential HTTP calls without delay.                                                     | Simplest code                                                     | Hits rate limit → failures; unreliable.                                                       |
| **Sleep between requests**             | Add a fixed 300 ms delay between each year’s fetch to slow the request rate.                     | Respectful to proxy; predictable pacing; easy to implement.       | Adds \~6 s delay (300 ms × 21) to first-run seed; overall \~9–10 s including network latency. |
| **Retry-on-429 with back-off**         | On receiving HTTP 429, wait 1 s then retry the same call once.                                   | Only delays when limit exceeded; recovers from occasional bursts. | Slight extra code; still potentially slow if many 429s.                                       |
| **Batch API call**                     | Query `/driverStandings/1.json?limit=1000` to retrieve champions for all seasons in one request. | One network round-trip (<1 s), no rate-limit risk; simpler loop.  | Ergast proxy may not support this query; less granular error control per year.                |
| **Background seeding / pre-populated** | Offload seeding to background job or ship a static JSON file updated periodically.               | No user-facing delay; immediate app startup.                      | Adds infrastructure (worker/crons) or risk of stale data.                                     |

### Decision

We implemented a **combined throttling + retry** strategy in our `seasonsService` and `ergastClient` modules:

1. **300 ms delay** between each year’s fetch (controlled in service loop).
2. **Up to 3 retries on HTTP 429** with **exponential backoff** (1s, 2s, 4s; controlled in the Ergast helper).

#### Why This Approach?

* **Reliability**: Avoids fatal failures due to rate limiting; ensures all available years up to present are fetched.
* **Self-healing**: If a year fails due to rate limit or network, the backend will keep attempting to fetch and fill gaps on each request, eventually populating all years.
* **Simplicity**: Minimal code changes; uses a small sleep helper with explicit comments.
* **Performance Trade-off**: Initial seed takes \~9–10 s (acceptable for a one-time or weekly background seed), subsequent requests are instantaneous from the DB.
* **Maintainability**: Code is modular (service vs. helper), fully commented, and easy to replace later with a batch or background solution.

> **Future evolution**: We may revisit this to use a batch endpoint or background worker for near-instant seeding once the core MVP is validated.

---

## Self-Healing /seasons API Design (2005–Current Year)

### New Design (currentYear-05):

* **Requirement:** The backend always serves a full list of seasons from 2005 up to the current year at runtime, even if data for some years is missing on initial seed (due to rate limits, API downtime, or other issues).
* **Implementation:**

  * The `/api/seasons` endpoint always returns a list of objects for **every year in the configured range (from 2005 to the current year at runtime)**.
  * For any year where data is missing in the DB, the API will return:

    ```json
    {
      "year": 2014,
      "champion": null
    }
    ```

    (where `champion` is `null` if the Ergast API failed to provide data for that year yet)
  * The backend attempts to "self-heal" by **trying to fetch and fill in missing years on every request** to `/api/seasons` until all years up to the present are present in the DB.
  * This ensures the FE can always show the full year range, displaying a "Loading/Retry" state for years with `champion: null`.
  * Magic numbers (year range, URLs) are kept in a constants config for maintainability.

#### **Why This Approach?**

* **UX:** FE never gets "stuck" with partial results; missing data is visible and can be retried automatically or by the user.
* **Resilience:** Handles network errors, proxy limits, and API outages gracefully. Eventually fills all gaps without requiring manual intervention.
* **Transparency:** FE and reviewers can see which years are still missing/filling, and trust that the backend is "self-healing" over time.
* **Simplicity:** No risk of data being permanently missing due to a one-off failure at seed time.

> **Note:** This "gap-aware" contract is documented for the FE team—if `champion: null` is returned for a year, the FE should show a loading, retry, or error state.

---

## Path Parameter vs Query Parameter

**Decision:** Use a **path parameter** (`/api/seasons/{year}/races`) rather than a query parameter (`/api/races?year=2025`) because:

* **RESTful hierarchy:** Clearly expresses that races are a sub‐resource of a specific season.
* **Intuitive for clients:** FE navigation (or a curl in a terminal) directly maps to the URL structure.
* **Bookmarkable/testable:** Easy to paste in a browser or share as a link.
* **Clean separation:** Avoids ambiguity and keeps routes organized under their parent resource.

---

## `isChampion` in Race Response

**Decision:** Compute an `isChampion: boolean` field in the Race API response when serving `/api/seasons/{year}/races`.

* **Why:** Keeps business logic centralized in the backend, prevents duplication, and ensures any client (iOS, web, etc.) receives ready-to-render data without needing to compare IDs.
* **Alternatives:**

  1. Frontend compares `race.winner.id` to season’s champion ID (too much UI logic).
  2. Store a denormalized `isChampion` column in DB (risk of data inconsistency).
* **Trade-off:** Slightly more compute in the controller, but a simpler, more robust client.
