# backend-mmp

Backend API for **Commerce Platform** — built with NestJS, Prisma, and PostgreSQL.

[![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## Architecture

Clean Architecture + DDD organized as a modular monolith.

```
src/
├── auth/              # JWT authentication
├── organizations/     # Tenants + memberships
├── products/          # Product catalog
├── customers/         # Customer management
├── orders/            # Order lifecycle
├── health/            # Health check endpoint
├── shared/            # Guards, decorators, interceptors
└── prisma/            # Database service
```

Each module follows: `domain/` → `application/` → `infrastructure/`

---

## Getting Started

### Prerequisites
- Node.js v20+
- Docker + Docker Compose

### Setup

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your values

# 4. Run migrations
npx prisma migrate dev

# 5. Start development server
npm run start:dev
```

API available at: `http://localhost:3000/api`

Health check: `http://localhost:3000/api/health`

---

## API Endpoints

| Module | Base Path |
|---|---|
| Auth | `/api/auth` |
| Organizations | `/api/organizations` |
| Products | `/api/organizations/:orgId/products` |
| Customers | `/api/organizations/:orgId/customers` |
| Orders | `/api/organizations/:orgId/orders` |

---

## Scripts

```bash
npm run start:dev     # Development with hot-reload
npm run build         # Production build
npm run start:prod    # Production server
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npx prisma studio     # Database GUI
```
