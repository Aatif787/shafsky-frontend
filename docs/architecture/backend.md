# Backend Architecture — Shafsky Aviation Concierge Engine

## Overview
The Shafsky Aviation backend is a Python 3.11+ FastAPI application featuring SQLAlchemy ORM, PostgreSQL persistence, and Redis caching. It enforces enterprise business rules, authoritative pricing calculations, and multi-tenant security controls.

## Application Architecture

```
app/
├── routers/              # Thin HTTP Routers (booking_router.py, airport_router.py, etc.)
├── services/             # Application & Business Logic (booking_service.py, price_engine.py)
├── models/               # SQLAlchemy Domain Entities (schema.py, airport.py, journey_models.py)
├── schemas/              # Pydantic Request/Response DTOs
└── security/             # JWT, Auth Dependencies, CSRF, and CORS Middleware
```

## Key Architectural Guarantees
1. **Thin Router Pattern**: Routers handle schema validation and HTTP responses, delegating all domain logic to Application Services.
2. **Authoritative Price Engine**: Package pricing and passenger multipliers are evaluated server-side.
3. **Structured Error Handling**: Centralized exception handlers map domain exceptions to standardized JSON error responses.
