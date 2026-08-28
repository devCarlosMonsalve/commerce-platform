<div align="center">

# Commerce Platform

**A multi-tenant SaaS platform for centralized commerce operations.**

Manage organizations, products, customers, and orders from one place.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16.x-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)

</div>

## Vision

Commerce Platform is not an e-commerce storefront. It is a Commerce Command Center:

> **MANAGE -> MONITOR -> UNDERSTAND -> ACT**

It is designed as a modular, multi-tenant SaaS application. Each organization owns and isolates its products, customers, orders, and memberships.

## Current MVP status

| Area | Status |
|---|---|
| Backend API | Authentication, organizations, memberships, products, customers, and orders |
| Authorization | JWT, organization membership validation, and role-based access control |
| Frontend | Internationalized landing, authentication, active organization selection, dashboard, products, customers, and orders |
| Order lifecycle | Customer validation, historical product snapshots, and `DRAFT` -> `PENDING` -> `CONFIRMED` -> `COMPLETED` transitions |
| Quality | Core order-domain tests; OpenAPI/Swagger documentation remains pending |

## Technology

| Layer | Technology |
|---|---|
| Backend | NestJS 11, TypeScript, Prisma 6 |
| Database | PostgreSQL 16 in Docker Compose |
| Frontend | Next.js 16, Material UI, Tailwind CSS, next-intl |
| Authentication | JWT |

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

See [local development](docs/development.md) for the complete environment configuration.

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

Successful API responses follow `{ success: true, data, message? }`. Errors follow a consistent `{ success: false, statusCode, message, path, timestamp }` format.

## Project structure

```text
commerce-platform/
├── backend-mmp/            # NestJS API
├── frontend-mmp/           # Next.js application
├── docs/                   # Architecture and development documentation
└── docker-compose.yml      # Local PostgreSQL
```

The backend follows pragmatic Clean Architecture and DDD within a modular monolith. Read [project context](docs/project-context.md) for the domain vision and constraints.
