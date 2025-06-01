# Backend Folder Structure

```text
backend/
├── index.js                  # Entry point – loads app.js and starts the HTTP server
├── app.js                    # Express instance, core middleware, and route mounting
├── config/                   # Application configuration files
│   └── constants.js         # Application-wide constants
├── prisma/                   # Prisma schema and migrations
│   ├── migrations/          # Database migration files
│   └── schema.prisma        # Prisma schema definition
├── routes/                   # Route definitions
│   ├── races.js             # Races API routes
│   └── seasons.js           # Seasons API routes
├── controllers/              # HTTP layer logic
│   ├── racesController.js   # Races API controller
│   └── seasonsController.js # Seasons API controller
├── services/                 # Business logic layer
│   ├── dbService.js         # Database operations service
│   ├── racesService.js      # Races business logic
│   └── seasonsService.js    # Seasons business logic
├── utils/                    # Reusable utility functions
│   ├── cachingUtils.js      # Caching utilities with Redis
│   ├── commonUtils.js       # Common utility functions
│   ├── dtoUtils.js          # Data Transfer Object utilities
│   ├── ergastClient.js      # Ergast API client
│   ├── errorHandler.js      # Centralized error handling
│   ├── redisClient.js       # Redis client configuration
│   ├── responseUtils.js     # Response formatting utilities
│   └── validationUtils.js   # Input validation utilities
├── jobs/                     # Background job definitions
│   └── syncSeasonsJob.js    # Cron job for syncing seasons data with Ergast API
├── scripts/                  # Helper scripts
│   └── seedSeasons.js       # Database seeding script
├── tests/                    # Test suite
│   ├── controllers/         # Controller tests
│   │   ├── racesController.test.js
│   │   └── seasonsController.test.js
│   ├── jobs/                # Job tests
│   │   └── syncSeasonsJob.test.js
│   ├── routes/              # Route tests
│   │   ├── races.test.js
│   │   └── seasons.test.js
│   ├── services/            # Service tests
│   │   ├── dbService.test.js
│   │   ├── racesService.test.js
│   │   └── seasonsService.test.js
│   ├── utils/               # Utility test files
│   │   ├── cachingUtils.test.js
│   │   ├── commonUtils.test.js
│   │   ├── dtoUtils.test.js
│   │   ├── ergastClient.test.js
│   │   ├── errorHandler.test.js
│   │   ├── redisClient.test.js
│   │   ├── responseUtils.test.js
│   │   └── validationUtils.test.js
│   └── smoke.test.js        # Smoke test for basic functionality
├── docs/                     # Project documentation
│   ├── diagrams/            # System architecture diagrams
│   │   └── sequence_diagram/ # Sequence diagrams for various flows
│   └── folder_structure.md  # This file
├── coverage/                 # Test coverage reports
├── .env                      # Environment variables (not committed)
├── package.json              # Project dependencies
├── package-lock.json         # Dependency lock file
├── Dockerfile                # Container configuration
├── jest.config.js            # Jest configuration
├── eslint.config.mjs         # ESLint configuration
└── swagger.js               # Swagger/OpenAPI documentation
```

## Layering Philosophy 

| Layer / Folder  | Responsibility                                                                         | Test Focus                                | Notes                             |
| --------------- | -------------------------------------------------------------------------------------- | ----------------------------------------- | --------------------------------- |
| **routes**      | Map HTTP path → controller method                                                      | none (routing tested via integration)     | 1 line per route keeps files tiny |
| **controllers** | ‑ Parse params  <br>‑ Call service(s)  <br>‑ Map service result → HTTP response        | Integration / Supertest                   | No business logic here            |
| **services**    | ‑ Business logic  <br>‑ Database operations  <br>‑ External API integration           | Unit tests                                | Core domain logic                 |
| **utils**       | ‑ Common utilities  <br>‑ Error handling  <br>‑ Response formatting  <br>‑ Validation | Unit tests                                | Reusable across application       |
| **jobs**        | ‑ Background tasks  <br>‑ Scheduled operations  <br>‑ Data refresh                    | Integration tests                         | Handles async operations          |
| **tests**       | ‑ Unit tests  <br>‑ Integration tests  <br>‑ Coverage reports                         | Jest / Supertest                          | Comprehensive test suite          |
| **services**    | ‑ All business rules  <br>‑ DB queries (via Prisma)  <br>‑ Ergast fetch + upsert logic | **Unit tests** (mock Prisma, mock fetch)  | Deterministic & fast              |
| **models**      | Shared DTO / type helpers (optional)                                                   | Unit                                      | Only add when duplication appears |
| **utils**       | Pure helper funcs (e.g. HTTP wrapper)                                                  | Unit                                      | Small, side‑effect‑free           |

> **Rule of thumb:** *Routes wire*, *Controllers translate*, *Services think*.

## Why This Structure?

* **Readability & Modularity** – Each concern lives in a predictable place.
* **Separation of Concerns** – Business logic never leaks into HTTP layer.
* **Testability** – Services are isolated; controllers are thin; routes are glue.
* **Scalability** – Adding a new resource is three small files: route, controller, service.