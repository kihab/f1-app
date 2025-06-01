# CI/CD Pipeline Plan & Documentation

## Overview

This document details the CI/CD strategy and pipeline decisions for the **F1 World Champions** project. It records both required and optional steps, as well as the rationale for key decisions—especially for reviewers evaluating the assignment.

---

## Pipeline Goals & Assignment Requirements

* **Automated CI/CD pipeline** using GitHub Actions
* **Backend Pipeline**: install → lint → test → build (Node.js/Express API)
* **iOS Pipeline**: build → test → enforce coverage (SwiftUI app)
* Reject/fail the pipeline on test or lint error
* Enforce minimum test coverage (≥ 85% for backend, ≥ 70% for iOS)
* Optional: Security scan, image push, deployment to cloud

---

## Monorepo Pipeline Strategy

* The codebase is a **mono-repo**:
  * `/backend` (Node.js/Express API, fully Dockerized and tested)
  * `/frontend` (iOS native SwiftUI app with comprehensive test coverage)
  * `/infrastructure` (Docker Compose, infra scripts)
* **Implementation**:
  * Backend pipeline runs on Linux (Ubuntu)
  * iOS pipeline runs on macOS (macOS 15 with Xcode 16.2)
  * Both pipelines run in parallel on push/PR to main/master branches
----
## CI/CD Pipeline Design: Parallel Jobs

Our pipeline is implemented as two parallel GitHub Actions jobs:

1. **Backend Job (`backend-ci`)**
   - Runs on Ubuntu-latest runner
   - Handles Node.js/Express API pipeline
   - Uses Node.js v20
   - Runs in parallel with iOS job

2. **iOS Job (`ios-ci`)**
   - Runs on macOS-15 runner
   - Handles iOS app pipeline
   - Uses Xcode 16.2
   - Runs in parallel with backend job

**Benefits:**
- Parallel execution of backend and iOS pipelines
- Better utilization of CI resources
- Clear separation of concerns between platforms
- Each job can be configured with platform-specific requirements

---

## Pipeline Stages

### Backend Pipeline
1. **Trigger:** On push or PR to main branches
2. **Setup:** Set up Node.js v20 environment
3. **Install:** Install dependencies using npm ci
4. **Audit:** Run npm audit with high severity threshold
5. **Lint:** Run ESLint for code style and static analysis
6. **Test:** Run Jest tests (fail if any test fails)
7. **Coverage:** Enforce 80% minimum coverage (lines, statements, functions, branches)
8. **Build:** Build Docker image (do not push yet)
9. **Optional (future):** Security scan, Docker image push, deploy to cloud

### iOS Pipeline
1. **Trigger:** On push or PR to main branches
2. **Setup:** Install Xcode 16.2 and configure environment
3. **Lint:** Run SwiftLint for code style checking
4. **Test:** Build and test app on iPhone 16 simulator (iOS 18.2)
5. **Coverage:** Enforce 70% minimum line coverage
6. **Artifacts:** Upload test results bundle (.xcresult)
7. **Future:** Add UI testing, code signing, and deployment to TestFlight

---

## Pipeline Stages Flow

### Backend Pipeline
```
┌────────────┐     ┌───────────────┐     ┌─────────────────┐
│  Checkout  │────▶│  Set up Node  │────▶│  Install Deps   │
│    Code    │     │    (v20)      │     │   (npm ci)      │
└────────────┘     └───────────────┘     └────────┬────────┘
                                                   │
                                                   ▼
┌────────────┐     ┌───────────────┐     ┌─────────────────┐
│   Build    │◀────│  Run Tests   │◀────│  Audit & Lint   │
│Docker Image│     │  (npm test)  │     │     Code        │
└────────────┘     └───────────────┘     └─────────────────┘
        │
        │          ┌ - - - - - - - - - - - - - - - - - - - ┐
        └ - - - - ▶│       Future Steps (Optional)        │
                   │  • Push Image to Registry            │
                   │  • Deploy to Cloud                   │
                   │  • Security Scanning                 │
                   └ - - - - - - - - - - - - - - - - - - - ┘
```

