# System Architecture Diagrams

## High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Web[React Frontend<br/>Next.js 14+]
        Mobile[Mobile App<br/>Future]
    end

    subgraph "API Gateway & Load Balancer"
        Nginx[Nginx Reverse Proxy]
    end

    subgraph "Application Layer"
        Backend[Django REST API<br/>Gunicorn Workers]
        Channels[Django Channels<br/>WebSocket Server]
        Celery[Celery Workers<br/>Background Tasks]
    end

    subgraph "Data Layer"
        Postgres[(PostgreSQL<br/>Primary Database)]
        Redis[(Redis<br/>Cache & Queue)]
    end

    subgraph "External Services"
        Email[Email Service<br/>SMTP/SendGrid]
        SMS[SMS Service<br/>Twilio]
        Storage[File Storage<br/>AWS S3/Local]
    end

    Web --> Nginx
    Mobile --> Nginx
    Nginx --> Backend
    Nginx --> Channels
    Backend --> Postgres
    Backend --> Redis
    Channels --> Redis
    Celery --> Redis
    Celery --> Postgres
    Backend --> Email
    Backend --> SMS
    Backend --> Storage
```

## Component Architecture

```mermaid
graph TB
    subgraph "Django REST Framework"
        Views[API Views<br/>ViewSets]
        Serializers[Data Serializers<br/>Validation]
        Permissions[Custom Permissions<br/>Role-based Access]
        Authentication[JWT Authentication<br/>Token Management]
    end

    subgraph "Business Logic"
        Models[Django Models<br/>Database Schema]
        Managers[Model Managers<br/>Query Logic]
        Services[Business Services<br/>Domain Logic]
        Utils[Utility Functions<br/>Helpers]
    end

    subgraph "Data Access"
        ORM[Django ORM<br/>Query Building]
        Migrations[Database Migrations<br/>Schema Evolution]
        Cache[Redis Cache<br/>Performance]
    end

    Views --> Serializers
    Views --> Permissions
    Views --> Authentication
    Serializers --> Models
    Models --> Managers
    Managers --> ORM
    ORM --> Migrations
    Services --> Models
    Utils --> Services
    Cache --> ORM
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant Client
    participant Nginx
    participant Django
    participant Auth
    participant DB
    participant Cache
    participant Celery

    Client->>Nginx: HTTP Request
    Nginx->>Django: Forward Request

    Django->>Auth: Validate JWT Token
    Auth-->>Django: Token Valid

    Django->>Cache: Check Cache
    Cache-->>Django: Cache Miss

    Django->>DB: Query Data
    DB-->>Django: Return Data

    Django->>Cache: Store in Cache
    Django->>Client: JSON Response

    Django->>Celery: Queue Background Task
    Celery->>DB: Process Task
    Celery->>Client: Send Notification (WebSocket)
```

## Security Architecture

```mermaid
graph TB
    subgraph "Network Security"
        Firewall[Firewall<br/>IP Filtering]
        SSL[TLS/SSL<br/>Encryption]
        CORS[CORS<br/>Cross-Origin Protection]
    end

    subgraph "Application Security"
        Auth[JWT Authentication<br/>Token-based]
        RBAC[Role-Based Access Control<br/>Permissions]
        Validation[Input Validation<br/>Sanitization]
        Audit[Audit Logging<br/>Compliance]
    end

    subgraph "Data Security"
        Encryption[Data Encryption<br/>At Rest/Transit]
        Masking[Data Masking<br/>PII Protection]
        Backup[Encrypted Backups<br/>Recovery]
    end

    subgraph "Monitoring"
        Logging[Security Logging<br/>Intrusion Detection]
        Alerts[Real-time Alerts<br/>Anomaly Detection]
        Compliance[Compliance Monitoring<br/>Regulatory]
    end

    Firewall --> Auth
    SSL --> Auth
    CORS --> Auth
    Auth --> RBAC
    RBAC --> Validation
    Validation --> Audit
    Audit --> Encryption
    Encryption --> Masking
    Masking --> Backup
    Backup --> Logging
    Logging --> Alerts
    Alerts --> Compliance
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        LocalDev[Local Development<br/>Docker Compose]
    end

    subgraph "Staging"
        Staging[Staging Environment<br/>Docker + Nginx]
    end

    subgraph "Production"
        LoadBalancer[Load Balancer<br/>Nginx/Haproxy]
        AppServers[Application Servers<br/>Docker + Gunicorn]
        Database[Database Cluster<br/>PostgreSQL + Redis]
        Monitoring[Monitoring Stack<br/>Prometheus + Grafana]
        Backup[Backup System<br/>Automated Backups]
    end

    LocalDev --> Staging
    Staging --> Production

    LoadBalancer --> AppServers
    AppServers --> Database
    AppServers --> Monitoring
    Database --> Backup
    Monitoring --> Alerts[Alerting System]
