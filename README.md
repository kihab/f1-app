# 🏎️ Formula 1 World Champions App

A full-stack application that showcases Formula 1 World Champions and race results. This project demonstrates modern full-stack development skills including API design, database modeling, automated testing, CI/CD, and native iOS development.

## 🚀 Features

### Backend
- **RESTful API** built with Node.js and Express
- **PostgreSQL** database with Prisma ORM for type-safe database access
- **Redis** caching layer for improved performance
- **Docker** containerization for consistent development and deployment
- **Automated Testing** with comprehensive test coverage
- **Swagger/OpenAPI** documentation for all API endpoints
- **Scheduled Jobs** for refreshing champion data

### iOS App (SwiftUI)
- Native iOS application with support for all iPhone screen sizes
- Clean, intuitive user interface following Apple's Human Interface Guidelines
- Responsive design
- Comprehensive error handling and loading states

## 🏗️ System Architecture

```mermaid
graph TD
    %% Client Layer
    subgraph "Client Layer"
        FE["iOS App<br/>(SwiftUI)"]
        WEB["Web Browser<br/>(Potential Future)"]
    end

    %% Backend Layer
    subgraph "Backend Layer"
        API["API Gateway<br/>(Express)"]
        
        subgraph "Application Layer"
            CTL["Controllers"]
            SRV["Services"]
            JOB["Scheduled Jobs"]
        end
        
        subgraph "Data Access"
            REPO["Repositories"]
            CACHE["Cache Layer"]
        end
    end

    %% Data Layer
    subgraph "Data Layer"
        DB["PostgreSQL<br/>(Primary Data)"]
        ERGAST["Ergast API<br/>(External F1 Data)"]
    end

    %% Infrastructure
    subgraph "Infrastructure"
        DOCKER["Docker Containers"]
        CI_CD["CI/CD Pipeline"]
        MON["Monitoring & Logging"]
    end

    %% Connections
    FE -->|REST/JSON| API
    WEB -->|HTTP| API
    
    API --> CTL
    CTL <--> SRV
    SRV <--> REPO
    REPO <--> DB
    REPO <-->|Cache Operations| CACHE
    SRV <-->|Fetch Data| ERGAST
    
    JOB -->|Update Data| SRV
    
    %% Styling
    classDef client fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
    classDef backend fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef data fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef infra fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px
    
    class FE,WEB client
    class API,CTL,SRV,JOB,REPO,CACHE backend
    class DB,ERGAST data
    class DOCKER,CI_CD,INFRA infra
```

*For a more detailed architecture diagram, see [High Level Architecture Flowchart](./backend/docs/diagrams/high_level_system_architecture_flowchart/high_level_system_architecture_flowchart.md)*

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Containerization**: Docker & Docker Compose
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest, Supertest
- **CI/CD**: GitHub Actions

### iOS App
- **Language**: Swift 5
- **UI Framework**: SwiftUI
- **Minimum iOS Version**: iOS 15.0+
- **Dependencies**: None (intentionally kept minimal)

## 🚀 Getting Started

### Prerequisites

- **For Backend**:
  - Docker Desktop (latest version)
  - Node.js 18+ (If only want to run BE separately without docker)
  - npm or yarn (If only want to run BE separately without docker)

- **For iOS**:
  - Xcode 14.0+
  - macOS 12.0+
  - iOS 15.0+ device or simulator

### Running the Backend