### iOS Pipeline
```
┌─────────────┐     ┌──────────────────┐     ┌────────────────────┐
│   Checkout  │────▶│  Set up Xcode    │────▶│  Build & Test on   │
│    Code     │     │   (16.2)         │     │  iOS Simulator     │
└─────────────┘     └──────────────────┘     └────────┬────────────┘
                                                      │
                                                      ▼
┌─────────────────┐     ┌──────────────────┐     ┌────────────────────┐
│  Upload Test    │◀────│  Enforce 70%     │◀────│  Generate Test     │
│  Results        │     │  Code Coverage   │     │  Results Bundle    │
└─────────────────┘     └──────────────────┘     └────────────────────┘
        │
        │          ┌ - - - - - - - - - - - - - - - - - - - - - - ┐
        └ - - - - ▶│           Future Steps (Planned)                │
                   │  • UI Testing                              │
                   │  • Code Signing                            │
                   │  • Deploy to TestFlight                    │
                   └ - - - - - - - - - - - - - - - - - - - - - - ┘
```

### Combined Pipeline Execution
```
┌─────────────────────────────────────────────────────────────────────────┐
│                        GitHub Actions Workflow                          │
│  ┌───────────────────────┐        ┌───────────────────────────┐  │
│  │     Backend Job       │        │        iOS Job            │  │
│  │  (Ubuntu Runner)       │        │    (macOS 15 Runner)      │  │
│  │                       │        │                           │  │
│  │  • Checkout Code       │        │  • Checkout Code          │  │
│  │  • Setup Node.js       │        │  • Setup Xcode 16.2       │  │
│  │  • Install Dependencies│        │  • Install SwiftLint      │  │
│  │  • Audit Dependencies  │        │  • Run SwiftLint          │  │
│  │  • Run Linter         │        │  • Build & Test           │  │
│  │  • Run Tests          │        │  • Enforce 70% Coverage   │  │
│  │  • Enforce 80% Coverage│        │  • Archive Test Results   │  │
│  │  • Build Docker Image │        │                           │  │
│  └──────────┬────────────┘        └────────────┬──────────────┘  │
│             │                                    │                 │
│             └────────────────┬───────────────────┘                 │
│                              ▼                                     │
│                    Combined Status Report                          │
└───────────────────────────────────────────────────────────────────┘
```

The pipeline automatically runs on pushes to main/master branches and on pull requests targeting these branches. Both jobs run in parallel, ensuring efficient resource utilization while maintaining code quality standards. The backend pipeline enforces 80% coverage across lines, statements, functions, and branches, while the iOS pipeline enforces 70% line coverage.

---

## Linting: Local and CI/CD Setup

* **Linter chosen:** ESLint (standard for Node/JavaScript/TypeScript)
* **Rationale:** No built-in linter in Node, so ESLint is required for both local and CI linting (similar to SwiftLint for iOS).

* **ESLint will be run as part of the pipeline.**

---

## Test Coverage Gating

* **Jest** is used for all backend tests (see TESTING.md for details).
* **Fail pipeline if coverage < 20%** (to be raised as code matures, up to 70%).


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

## iOS CI/CD Implementation

### Key Features
- **Automated Build and Test**: Every push or pull request to main/master triggers the workflow
- **Xcode 16.2 Environment**: Always runs on the latest stable Xcode for full iOS 18 compatibility
- **Unit Test Execution**: All unit tests run headlessly on the iOS Simulator (iPhone 16, iOS 18.2)
- **Coverage Enforcement**: Build fails if total code coverage drops below 70%
- **Test Results Artifact**: Each run uploads the `.xcresult` bundle for detailed inspection in Xcode
- **Step-by-Step Error Logging**: Clear output of results and errors for immediate issue identification

### Implementation Details
- **Runner**: macOS 15 with Xcode 16.2
- **Test Environment**: iPhone 16 Simulator (iOS 18.2)
- **Artifacts**: Test results are archived and available for download
- **Coverage**: Enforced at 70% minimum

### Future Improvements
- Add test result summary in PR comments
- Enable parallel test execution on multiple devices/iOS versions
- Integrate with coverage dashboards (Codecov, SonarCloud)
- Add dependency caching for SPM/CocoaPods when available
- Automate UI test screenshots/videos for failed tests
- Advanced notifications (Slack, Teams, email alerts)

---

## Next Steps

### Backend
- Add security scanning (CodeQL, Snyk, Trivy)
- Push Docker image to registry
- Deploy to cloud provider (Render, Railway, Fly.io)
- Add coverage badge to README

### iOS
- Implement UI testing
- Set up code signing and provisioning
- Add TestFlight deployment
- Implement Fastlane for release automation

### General
- Monitor and optimize pipeline execution time
- Add caching for dependencies
- Implement branch protection rules
- Add environment-specific configurations

---

**This file will be updated as our pipeline evolves.**
