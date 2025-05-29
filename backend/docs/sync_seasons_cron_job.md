# F1 Season Data Sync Cron Job

## Overview

The F1 Season Data Sync Cron Job is an automated process that ensures our application always has the most up-to-date Formula 1 champion data, particularly for the current season. This job bypasses the normal caching mechanisms to directly fetch the latest data from the Ergast API, update the database, and invalidate the cache to maintain data consistency across all application layers.

## Purpose

- **Data Freshness**: Ensures champion data for the current F1 season is always up-to-date
- **Automatic Updates**: Removes the need for manual data refreshes
- **Consistent User Experience**: Guarantees that users always see the most current information

## Implementation Details

### Location

The cron job is implemented in:
- **Main Job File**: `/backend/jobs/syncSeasonsJob.js`
- **Configuration**: `/backend/config/constants.js`
- **Integration**: Initialized in `/backend/app.js`

### Dependencies

- **node-cron**: For scheduling the job execution
- **ergastClient**: For fetching data from the Ergast API
- **dbService**: For database operations
- **cachingUtils**: For cache management

### Key Components

#### 1. Job Factory Function

Follows the application's dependency injection pattern to create a testable job instance:

```javascript
function createSyncSeasonsJob(deps = {}) {
  // Inject dependencies or use defaults
  const dbService = deps.dbService || dbServiceDefault;
  const ergastClient = deps.ergastClient || ergastClientDefault;
  const cachingUtils = deps.cachingUtils || cachingUtilsDefault;
  
  // ... job methods ...
  
  return { runSeasonSyncJob, refreshCurrentSeason, startCronJob };
}
```

#### 2. Data Refresh Logic

The core `refreshCurrentSeason()` function performs a complete end-to-end refresh:

1. **Direct API Call**: Bypasses cache and database checks to get fresh data
2. **Database Update**: Updates driver and season records with latest information
3. **Cache Invalidation**: Ensures the cache is refreshed for subsequent requests

```javascript
async function refreshCurrentSeason() {
  // 1. Direct API call
  const champion = await ergastClient.fetchChampionDriver(CURRENT_YEAR);
  
  // 2. Database update
  if (champion) {
    const driver = await dbService.upsertDriver(champion);
    await dbService.upsertSeason(CURRENT_YEAR, driver.id);
  } else {
    await dbService.upsertSeason(CURRENT_YEAR, null);
  }
  
  // 3. Cache invalidation
  await cachingUtils.invalidateCache(SEASONS_CACHE_KEY);
}
```

#### 3. Scheduling

The job is scheduled using node-cron with a configurable schedule:

```javascript
function startCronJob(runImmediately = false) {
  // Schedule the job
  const job = cron.schedule(SEASON_SYNC_CRON, async () => {
    await runSeasonSyncJob();
  });
  
  // Optional immediate execution
  if (runImmediately) {
    setTimeout(async () => {
      await runSeasonSyncJob();
    }, 2000);
  }
  
  return job;
}
```

### Configuration

The cron schedule is defined in `/backend/config/constants.js`:

```javascript
// Production schedule (every Monday at 4am UTC)
const SEASON_SYNC_CRON = '0 4 * * 1';

// Testing schedule (every 5 minutes)
// const SEASON_SYNC_CRON = '*/5 * * * *';
```

## Usage

### Automatic Execution

The job automatically starts when the backend application initializes:

```javascript
// In app.js
const { startCronJob } = require('./jobs/syncSeasonsJob');
const syncJob = startCronJob();
```

### Manual Triggering

For testing or ad-hoc refreshes, the job can be triggered manually:

```javascript
const { runSeasonSyncJob } = require('./jobs/syncSeasonsJob');

// Somewhere in your code
await runSeasonSyncJob();
```

## Testing

The job can be tested by:

1. Setting a more frequent cron schedule (e.g., every 5 minutes)
2. Setting `runImmediately = true` in the `startCronJob` function
3. Monitoring logs for cron job execution
4. Verifying updated data in the database and frontend

## Logging

The job includes comprehensive logging with the `[CRON]` prefix for easy filtering:

- Job start/completion with timing information
- API call details
- Database update status
- Cache invalidation results
- Error handling with detailed messages

## Future Improvements

- **More Granular Scheduling**: Different schedules for race weekends vs. off-season
- **Failure Notifications**: Alert system for repeated job failures
- **Expanded Scope**: Add refreshing of race results in addition to champion data
- **Admin Control**: API endpoint to manually trigger the job

## Cron Expression Format

The cron expression format used is:

```
 ┌───────────── minute (0-59)
 │ ┌───────────── hour (0-23)
 │ │ ┌───────────── day of month (1-31)
 │ │ │ ┌───────────── month (1-12)
 │ │ │ │ ┌───────────── day of week (0-6) (Sunday=0)
 │ │ │ │ │
 │ │ │ │ │
 * * * * *
```

The production schedule `0 4 * * 1` means: "At 4:00 AM, only on Monday"

---

*This documentation was last updated on May 29, 2025.*