# Containerization & Docker Plan

## Why Docker?

- Ensures “it works on my machine” means “it works everywhere”
- Bundles all app dependencies, tools, and configs
- One command (`docker compose up`) to start backend and database for local/dev/prod

## What We Use

- **Multi-stage Dockerfile:**  
  - First builds the app (with all dev tools), then creates a final, small image with only what's needed to run the app in production
- **docker-compose.yml:**  
  - Starts backend API and PostgreSQL database in two separate containers
  - Handles networking, startup order, and env variables for both

## Terms

- **Container:** A packaged mini-computer with your app and its environment
- **Dockerfile:** Recipe for building the app container
- **Multi-stage Dockerfile:** Uses intermediate steps to keep production images small and secure
- **docker-compose.yml:** Orchestrates multiple containers (backend, db) together
- **Healthcheck:** A command Docker runs to make sure your app and DB are alive and responding
- **Environment Variable:** Config values (like DB passwords) injected at runtime, never hardcoded

## Example Files

**Dockerfile** (multi-stage)
```dockerfile
# Stage 1: Build
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build   # Only if using TypeScript or bundler

# Stage 2: Production
FROM node:18-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]   # Adjust for your entry file
```

**docker-compose.yml**
```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_DB: f1db
      POSTGRES_USER: f1user
      POSTGRES_PASSWORD: secretpassword
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "f1user"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: .
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgres://f1user:secretpassword@db:5432/f1db
      NODE_ENV: production
    ports:
      - "3000:3000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  db_data:
```
