# Backend Tech Stack Decisions

## Language & Framework

**Chosen:**  
- **Node.js** (runtime)
- **Express** (framework)

**Why:**  
- Fastest to prototype and launch (minutes to first endpoint)
- Huge ecosystem, best support/documentation, almost zero boilerplate
- Easy integration with REST, Swagger, Docker, modern CI/CD

**Alternatives considered:**  
- **Python (FastAPI):** Also fast, but would add learning if you don’t know Python  
- **Java (Spring Boot):** Very robust but slow to start and heavy for a quick project  
- **Go (Gin/Fiber):** Fast, but not needed for this use case and a new language to learn

---

## TypeScript

**Status:**  
- *Nice-to-have, will add if time allows after the core project is functional*

**Why not at first:**  
- TypeScript adds type safety and editor support, but it requires extra setup and may slow you down if you’re new to it.
- For rapid prototyping and when time is short, plain JS gets you there faster.
- We’ll “upgrade” to TS later if there’s bandwidth.

---

## API Style: REST vs GraphQL

**Chosen:**  
- **REST API** (with Express)

**Why:**  
- Faster to set up and easier to learn
- Perfect for straightforward CRUD and resource-based APIs (like seasons, races, winners)
- Swagger/OpenAPI integration is simple for REST

**Tradeoffs:**  
- **GraphQL** is better for complex, deeply-nested, or very flexible data queries, but adds learning curve and extra setup time. It’s not needed for this assignment’s scope.

---

## Swagger/OpenAPI

**Status:**  
- *To be added at the end after main endpoints and logic are done, unless required sooner for team communication or integration.*

**Why:**  
- Swagger/OpenAPI auto-generates beautiful documentation and sample requests for your REST API.
- It’s not needed during initial prototyping, but it’s an industry standard and will be added before submission.

---

## Endpoints (High-Level)

- `/api/seasons` – List all F1 seasons from 2005 to now
- `/api/seasons/:year` – Details and race winners for a season
- `/api/races/:raceId` – Details for a specific race (optional)
- **Error and loading states handled on every endpoint**
- **Data fetched from Ergast API on first request, then served from local DB/cache**

> **NOTE:**  
> Endpoint details and payloads will be revisited and finalized after understanding the Ergast API structure.  
> For now, the priority is getting the tech stack locked and backend skeleton up.

---

## Summary Table

| Layer      | Tech Stack                   | Reason/Why                                           | Alternatives (Why not chosen)               |
|------------|-----------------------------|------------------------------------------------------|---------------------------------------------|
| Language   | Node.js                     | Fast, easy, huge ecosystem                           | Python, Java, Go (slower, more learning)    |
| Framework  | Express                     | Minimal boilerplate, super common                    | FastAPI, Spring Boot, Gin/Fiber             |
| API Style  | REST                        | Simple, fast, best fit for assignment                | GraphQL (more setup, unnecessary flex here) |
| Type Safety| TypeScript (optional, later)| Nice-to-have for bugs & editor support, can wait     | N/A                                         |
| Docs       | Swagger/OpenAPI (add later) | Industry standard, quick to add after main coding    | N/A                                         |

---

