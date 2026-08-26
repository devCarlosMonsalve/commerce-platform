# Commerce Platform

A modern, multi-tenant SaaS platform for managing commerce operations — products, customers, orders, analytics, and AI-powered workflows.

## Architecture

```
commerce-platform/
├── apps/
│   ├── api/          # NestJS backend API
│   └── web/          # Next.js frontend
├── packages/
│   └── types/        # Shared TypeScript types
├── docker-compose.yml
├── turbo.json
└── package.json
```

## Tech Stack

| Layer      | Technology       |
|------------|-----------------|
| Frontend   | Next.js 14 (App Router) + TypeScript |
| Backend    | NestJS + TypeScript |
| Database   | PostgreSQL 16 |
| ORM        | Prisma |
| Monorepo   | Turborepo + npm workspaces |
| Dev infra  | Docker Compose |

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Docker & Docker Compose

### 1. Install dependencies

```bash
npm install
```

### 2. Start the database

```bash
docker-compose up -d
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env as needed
```

### 4. Generate Prisma client

```bash
npm run db:generate
```

### 5. Run database migrations

```bash
npm run db:migrate
```

### 6. Start development servers

```bash
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs (Swagger)**: http://localhost:3001/api/docs
- **PgAdmin**: http://localhost:5050

## Project Structure

### Backend (`apps/api`)

- `src/health/` — Health check endpoint
- `src/tenants/` — Multi-tenant organization management
- `src/products/` — Product catalog management
- `src/customers/` — Customer management
- `src/orders/` — Order management
- `src/prisma/` — Database client (Prisma)

### Frontend (`apps/web`)

- `src/app/` — Next.js App Router pages
- `src/app/dashboard/` — Main dashboard

### Shared (`packages/types`)

- Shared TypeScript interfaces for Tenant, User, Product, Customer, Order, and API responses

## Planned Features

- [ ] Authentication & JWT
- [ ] Role-based access control (RBAC)
- [ ] Product catalog management UI
- [ ] Customer management UI
- [ ] Order management UI
- [ ] Analytics dashboards
- [ ] AI-powered workflows & natural language commands
- [ ] Third-party integrations (Stripe, Shopify, etc.)
- [ ] Webhooks
- [ ] Multi-currency support
A multi-tenant platform for managing commerce operations, customers, products, orders, and AI-powered workflows.
