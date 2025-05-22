# Backend Folder Structure

```text
backend/
├── index.js                  # Entry point – loads app.js and starts the HTTP server
├── app.js                    # Express instance, core middleware, and route mounting
├── prisma/                   # Prisma schema + generated migrations
│   └── schema.prisma         
├── routes/                   # Thin route definitions (one file per resource)
│   └── seasons.js            
│   └── races.js            
├── controllers/              # HTTP‑layer logic – validates input & calls services
│   └── seasonsController.js  
│   └── racesController.js      
├── services/                 # **Business / domain** logic – fetch, upsert, cache…
│   └── seasonsService.js     
│   └── racesService.js       
├── models/                   # Optional: shared JS/TS types or DTO helpers
├── utils/                    # Reusable helpers (HTTP client, parsing, error utils)
├── tests/                    # Unit + integration tests (Jest / Supertest)
└── .env                      # Runtime secrets & config (never commit to VCS)
```

## Layering Philosophy 

| Layer / Folder  | Responsibility                                                                         | Test Focus                                | Notes                             |
| --------------- | -------------------------------------------------------------------------------------- | ----------------------------------------- | --------------------------------- |
| **routes**      | Map HTTP path → controller method                                                      | none (routing tested via integration)     | 1 line per route keeps files tiny |
| **controllers** | ‑ Parse params  <br>‑ Call service(s)  <br>‑ Map service result → HTTP response        | Integration / Supertest                   | No business logic here            |
| **services**    | ‑ All business rules  <br>‑ DB queries (via Prisma)  <br>‑ Ergast fetch + upsert logic | **Unit tests** (mock Prisma, mock fetch)  | Deterministic & fast              |
| **models**      | Shared DTO / type helpers (optional)                                                   | Unit                                      | Only add when duplication appears |
| **utils**       | Pure helper funcs (e.g. HTTP wrapper)                                                  | Unit                                      | Small, side‑effect‑free           |

> **Rule of thumb:** *Routes wire*, *Controllers translate*, *Services think*.

## Why This Structure?

* **Readability & Modularity** – Each concern lives in a predictable place.
* **Separation of Concerns** – Business logic never leaks into HTTP layer.
* **Testability** – Services are isolated; controllers are thin; routes are glue.
* **Scalability** – Adding a new resource is three small files: route, controller, service.

## This foundation lets us later add:

* OpenAPI auto‑docs (scan controllers or routes).
* Unit tests in `/tests`.
* CI/CD hooks.
