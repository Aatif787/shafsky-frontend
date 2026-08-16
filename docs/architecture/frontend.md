# Frontend Architecture — Shafsky Aviation Concierge Platform

## Overview
The Shafsky Aviation frontend is a high-performance, responsive React application built with TanStack Router, TanStack Start, and Vite. It serves as the primary concierge and booking interface for VIP airport assistance, air ticketing, private charters, and diplomatic travel support.

## Core Architectural Layering

```
src/
├── lib/
│   ├── api/                 # Canonical HTTP Clients (client.ts, bookingApi, flightApi, airportApi)
│   └── catalog/             # Master Service & Package Catalog Types & ID Normalization
├── components/
│   ├── booking/
│   │   ├── BookingWorkflowResolver.tsx  # Workflow Dispatcher
│   │   ├── config/          # Service descriptors & requirements
│   │   └── workflows/       # Domain Workflows (Airport, Ticketing, Hotel, Visa, Cargo)
│   └── views/
│       └── BookingView.tsx  # Root Booking Page Composer
└── hooks/
    └── useBookingState.ts   # Client Draft State Persistence
```

## Key Architecture Principles
1. **Canonical API Client Boundary**: All HTTP calls flow through `src/lib/api/client.ts` with standardized timeout management, error envelopes, and authentication headers.
2. **Explicit Catalog Identities**: String fuzzy matching (`contains("meet")`) is replaced with strongly-typed `ServiceId`, `AirportPackageId`, and `WorkflowType` enums.
3. **Workflow Resolver**: `BookingWorkflowResolver` isolates workflow selection from root page rendering.
4. **Display-Only Pricing**: All pricing displayed on the frontend is an estimate. Authoritative quotes and binding totals originate from the FastAPI backend.
