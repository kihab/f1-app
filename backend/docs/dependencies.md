# Backend Dependencies

| Package  | Purpose in this project | Why this library (vs. common alternatives) |
|----------|------------------------|--------------------------------------------|
| **express** | Core web-server / routing framework. Handles HTTP requests, middleware, and response lifecycle. | • De-facto standard in Node.<br>• Huge ecosystem, simple API.<br>• Fast to prototype, easy to scale.<br>_Alternatives:_ Fastify (faster but smaller ecosystem), Koa (minimal). Express is the most familiar for reviewers. |
| **cors** | Enables Cross-Origin Resource Sharing so the iOS app can call the API from a different host/port during development. | • One-liner middleware.<br>• Maintained by Express team.<br>_Alternative:_ Manually set headers—riskier and repetitive. |
| **dotenv** | Loads environment variables from `.env` into `process.env` (DB URL, secrets, port). | • Zero-config, industry standard.<br>• Keeps secrets out of source code.<br>_Alternative:_ hand-roll `require('fs').readFileSync('.env')`—unnecessary boilerplate. |
| **axios** | Promise-based HTTP client used for calling the external Ergast API. | • Built-in timeout & interceptors, rich errors.<br>• Massive community docs.<br>_Alternatives:_ Native `fetch` (needs extra boilerplate for timeout/retries), `node-fetch` (extra install, fewer features). For a small project Axios gives production-grade ergonomics with minimal code. |
| **ioredis** | Redis client for caching API responses and race data. | • Type-safe, promise-based API.<br>• Built-in pub/sub support.<br>• Excellent TypeScript support.<br>_Alternatives:_ node-redis (older API), redis (official but less TypeScript-friendly). ioredis provides a more modern, type-safe API while maintaining high performance. |
| **node-cron** | Handles scheduled background jobs (e.g., season data refresh). | • Simple cron expression syntax.<br>• Built-in timezone support.<br>• Easy to test locally.<br>_Alternatives:_ cron (older API), agenda (more complex for our needs). node-cron provides a lightweight, easy-to-use solution for our scheduled tasks. |
| **@prisma/client** | Database ORM and query builder for PostgreSQL. | • Type-safe queries generated at build time.<br>• Automatic migrations.<br>• Excellent TypeScript support.<br>_Alternatives:_ Sequelize (more complex), TypeORM (heavier). Prisma provides a modern, type-safe approach to database interactions while being simpler to use than alternatives. |
| **prisma** | CLI tool for database migrations and schema management. | • Generates type-safe Prisma Client.<br>• Handles migrations.<br>• Schema validation.<br>_Alternative:_ Hand-rolling SQL migrations—error-prone and time-consuming. |
| **swagger-jsdoc** | Generates OpenAPI documentation from JSDoc comments. | • Automatic API documentation.<br>• Integrates with Express.<br>• Easy to maintain.<br>_Alternatives:_ Manual OpenAPI files (error-prone), apidoc (less feature-rich). swagger-jsdoc provides a maintainable way to document our API while keeping it in sync with the code. |
| **swagger-ui-express** | Provides interactive API documentation UI. | • Built-in Express middleware.<br>• Auto-updates with API changes.<br>• Try-out functionality.<br>_Alternative:_ Manual HTML documentation—static and harder to maintain. |

## Development Dependencies

| Package  | Purpose in this project | Why this library (vs. common alternatives) |
|----------|------------------------|--------------------------------------------|
| **eslint** | Code linter and style checker. | • Configurable rules.<br>• Large plugin ecosystem.<br>• TypeScript support.<br>_Alternatives:_ prettier (focuses on formatting), stylelint (CSS/HTML only). ESLint provides comprehensive linting capabilities while being extensible. |
| **@eslint/js** | Core ESLint rules and configurations. | • Built-in best practices.<br>• Regular updates.<br>• TypeScript support.<br>_Alternative:_ Custom rules—more maintenance overhead. |
| **eslint-plugin-jest** | Jest-specific ESLint rules for testing code. | • Prevents common testing mistakes.<br>• Jest-specific optimizations.<br>• Integration with Jest.<br>_Alternative:_ Manual testing guidelines—less enforced. |
| **jest** | Testing framework for unit and integration tests. | • Built-in mocking.<br>• Snapshot testing.<br>• Large ecosystem.<br>_Alternatives:_ Mocha (older), Vitest (faster but newer). Jest provides a complete testing solution with excellent documentation. |
| **supertest** | Testing HTTP endpoints and Express apps. | • Easy to use with Express.<br>• Built-in assertions.<br>• Mock HTTP requests.<br>_Alternative:_ Custom HTTP client—more boilerplate code. |
| **globals** | Provides global variables for different environments. | • Type definitions for globals.<br>• Environment-specific variables.<br>• TypeScript support.<br>_Alternative:_ Manually defining globals—more error-prone. |
