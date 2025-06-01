# F1 App - High Level System Architecture

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

## Components Overview


- **iOS App**: Native SwiftUI application for mobile users
- **Web Browser**: Potential web interface for future expansion

### 2. Backend Layer
- **API Gateway**: Entry point for all client requests
- **Controllers**: Route handling and request validation
- **Services**: Core business logic implementation
- **Scheduled Jobs**: Automated tasks (e.g., Champion Data Refresh)
- **Repositories**: Data access abstraction
- **Cache Layer**: Performance optimization

### 3. Data Layer
- **PostgreSQL**: Primary database for application data
- **Ergast API**: External source for F1 historical data

### 4. Infrastructure
- **Docker**: Containerization for consistent environments
- **CI/CD**: Automated testing and deployment pipeline
- **Monitoring**: System health and performance tracking

## Data Flow
1. Clients make HTTP requests to the API Gateway
2. Controllers validate and route requests to appropriate services
3. Services implement business logic and coordinate data access
4. Repositories handle data operations with the database and cache
5. External API calls are made to Ergast when needed
6. Responses are formatted and returned to clients

## Key Features
- RESTful API architecture
- Background job processing
- Caching for improved performance
- Comprehensive testing coverage (>99%)
- Containerized deployment