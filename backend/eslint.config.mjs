import js from "@eslint/js";
import globals from "globals";
// defineConfig is fine, it's a helper for intellisense and type checking
import { defineConfig } from "eslint/config";
import jestPlugin from "eslint-plugin-jest";

export default defineConfig([
  // 1. Global ignores: These patterns are excluded from linting altogether.
  {
    ignores: [
      "node_modules/",
      "coverage/",
      "prisma/migrations/",
      "docs/",
      "**/*.html",
      "**/*.css",
      "**/*.png",
      "**/*.gif",
      "**/*.jpg",
      "**/*.jpeg",
      "**/*.svg",
      "**/*.ico",
      "**/*.sql",
      "**/*.toml",
      "**/*.prisma",
      "**/*.info", // e.g., lcov.info
      "package.json",       // Often handled by specific formatters/linters if needed
      "package-lock.json",  // Generally not linted
      ".env",               // Add .env
      ".gitignore",         // Add .gitignore
      "Dockerfile",         // Add Dockerfile
      ".DS_Store",          // Ignore macOS system files
      // Add other specific files or patterns if needed
    ],
  },

  // 2. ESLint's recommended base JavaScript rules.
  // This applies to all matched JS files by default unless overridden.
  js.configs.recommended,

  // 3. Configuration for all JavaScript files (.js, .mjs, .cjs)
  // This sets the baseline environment and parsing options.
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module", // Default to ES modules; will be overridden for CommonJS .js files
      globals: {
        ...globals.node, // Make Node.js global variables available
      },
    },
    rules: {
      // You can add any project-wide custom rules here.
      // Example: "no-console": "warn", // Warn about console.log statements
    },
  },

  // 4. Specific override for .js files that are CommonJS (most backend files)
  // This excludes .mjs and .cjs, which have their own module system implications.
  // Also explicitly excludes test files, which are handled by the Jest config.
  {
    files: [
        "*.js", // Root .js files
        "controllers/**/*.js",
        "models/**/*.js",
        "routes/**/*.js",
        "services/**/*.js",
        "utils/**/*.js",
        "*.config.js", // e.g. jest.config.js if it's CommonJS
        "!eslint.config.mjs" // Ensure eslint.config.mjs is not caught here
    ],
    languageOptions: {
      sourceType: "commonjs", // Treat these .js files as CommonJS
    },
  },

  // 5. Configuration specifically for Jest test files
  {
    files: ["tests/**/*.{js,mjs,cjs}", "**/*.test.{js,mjs,cjs}", "**/*.spec.{js,mjs,cjs}"],
    plugins: {
      jest: jestPlugin,
    },
    // Apply Jest's recommended rules and specify Jest environment globals
    ...jestPlugin.configs['flat/recommended'], // Applies recommended Jest rules & plugin
    languageOptions: {
      // Test files can be CommonJS or ES Modules.
      // If your tests use `require/module.exports`, set to "commonjs".
      // If they use `import/export`, set to "module".
      // Assuming CommonJS for now as it's typical with Node.js/Jest setup.
      sourceType: "commonjs",
      globals: {
        ...globals.jest, // Add Jest global variables
        ...globals.node, // Tests run in Node.js environment
      },
    },
    rules: {
      ...jestPlugin.configs['flat/recommended'].rules,
      // You can override or add specific Jest rules here if needed
      // e.g., "jest/no-disabled-tests": "warn",
    }
  },
  // Ensure eslint.config.mjs itself is explicitly treated as a module.
  // This should be picked up by the "**/*.{js,mjs,cjs}" config with sourceType: "module"
  // but adding a specific entry can sometimes resolve load order issues.
  {
      files: ["eslint.config.mjs"],
      languageOptions: {
          sourceType: "module"
      }
  }
]);