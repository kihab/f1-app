# CI/CD Pipeline Plan & Documentation

## Overview

This document details the CI/CD strategy and pipeline decisions for the **F1 World Champions** project. It records both required and optional steps, as well as the rationale for key decisions—especially for reviewers evaluating the assignment.

---

## Pipeline Goals & Assignment Requirements

* **Automated CI/CD pipeline** using a free CI provider (GitHub Actions).
* Stages: **install → lint → test → build** (mandatory for Node backend).
* Reject/fail the pipeline on test or lint error.
* Enforce minimum test coverage (≥ 20% for MVP, will be increased later).
* Optional/nice-to-have: Security scan, image push, deployment to cloud.
* Deliverable: `.github/workflows/backend.yml` pipeline file, automated tests, and at least 70% test coverage for critical logic (to be achieved incrementally).

---

## Monorepo Pipeline Strategy

* The codebase is a **mono-repo**:

  * `/backend` (Node.js/Express API, fully Dockerized and tested)
  * `/frontend` (iOS native app; not Dockerized)
  * `/infrastructure` (Docker Compose, infra scripts)
* **Decision:** For CI/CD, we focus on a **single pipeline for the backend** (Node API), since iOS CI/CD requires Mac runners or paid services, which are not available on the GitHub free tier.
* **iOS pipeline is skipped** for now—see rationale below.

---

## MVP Pipeline Stages (Backend Only)

1. **Trigger:** On push or PR to main branches
2. **Install:** Install Node.js dependencies (npm ci)
3. **Lint:** Run ESLint to check code style and static analysis
4. **Test:** Run Jest tests (fail if any test fails)
5. **Coverage:** Enforce a minimum coverage threshold (fail if coverage < 20%)
6. **Build:** Build Docker image (do not push yet)
7. **Optional (future):** Security scan, Docker image push, deploy to Render/Railway/Fly.io

---

## Linting: Local and CI/CD Setup

* **Linter chosen:** ESLint (standard for Node/JavaScript/TypeScript)
* **Rationale:** No built-in linter in Node, so ESLint is required for both local and CI linting (similar to SwiftLint for iOS).

* **ESLint will be run as part of the pipeline.**

---

## Test Coverage Gating

* **Jest** is used for all backend tests (see TESTING.md for details).
* **Fail pipeline if coverage < 20%** (to be raised as code matures, up to 70%).
* To adjust later: Change the `--coverageThreshold` value in the workflow file (to 0.7 for 70%, etc.).

---

## Build Step

* Pipeline builds the Docker image for the backend.
* Does **not** push the image or deploy (MVP requirement only).

---

## Optional/Future Steps (To Add as Time Allows)

* Security scan (e.g. GitHub CodeQL, Snyk, Trivy)
* Push Docker image to public registry (e.g. Docker Hub, GitHub Packages)
* Deploy backend to a free-tier cloud (Render, Railway, Fly.io)
* Add coverage badge and/or reports to README

---

## Why iOS (Frontend) is Not Included in CI/CD

* iOS builds/tests require macOS runners (Xcode), which are not available on GitHub Actions free tier for mono-repos.
* Paid CI/CD for iOS (MacStadium, Bitrise, or GitHub macOS minutes) is outside the assignment’s scope.
* Manual iOS build/test is documented for local development.
* (A placeholder job can be added if required for completeness.)

---

## Next Steps (After MVP)

* Add optional steps as time allows.
* Increase test coverage and gating as code matures.
* Review pipeline speed and effectiveness.

---

**This file will be updated as our pipeline evolves.**
