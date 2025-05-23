# ESLint Setup and Decisions for Backend Project

This document outlines the ESLint configuration decisions made for the Node.js backend project, focusing on integrating Jest testing and ensuring appropriate file linting.

## 1. Initial Challenge: Integrating Jest with ESLint

Upon introducing Jest for unit testing, ESLint (which was already in use or set up for general JavaScript linting) began reporting `no-undef` errors for Jest-specific global variables like `describe`, `test`, `expect`, `jest`, and `beforeEach`. This occurs because ESLint, by default, is unaware of the global scope provided by the Jest test runner.

## 2. Solution for Jest Integration: `eslint-plugin-jest`

To resolve the `no-undef` errors and provide Jest-specific linting rules, we implemented the following:

*   **Installation**:
    ```bash
    npm install --save-dev eslint-plugin-jest
    ```
*   **Configuration (`eslint.config.mjs`)**:
    A dedicated configuration block was added for test files. This block:
    *   Targets files within the `tests/` directory and files matching `*.test.js` or `*.spec.js` patterns.
    *   Registers the `eslint-plugin-jest` plugin.
    *   Applies `jestPlugin.configs['flat/recommended']`, which includes a set of recommended ESLint rules for Jest tests.
    *   Adds Jest's global variables (`...globals.jest`) to the `languageOptions.globals` for test files, resolving the `no-undef` errors.

## 3. Challenge: ESLint Linting Non-JavaScript Files

ESLint was attempting to parse and lint various non-JavaScript files, leading to numerous parsing errors. This included:
    *   Build artifacts (e.g., `coverage/` directory contents).
    *   Project configuration files (e.g., `.env`, `.gitignore`, `Dockerfile`, `package.json`, `*.sql`, `*.toml`, `*.prisma`).
    *   Asset files (e.g., `.html`, `.css`, `.png`).
    *   Documentation files (`.md`).

## 4. Solution: Global `ignores` in ESLint Configuration

To prevent ESLint from attempting to lint inappropriate files, a comprehensive `ignores` array was added to the top level of the `eslint.config.mjs`. This array lists patterns for directories and file types that ESLint should completely skip.

Key ignored items include:
*   `node_modules/`
*   `coverage/`
*   `prisma/migrations/`
*   `docs/` (initially, though this file itself is in docs, the rule applies to future lint runs)
*   Specific file extensions like `.html`, `.css`, `.png`, `.sql`, `.toml`, `.prisma`, `.info`.
*   Project root files like `package.json`, `package-lock.json`, `.env`, `.gitignore`, `Dockerfile`.

This ensures ESLint focuses only on the JavaScript/TypeScript code it's intended to analyze.

## 5. Source Type Configuration (`sourceType`)

To ensure ESLint correctly parses JavaScript files based on their module system (ES Modules vs. CommonJS), `languageOptions.sourceType` was configured:

*   **Default**: A general configuration for `**/*.{js,mjs,cjs}` sets `sourceType: "module"` as the baseline.
*   **CommonJS Override**: A more specific configuration targets application `.js` files (e.g., in `controllers/`, `services/`, `utils/`, but excluding `eslint.config.mjs` and test files) and sets `sourceType: "commonjs"`, as these files use `require()` and `module.exports`.
*   **Jest Test Files**: Test files were also configured with `sourceType: "commonjs"`, aligning with the typical Node.js and Jest setup where tests use `require()`.
*   **`eslint.config.mjs`**: Explicitly confirmed as `sourceType: "module"` as it uses ES module `import`/`export` syntax.

This structured approach to ESLint configuration ensures accurate linting for JavaScript code, proper integration with Jest, and avoids errors from attempting to lint incompatible file types.
