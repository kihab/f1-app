# Docker & Docker Compose Setup

This document explains the Docker and Docker Compose setup for the F1 World Champions full-stack project. It covers key design decisions, file structure, how to run the backend and database in containers, and how we handle database migration and seeding.

---

## **1. Overview**

This project uses Docker to ensure a reliable, repeatable development environment for both the Node.js backend and PostgreSQL database.
Docker Compose orchestrates multi-container startup, allowing both services to be launched and networked together with a single command.

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
* Runs Prisma migrations **automatically** before starting the server.

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

> The `start` script in `package.json` runs:
> `npx prisma migrate deploy && node index.js`
> This **automatically applies DB schema migrations on startup**—reviewers never need to run manual migration commands.

---

## **4. Docker Compose**

Located at: **`infrastructure/docker-compose.yml`**

### **Services:**

* **db:**
  Runs PostgreSQL 16 (alpine), using a named Docker volume for persistent data, and sets up the correct database, user, and password for the app.
* **backend:**
  Builds from `../backend`, injects environment variables (including the Postgres connection string), depends on the DB being healthy, and exposes port 3000 for API access.
* **redis:**
  Runs Redis 7 (alpine) as an in-memory cache for improving API response times. The backend automatically connects to this service for caching frequently accessed data.
* **pgadmin:**
  Runs pgAdmin 4 (version 8.6), a web-based PostgreSQL administration tool that provides a graphical interface to manage the database. It's accessible via a web browser at http://localhost:8080 using the credentials admin@f1.com (email) and adminpw123 (password).

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

  backend:
    build: ../backend
    environment:
      DATABASE_URL: postgres://f1user:f1usersecretpassword@db:5432/f1db?schema=public
      REDIS_HOST: redis          # Redis service hostname (internal Docker network)
      REDIS_PORT: 6379           # Default Redis port
      # Add other backend ENV vars here (ERGAST_API_BASE, etc.)
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    ports:
      - "3000:3000"

  redis:  # Redis cache
    image: redis:7-alpine
    ports:
      - "6379:6379"              # Exposed for local debug/inspection
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  db-data:
  redis-data:
  pgadmin-data:
```

### **Key Decisions Explained**

* **Volumes (`db-data`, `redis-data`, `pgadmin-data`)**: Persist data across container restarts and rebuilds for database, Redis, and pgAdmin settings respectively.
* **Healthcheck**: Ensures backend starts **only after** the database and Redis are ready to accept connections, eliminating race conditions.
* **Environment Variables**: All credentials and connection info are controlled through Compose and `.env`.
* **Automatic Migrations**: The backend runs migrations on startup, so no reviewer action is needed.
* **Redis Cache**: Improves API performance by caching frequently accessed data with configurable TTLs.
* **pgAdmin**: Provides a web-based UI for database management and inspection without requiring any local Postgres tools.
* **No Frontend Service**: Only backend, DB, Redis, and pgAdmin are containerized (frontend is a native iOS app).

---

## **5. Environment Variables**

* **.env** file in `backend/` (used by Prisma and Node):

  ```env
  DATABASE_URL="postgresql://f1user:f1usersecretpassword@db:5432/f1db?schema=public"
  REDIS_HOST="redis"
  REDIS_PORT="6379"
  ```
* **Compose overrides** these in the backend container for guaranteed consistency.

---

## **6. API Seeding & Throttling**

* **On first API request**, seasons/races are seeded from the Ergast proxy (rate-limited).
* Seeding uses a **300ms delay between requests** and up to **3 retries** with exponential backoff on HTTP 429 responses, ensuring reliability even if rate-limits are hit.

---

## **7. How to Run the Project and Access pgAdmin**

**From the `infrastructure/` folder:**

```bash
docker compose up --build
```

* This command will:

  1. Pull/start the Postgres, Redis, and pgAdmin containers.
  2. Build and start the backend.
  3. Apply all DB migrations.
  4. Seed data on first run (and cache results in Redis).
  5. Expose API at `http://localhost:3000` and pgAdmin at `http://localhost:8080`

**To stop and remove containers/volumes:**

```bash
docker compose down -v
```

---

## **8. Review Notes & Common Questions**

* **No manual migration commands** are needed—handled by backend on startup.
* **Database persists data** (volume) until you run `down -v`.
* **API rate limiting** is respected—code uses retry logic and proxy's `Retry-After` header.
* **No "localhost" DB host in backend**; Compose networks services using service names (`db` and `redis`).
* **Seeding delay** and retries are easily tuned in code for future changes.
* **Redis caching** is automatically configured—no manual setup required.
* **pgAdmin access** is available at http://localhost:8080—login with admin@f1.com and adminpw123.

---

## **9. Troubleshooting**

* If you see 429 (Too Many Requests) logs, the API seed logic will handle it and continue.
* To reset everything (including DB data), use `docker compose down -v` before restarting.
* For any connection issues, double-check `.env` and Compose credentials.

---

## **10. Why This Approach?**

* **Repeatable setup:** Any team member or reviewer can start and test the stack locally with a single command.
* **No manual DB setup:** All DB schema and seed logic is self-contained and automated.
* **Easy to extend:** Add more services or change configs easily with Compose.
* **Production-like:** Mirrors production environments with clear, testable isolation.

---

## **11. Further Improvements**

* ~~Could add a migration admin tool (like `pgAdmin`) as another service if needed.~~ ✅ Done
* Could add batch seeding or background jobs if API limits are tighter in future.
* Could implement Redis persistence or cluster configuration for production environments.
* Could add Redis monitoring/admin tools (like Redis Commander) as an additional service.

---

## **12. Contact / Support**

For issues, please check logs in both `db` and `backend` containers.
All credentials are for local/dev only; do not use in production.