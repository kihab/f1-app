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

1. **300 ms delay** between each year’s fetch (controlled in service loop).<br>
2. **Single retry on HTTP 429** with a 1 s back-off (controlled in the Ergast helper).

#### Why This Approach?

* **Reliability**: Avoids fatal failures due to rate limiting; ensures all available years up to present are fetched.
* **Simplicity**: Minimal code changes; uses a small sleep helper with explicit comments.
* **Performance Trade-off**: Initial seed takes \~9–10 s (acceptable for a one-time or weekly background seed), subsequent requests are instantaneous from the DB.
* **Maintainability**: Code is modular (service vs. helper), fully commented, and easy to replace later with a batch or background solution.

> **Future evolution**: We may revisit this to use a batch endpoint or background worker for near-instant seeding once the core MVP is validated.