```

## API Architecture

```mermaid
graph LR
    subgraph "API Layers"
        Router[URL Router<br/>Django URLs]
        Middleware[Middleware<br/>CORS, Auth, etc.]
        Throttling[Throttling<br/>Rate Limiting]
        Permissions[Permissions<br/>Access Control]
        Views[Views/ViewSets<br/>Business Logic]
        Serializers[Serializers<br/>Data Transformation]
        Models[Models<br/>Data Access]
    end

    subgraph "Request Flow"
        Request[HTTP Request] --> Router
        Router --> Middleware
        Middleware --> Throttling
        Throttling --> Permissions
        Permissions --> Views
        Views --> Serializers
        Serializers --> Models
        Models --> Response[HTTP Response]
    end

    subgraph "Response Flow"
        Models --> Serializers
        Serializers --> Views
        Views --> Permissions
        Permissions --> Throttling
        Throttling --> Middleware
        Middleware --> Response
    end
```

## Database Architecture

```mermaid
graph TB
    subgraph "Database Server"
        Postgres[(PostgreSQL 15<br/>Primary)]
        Replica[(Read Replicas<br/>Optional)]
        Backup[(Backup Server<br/>Point-in-time)]
    end

    subgraph "Connection Pooling"
        PGBouncer[PGBouncer<br/>Connection Pooler]
    end

    subgraph "Caching Layer"
        Redis[(Redis Cluster<br/>Cache & Sessions)]
    end

    subgraph "Application"
        ORM[Django ORM<br/>Query Builder]
        Migrations[Django Migrations<br/>Schema Management]
    end

    ORM --> PGBouncer
    PGBouncer --> Postgres
    PGBouncer --> Replica
    ORM --> Redis
    Migrations --> Postgres
    Postgres --> Backup
```

## Asynchronous Task Architecture

```mermaid
graph TB
    subgraph "Task Producers"
        API[Django API<br/>HTTP Requests]
        WebSocket[Django Channels<br/>Real-time Events]
        Scheduled[Celery Beat<br/>Scheduled Tasks]
    end

    subgraph "Message Broker"
        Redis[(Redis<br/>Message Queue)]
    end

    subgraph "Task Consumers"
        Worker1[Celery Worker 1<br/>Email Tasks]
        Worker2[Celery Worker 2<br/>Report Generation]
        Worker3[Celery Worker 3<br/>Data Processing]
    end

    subgraph "Task Results"
        Backend[(Result Backend<br/>Redis)]
        Database[(Database<br/>Task Status)]
    end

    API --> Redis
    WebSocket --> Redis
    Scheduled --> Redis

    Redis --> Worker1
    Redis --> Worker2
    Redis --> Worker3

    Worker1 --> Backend
    Worker2 --> Backend
    Worker3 --> Backend

    Backend --> Database
```

## Monitoring & Observability

```mermaid
graph TB
    subgraph "Application Metrics"
        Django[Django Metrics<br/>Response Times, Errors]
        Database[Database Metrics<br/>Query Performance, Connections]
        System[System Metrics<br/>CPU, Memory, Disk]
    end

    subgraph "Monitoring Stack"
        Prometheus[Prometheus<br/>Metrics Collection]
        Grafana[Grafana<br/>Visualization]
        AlertManager[AlertManager<br/>Alerting]
    end

    subgraph "Logging"
        AppLogs[Application Logs<br/>Structured Logging]
        AccessLogs[Access Logs<br/>Nginx Logs]
        ErrorLogs[Error Logs<br/>Exception Tracking]
        ELK[ELK Stack<br/>Log Aggregation]
    end

    subgraph "Health Checks"
        APIHealth[API Health Checks<br/>Endpoint Monitoring]
        DBHealth[Database Health<br/>Connection Checks]
        ServiceHealth[Service Health<br/>Dependency Checks]
    end

    Django --> Prometheus
    Database --> Prometheus
    System --> Prometheus

    Prometheus --> Grafana
    Prometheus --> AlertManager

    AppLogs --> ELK
    AccessLogs --> ELK
    ErrorLogs --> ELK

    APIHealth --> Prometheus
    DBHealth --> Prometheus
    ServiceHealth --> Prometheus
```

---

*Architecture diagrams for the CHELAL Hospital Management System as of September 27, 2025.*
