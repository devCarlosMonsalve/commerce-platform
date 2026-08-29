<div align="center">

# Commerce Platform

**A multi-tenant SaaS platform for centralized commerce operations, built with DDD, Clean Architecture, and optional LLM assistance.**

Manage organizations, products, customers, sales orders, suppliers, and purchase orders from one place.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16.x-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)

</div>

## Vision

Commerce Platform is not an e-commerce storefront. It is a Commerce Command Center:

> **MANAGE -> MONITOR -> UNDERSTAND -> ACT**

It is designed as a modular, multi-tenant SaaS application. Each organization
owns and isolates its products, customers, sales orders, suppliers, and purchase
orders.

## Core engineering principles

### Multi-tenancy by design

`Organization` is the tenant boundary. Products, customers, sales orders,
suppliers, and purchase orders always belong to one organization. Every
organization-scoped request validates the authenticated user's membership and
filters data by `organizationId`, preventing data exposure between tenants.

### Pragmatic DDD and Clean Architecture

The backend is organized as a modular monolith by business domain. Important
modules use `presentation`, `application`, `domain`, and `infrastructure`
layers: controllers stay thin, use cases coordinate workflows, domain entities
protect business rules, and Prisma remains isolated in infrastructure
repositories. The domain does not depend on NestJS, HTTP, Prisma, or
PostgreSQL.

### Optional LLM integration

AI is an assistive, read-only capability rather than a system of record.
Google Gemini is the primary text-generation provider and OpenAI is invoked
only as a fallback. The global Operations Assistant drawer exposes explicit
summaries, guided searches, and purchase-review suggestions without allowing
the LLM to execute arbitrary queries, mutate data, or bypass tenant isolation.

## Current MVP status

| Area | Status |
|---|---|
| Backend API | Authentication, organizations, memberships, products, customers, sales orders, suppliers, and purchase orders |
| Authorization | httpOnly JWT cookie, organization membership validation, and role-based access control |
| Frontend | Internationalized landing, authentication, active organization selection, dashboard, products, customers, sales orders, suppliers, and purchase orders |
| Order lifecycle | Customer validation, historical product snapshots, and `DRAFT` -> `PENDING` -> `CONFIRMED` -> `COMPLETED` transitions |
| Purchasing | Partial or complete purchase receipts increase product stock |
| AI assistance | Optional right-side Operations Assistant for summaries, guided search, and purchase-review suggestions |
| Quality | Backend unit tests and frontend Playwright public-route tests; OpenAPI/Swagger documentation remains pending |

## Key business rules

- `Organization` is the tenant boundary. Organization-owned resources are
  accessed only after validating the user's membership.
- Users can belong to multiple organizations with `OWNER`, `ADMIN`, or `MEMBER`
  roles.
- Sales orders preserve historical product name, SKU, description, and unit-price
  snapshots, so product changes cannot alter past orders.
- Sales-order status transitions are domain controlled:
  `DRAFT` -> `PENDING` -> `CONFIRMED` -> `COMPLETED`, with cancellation
  available before completion.
- Purchase orders support partial receipts. Receipt quantities cannot exceed their
  ordered quantities, and saved receipts increase product stock.

## Technology

| Layer | Technology |
|---|---|
| Backend | NestJS 11, TypeScript, Prisma 6 |
| Database | PostgreSQL 16 in Docker Compose |
| Frontend | Next.js 16, Material UI, Tailwind CSS, next-intl |
| Authentication | JWT in an httpOnly cookie |
| AI connectors | Google Gemini primary, OpenAI fallback |

## Architecture

The repository is a modular monolith: the Next.js frontend and NestJS API are
separate applications, while the API is deployed as one backend. Important
backend modules follow pragmatic Clean Architecture:

```text
presentation -> application -> domain
                         ^
                  infrastructure
```

- Controllers receive HTTP input and delegate to use cases.
- Use cases coordinate authorization-aware workflows and domain behavior.
- Domain entities and repository contracts remain independent of NestJS and Prisma.
- Infrastructure repositories implement persistence through Prisma.
- `Organization` is the mandatory tenant boundary for every owned resource.

## Operational flows

1. A user registers, creates an organization, and becomes its `OWNER`.
2. Users may belong to multiple organizations; the selected active organization
   scopes all products, customers, orders, suppliers, and purchasing data.
3. Sales orders validate customer and product ownership, preserve product
   snapshots, and use controlled lifecycle transitions.
4. Purchase orders validate supplier and product ownership. Recorded receipts
   cannot exceed ordered quantities and increase product stock.

## Operations Assistant

AI is a secondary, opt-in capability in a global right-side drawer for
organization `OWNER` and `ADMIN` users. It never performs automatic requests,
creates records, changes stock, or changes order status.

Available assistance:

- Organization and route-contextual summaries based on aggregate metrics.
- Guided operational search limited to out-of-stock products, pending sales
  orders, and open purchase orders.
- Purchase-review suggestions for active products with stock at or below five
  units, including related open purchase orders.

Gemini is called first; OpenAI is used only if Gemini fails. AI failures are
contained in the drawer and do not block normal operational workflows. The
backend keeps tenant isolation by using fixed organization-scoped queries; it
does not allow AI-generated SQL, arbitrary filters, or mutations.

## Quick start

1. Start PostgreSQL:

   ```bash
   cp .env.example .env
   docker compose up -d
   ```

2. Run the backend on port `3001`:

   ```bash
   cd backend-mmp
   cp .env.example .env
   npm install
   npx prisma migrate dev
   npm run start:dev
   ```

3. Run the frontend on port `3000`:

   ```bash
   cd frontend-mmp
   cp .env.example .env.local
   npm install
   npm run dev
   ```

See the backend and frontend README files for local environment configuration.

## API overview

All protected endpoints require `Authorization: Bearer <token>`.

| Module | Base path |
|---|---|
| Health | `GET /api/health` |
| Authentication | `/api/auth` |
| Organizations | `/api/organizations` |
| Products | `/api/organizations/:orgId/products` |
| Customers | `/api/organizations/:orgId/customers` |
| Orders | `/api/organizations/:orgId/orders` |
| Suppliers | `/api/organizations/:orgId/suppliers` |
| Purchase orders | `/api/organizations/:orgId/purchase-orders` |
| AI verification | `GET /api/organizations/:orgId/ai/connectors/verify` |
| AI summary | `GET /api/organizations/:orgId/ai/operations-summary` |
| AI section summary | `GET /api/organizations/:orgId/ai/operations-summary/:section` |
| AI operational search | `POST /api/organizations/:orgId/ai/operations/search` |
| AI purchase suggestions | `GET /api/organizations/:orgId/ai/purchase-suggestions` |

Successful API responses follow `{ success: true, data, message? }`. Errors follow a consistent `{ success: false, statusCode, message, path, timestamp }` format.

Organization endpoints require authenticated membership for the `:orgId` route
parameter. Elevated mutations are restricted to organization `OWNER` and
`ADMIN` roles.

## Project structure

```text
commerce-platform/
├── backend-mmp/            # NestJS API
├── frontend-mmp/           # Next.js application
├── docs/                   # Architecture and development documentation
└── docker-compose.yml      # Local PostgreSQL
```

## Repository guides

- [Backend README](backend-mmp/README.md): API configuration, scripts, and AI
  connector details.
- [Frontend README](frontend-mmp/README.md): web application behavior and UI
  structure.

## Out of scope

The MVP intentionally excludes a public storefront, payments, invoices,
shipping, addresses, notifications, analytics, reporting, inventory movements,
complex permissions, autonomous AI agents, RAG, CQRS, event sourcing, message
brokers, and microservices.
