# Docker & Docker Compose Setup (Updated)

This document explains the **updated** Docker and Docker Compose setup for the F1 World Champions full-stack project, reflecting recent improvements:

* Dedicated migration step
* Automated DB and Redis seeding before backend starts
* Improved startup orchestration

---

## **1. Overview**

This project uses Docker to ensure a reliable, repeatable development environment for both the Node.js backend and PostgreSQL database.
Docker Compose orchestrates multi-container startup, allowing all services to be launched and networked together with a single command.

---

## **2. File Structure**

```text
f1-app/
├── backend/             # Node.js/Express API (Dockerized)
│   ├── Dockerfile
│   ├── package.json
│   ├── ... (source code, Prisma, etc.)
│   └── .env
├── infrastructure/      # Infrastructure & orchestration configs
│   └── docker-compose.yml
├── frontend/            # (Not Dockerized—iOS app)
└── ... (other folders)
```

---

## **3. Dockerfile (Backend)**

Located at: **`backend/Dockerfile`**

**Key features:**

* Uses Node.js v20 (alpine image for smaller size).
* Copies and installs dependencies.
* Copies source code and Prisma files.
* Generates the Prisma client (for the container's Linux environment).
* Exposes port 3000 for API access.
* Runs the server with `npm start` (now just starts the API; migrations run separately).

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]
```

> **Note:** Migrations are now run by a separate Compose service, not inside the backend startup.

---

## **4. Docker Compose**

Located at: **`infrastructure/docker-compose.yml`**

### **Services:**

* **db:**
  Runs PostgreSQL 16 (alpine), with a persistent Docker volume, creating the database, user, and password.

* **redis:**
  Runs Redis 7 (alpine) as an in-memory cache for improving API response times. The backend automatically connects to this service for caching.

* **migrate:**
  Runs database migrations **before** any seeding or backend logic. Waits for DB to be healthy, applies all Prisma migrations, then exits.

* **seed:**
  Runs the seeding script to prefill the DB and Redis cache with F1 season data. Depends on DB, Redis, and completed migrations. Exits after completion.

* **backend:**
  Builds and starts the API only after all of the above are complete, exposing port 3000.

* **pgadmin:**
  Web-based PostgreSQL admin tool, available at [http://localhost:8080](http://localhost:8080).

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: f1db
      POSTGRES_USER: f1user
      POSTGRES_PASSWORD: f1usersecretpassword
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "f1user", "-d", "f1db"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  migrate:
    build: ../backend
    command: ["npx", "prisma", "migrate", "deploy"]
    environment:
      DATABASE_URL: postgres://f1user:f1usersecretpassword@db:5432/f1db?schema=public
    depends_on:
      db:
        condition: service_healthy

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

  backend:
    build: ../backend
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
      seed:
        condition: service_completed_successfully
    ports:
      - "3000:3000"

  pgadmin:
    image: dpage/pgadmin4:8.6
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@f1.com
      PGADMIN_DEFAULT_PASSWORD: adminpw123
    ports:
      - "8080:80"
    depends_on:
      - db
    volumes:
      - pgadmin-data:/var/lib/pgadmin

volumes:
  db-data:
  redis-data:
  pgadmin-data:
```

### **Key Decisions Explained**

* **Startup Orchestration:**

  * Services start in order: DB → Migrate → Redis → Seed → Backend
  * No race conditions: backend API only starts when DB, Redis, migrations, and seeding are complete

* **Volumes:**

  * Persist data for database, Redis, and pgAdmin

* **Healthcheck:**

  * Ensures service dependencies are actually healthy before dependent containers run

* **Environment Variables:**

  * Credentials and connection info are managed in Compose and `.env`

* **No Frontend Service:**

  * Frontend is an iOS app (not containerized)

---

## **5. Environment Variables**

* **.env** file in `backend/`:

  ```env
  DATABASE_URL="postgresql://f1user:f1usersecretpassword@db:5432/f1db?schema=public"
  REDIS_HOST="redis"
  REDIS_PORT="6379"
  ```
* Compose overrides these in the backend container for consistency.

---

## **6. Database Migration & Seeding**

* **Migrations** are run as a dedicated service (`migrate`) in Compose, guaranteeing schema is applied before any other logic.
* **Seeding** is handled by a separate service (`seed`), which runs only after migrations and cache are ready, ensuring all F1 data is present and cached on first run.
* **Both `migrate` and `seed` are one-off jobs** that exit after completion.

---

## **7. How to Run the Project and Access pgAdmin**

**From the `infrastructure/` folder:**

```bash
docker compose up --build
```

This command will:

1. Pull/start the Postgres, Redis, and pgAdmin containers.
2. Build and run the migration job.
3. Build and run the seeding job.
4. Build and start the backend server (API).
5. Expose API at `http://localhost:3000` and pgAdmin at `http://localhost:8080`

**To stop and remove containers/volumes:**

```bash
docker compose down -v
```

---

## **8. Review Notes & Common Questions**

* No manual migration or seeding commands needed—handled by Compose.
* Database persists data (volume) until you run `down -v`.
* Compose orchestrates service order and health.
* API and Redis service names are used for network connectivity.
* pgAdmin available at [http://localhost:8080](http://localhost:8080) ([admin@f1.com](mailto:admin@f1.com) / adminpw123).

---

## **9. Troubleshooting**

* If you see errors during migrations or seeding, check logs of the `migrate` or `seed` service.
* To reset everything, use `docker compose down -v` before restarting.
* For any connection issues, double-check `.env` and Compose service credentials.

---

## **10. Why This Approach?**

* **Repeatable setup:** Any team member or reviewer can start and test the stack locally with a single command.
* **No manual DB setup:** All DB schema and seed logic is automated and tested.
* **Production-like:** Mirrors production environments for robust, cloud-native workflows.

---

## **11. Further Improvements**

* Could add background refresh jobs for race data.
* Could add Redis admin tools for cache monitoring.
* Could add more robust alerting and health checks for prod environments.

---

## **12. Contact / Support**

For issues, please check logs in the `db`, `migrate`, `seed`, and `backend` containers.
All credentials are for local/dev only; do not use in production.
