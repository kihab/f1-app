# Backend Dependencies

| Package  | Purpose in this project | Why this library (vs. common alternatives) |
|----------|------------------------|--------------------------------------------|
| **express** | Core web-server / routing framework. Handles HTTP requests, middleware, and response lifecycle. | • De-facto standard in Node.<br>• Huge ecosystem, simple API.<br>• Fast to prototype, easy to scale.<br>_Alternatives:_ Fastify (faster but smaller ecosystem), Koa (minimal). Express is the most familiar for reviewers. |
| **cors** | Enables Cross-Origin Resource Sharing so the iOS app can call the API from a different host/port during development. | • One-liner middleware.<br>• Maintained by Express team.<br>_Alternative:_ Manually set headers—riskier and repetitive. |
| **dotenv** | Loads environment variables from `.env` into `process.env` (DB URL, secrets, port). | • Zero-config, industry standard.<br>• Keeps secrets out of source code.<br>_Alternative:_ hand-roll `require('fs').readFileSync('.env')`—unnecessary boilerplate. |
| **axios** | Promise-based HTTP client used for calling the external Ergast API. | • Built-in timeout & interceptors, rich errors.<br>• Massive community docs.<br>_Alternatives:_ Native `fetch` (needs extra boilerplate for timeout/retries), `node-fetch` (extra install, fewer features). For a small project Axios gives production-grade ergonomics with minimal code. |
