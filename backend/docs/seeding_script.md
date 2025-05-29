# Database Seeding Script Documentation

This document explains the purpose, implementation, and usage of the dedicated seeding script in the F1 World Champions backend project.

---

## **Overview**

To ensure a fast and smooth first-time experience for frontend users, we run a dedicated database seeding script as part of our Docker Compose workflow. This script fetches all F1 seasons and champion data (from 2005 to the current year) from the Ergast API and persists it in both the Postgres database and Redis cache—**before** the backend server starts. As a result, the app is always ready to serve data instantly, even on the very first API call.

---

## **How It Works**

* The script is located at: `backend/scripts/seedSeasons.js`.
* It uses the same `seasonsService.getAllSeasons()` logic as our backend API, ensuring consistency and "self-healing" if the database is empty or missing any years.
* The script is run in a one-off container as part of Docker Compose (see below), after migrations and before the backend API server starts.
* If the seasons data already exists in the database, the script exits immediately without changing anything.
* If the database is empty, it fetches all required data, saves to DB, and primes the Redis cache.

---

## **Workflow in Docker Compose**

1. **db** (PostgreSQL) starts and becomes healthy.
2. **migrate** service runs database migrations (using Prisma) to create/update schema.
3. **redis** starts and becomes healthy.
4. **seed** service runs the seeding script to fill the DB and Redis cache with F1 data.
5. **backend** only starts **after** all above steps have completed successfully, ensuring instant FE experience.

---

## **Docker Compose Configuration**

The `seed` service in `infrastructure/docker-compose.yml`:

```yaml
  seed:
    build: ../backend
    command: ["node", "scripts/seedSeasons.js"]
    environment:
      DATABASE_URL: postgres://f1user:f1usersecretpassword@db:5432/f1db?schema=public
      REDIS_HOST: redis
      REDIS_PORT: 6379
    depends_on:
      db:
        condition: service_healthy
      migrate:
        condition: service_completed_successfully
      redis:
        condition: service_healthy
```

---

## **Key Details**

* **Idempotent:** The script is safe to run multiple times—it only seeds if data is missing.
* **Consistent logic:** Uses the same business logic and error handling as API endpoint, so any fixes/improvements are automatically inherited.
* **Resource cleanup:** The script exits after completion, freeing up resources.

---

## **Why This Approach?**

* Ensures FE users always get instant results, even on first load.
* Removes race conditions (migrations always run before seeding, seeding before backend API).
* All orchestration is handled with Docker Compose for robust, repeatable dev and CI/CD.

---

## **How to Trigger**

Seeding runs automatically as part of `docker compose up` from the `infrastructure/` folder. No manual action is needed.

If you want to rerun the seeding manually:

1. Stop all containers: `docker compose down`
2. (Optional) Remove volumes for a fresh DB: `docker compose down -v`
3. Start up: `docker compose up --build`

---

## **Troubleshooting**

* Check logs for the `seed` service if the database is not pre-filled.
* If the Ergast API is down, the script will fill in as much data as possible and log errors.
* Redis must be healthy for seeding to complete successfully.

---

## **Improvement Ideas**

* Future enhancement: self-healing for missing years (not just when DB is empty).
* Automated background refresh jobs for ongoing updates after each race.
* Add monitoring/alerting for seed errors in CI/CD.

---

## **Questions?**

Check the logs of the `seed` service container or ask the dev team.