1. **Start All Services with Docker Compose**
   ```bash
   cd infrastructure
   docker-compose up -d --build
   ```
   This single command will:
   - Build the backend Docker image
   - Start PostgreSQL database with initial schema
   - Set up Redis cache
   - Run database migrations
   - Seed initial data
   - Start the backend server
   - Launch pgAdmin (available at http://localhost:8080)

2. **Access the Application**
   - API will be available at `http://localhost:3000`
   - Swagger UI at `http://localhost:3000/api-docs`
   - pgAdmin at `http://localhost:8080` (email: `admin@f1.com`, password: `adminpw123`)

5. **Access API Documentation**
   - Swagger UI: `http://localhost:3000/api-docs`
   - pgAdmin: `http://localhost:5050` (email: `admin@admin.com`, password: `admin`)

### Running the iOS App

1. Open the Xcode workspace:
   ```bash
   cd frontend/Formula1
   open Formula1.xcodeproj
   ```

2. Select a simulator or connect an iOS device

3. Press `Cmd + R` to build and run the app

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test --coverage
```

### iOS Tests
1. Open the Xcode project
2. Press `Cmd + U` to run all tests locally and see result and coverage report.

Also Test coverage reports are generated in the CI/CD pipeline and can be downloaded unpacked and opened in Xcode and viewed in the GitHub Actions artifacts.

## 📁 Project Structure

### Backend (`/backend`)
```
backend/
├── src/                      # Source code
│   ├── config/               # Configuration files
│   ├── controllers/          # Request handlers and route definitions
│   ├── dto/                  # Data Transfer Objects
│   ├── middleware/           # Express middleware
│   ├── models/               # Database models and schemas
│   ├── repositories/         # Data access layer
│   ├── routes/               # API route definitions
│   ├── services/             # Business logic
│   ├── utils/                # Utility functions and helpers
│   └── validators/           # Request validation
├── tests/                    # Test files with >99% coverage
│   ├── integration/          # Integration tests
│   ├── unit/                 # Unit tests
│   └── __mocks__/            # Mock data and utilities
├── prisma/                   # Database schema and migrations
└── docs/                     # Comprehensive documentation
    ├── diagrams/             # System architecture diagrams
    ├── api_design_decision.md
    ├── backend_initial_architecture_decision.md
    ├── caching_strategy.md
    ├── database_schema.md
    ├── dependencies.md
    ├── folder_structure.md
    ├── linting_setup_and_decisions.md
    ├── seeding_script.md
    ├── sync_seasons_cron_job.md
    └── testing_strategy.md
```

### iOS App (`/frontend/Formula1`)
```
Formula1/
├── Formula1/                # Main app code
│   ├── Models/              # Data models
│   ├── Views/               # SwiftUI views
│   ├── ViewModels/          # ViewModels for MVVM
│   ├── Services/            # Network and data services
│   ├── Utils/               # Extensions and helpers
│   ├── Resources/           # Assets, localization, etc.
│   └── App/                 # App entry point and main components
├── Formula1Tests/           # Unit tests
├── Formula1UITests/         # UI tests
└── docs/                    # iOS-specific documentation
    ├── diagrams/            # UI/UX flow diagrams
    ├── error_handling.md
    ├── folder_structure.md
    ├── frontend_initial_architecture_decision.md
    ├── ios_app_structure.md
    ├── mvvm.md
    ├── testing_strategy.md
    └── ui_design_guide.md
```

### Infrastructure (`/infrastructure`)
```
infrastructure/
├── docker/                  # Docker configuration files
│   ├── nginx/               # Nginx configuration
│   ├── postgres/            # PostgreSQL initialization scripts
│   └── redis/               # Redis configuration
├── docs/                    # Infrastructure documentation
│   ├── ci_cd_pipeline_plan.md
│   ├── cicd_pipeline_initial_architecture_decision.md
│   ├── containerization_initial_architecture_decision.md
│   ├── docker.md
│   ├── git_flow_strategy.md
│   └── screenshots/         # Infrastructure-related screenshots
└── docker-compose.yml        # Main Docker Compose configuration
```

### Documentation Structure
- **Backend Documentation**: Located in `/backend/docs`, contains comprehensive documentation about the backend architecture, API design, database schema, and implementation decisions.

- **iOS App Documentation**: Located in `/frontend/Formula1/Formula1/docs`, covers iOS app architecture, UI/UX decisions, and implementation details.

- **Infrastructure Documentation**: Located in `/infrastructure/docs`, focuses solely on infrastructure-related topics including Docker setup, CI/CD pipeline configuration, and deployment strategies.

**Note on Initial Architecture Decision Files**:
- Files named `*_initial_architecture_decision.md` document the initial research, trade-offs, and decision-making process at the start of the project.
- These files represent the initial thinking and may not reflect the final implementation.
- For current implementation details, refer to the other documentation files in each respective directory.

## 🔄 CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment. The pipeline includes:

1. **Backend Pipeline**:
   - Linting and formatting checks
   - Unit and integration tests
   - Test coverage reporting
   - Docker image building and pushing

2. **iOS Pipeline**:
   - Build and test on multiple iOS versions
   - Generate test coverage reports
   - Create test artifacts

View the pipeline status and logs in the [GitHub Actions](https://github.com/kihab/f1-app/actions) tab.

## 📚 Documentation

For more detailed documentation, please refer to:

- [API Documentation](./backend/docs/api_design_decision.md)
- [Database Schema](./backend/docs/diagrams/erd_database/erd_database_schema.md)
- [Testing Strategy](./backend/docs/testing_strategy.md)
- [CI/CD Pipeline](./infrastructure/docs/ci_cd_pipeline_plan.md)

    ---

Built by [Kihab](https://github.com/kihab)
