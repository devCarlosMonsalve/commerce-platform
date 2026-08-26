<div align="center">

# 🛒 Commerce Platform

**A multi-tenant SaaS platform for centralized commerce operations.**

Manage products, customers, orders, and teams — all from one place.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## 🌐 Vision

This is not just an e-commerce store.

The goal is a **Commerce Command Center** where businesses can:

> **MANAGE → MONITOR → UNDERSTAND → ACT**

- Manage products, catalogs, and inventory
- Manage customers and their orders
- Control teams and roles per organization
- Operate multiple tenants from a single platform
- Eventually interact with business data using natural language AI

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | NestJS 11 + TypeScript |
| **Database** | PostgreSQL 16 |
| **ORM** | Prisma 6 |
| **Auth** | JWT (passport-jwt) |
| **Infra** | Docker Compose |
| **Frontend** | Next.js *(coming soon)* |

---

## 🏗️ Architecture

The backend follows **Clean Architecture** with **Domain-Driven Design** principles, organized as a **modular monolith**.

```
src/
├── auth/                  # Authentication (register, login, JWT)
├── organizations/         # Tenants + memberships
├── products/              # Product catalog per organization
├── customers/             # Customer management per organization
├── orders/                # Order creation and lifecycle
├── shared/
│   ├── guards/            # JwtAuthGuard, OrganizationMemberGuard, RolesGuard
│   └── decorators/        # @CurrentUser, @CurrentMembership, @Roles
└── prisma/                # Global PrismaService
```

Each module follows this layered structure:

```
[module]/
├── domain/            # Entities + repository interfaces
├── application/       # Use cases + DTOs
└── infrastructure/    # Prisma repositories + controllers
```

### Request lifecycle

```
HTTP Request
  → JwtAuthGuard           ✦ valid token?
  → OrganizationMemberGuard ✦ member of this org?
  → RolesGuard             ✦ has required role?
  → Controller             ✦ thin, no business logic
  → Use Case               ✦ business rules live here
  → Repository Interface   ✦ domain abstraction
  → Prisma Repository      ✦ DB access
  → PostgreSQL
```

---

## 🗄️ Data Model

```
Organization
  └── Membership (User ↔ Organization, roles: OWNER / ADMIN / MEMBER)
  └── Product    (status: ACTIVE / INACTIVE, unique SKU per org)
  └── Customer
  └── Order      (status: DRAFT / PENDING / CONFIRMED / CANCELLED)
        └── OrderItem  (price locked at order time)
```

Multi-tenancy is enforced at every level — users can only access data within their own organizations.

---

## 🔐 Security

- JWT authentication on all protected routes
- Organization membership validated per request
- Role-based access control (OWNER / ADMIN / MEMBER)
- Backend calculates and validates all order totals — frontend is never trusted
- Prices locked at order creation time

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [Docker](https://www.docker.com/) + Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/devCarlosMonsalve/commerce-platform.git
cd commerce-platform
```

### 2. Start the database

```bash
docker compose up -d
```

### 3. Configure environment

```bash
cd backend-mmp
cp .env.example .env
# Edit .env with your values
```

### 4. Install dependencies and run migrations

```bash
npm install
npx prisma migrate dev
```

### 5. Start the backend

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api`

---

## 📡 API Overview

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
```

### Organizations
```
GET    /api/organizations
POST   /api/organizations
GET    /api/organizations/:orgId
PATCH  /api/organizations/:orgId     (OWNER, ADMIN)
DELETE /api/organizations/:orgId     (OWNER)
```

### Products
```
GET    /api/organizations/:orgId/products
POST   /api/organizations/:orgId/products        (OWNER, ADMIN)
GET    /api/organizations/:orgId/products/:id
PATCH  /api/organizations/:orgId/products/:id    (OWNER, ADMIN)
DELETE /api/organizations/:orgId/products/:id    (OWNER, ADMIN)
```

### Customers
```
GET    /api/organizations/:orgId/customers
POST   /api/organizations/:orgId/customers
GET    /api/organizations/:orgId/customers/:id
PATCH  /api/organizations/:orgId/customers/:id
DELETE /api/organizations/:orgId/customers/:id
```

### Orders
```
GET    /api/organizations/:orgId/orders
POST   /api/organizations/:orgId/orders
GET    /api/organizations/:orgId/orders/:orderId
PATCH  /api/organizations/:orgId/orders/:orderId/status   (OWNER, ADMIN)
DELETE /api/organizations/:orgId/orders/:orderId          (OWNER, ADMIN)
```

---

## 🗺️ Roadmap

### ✅ Phase 1 — Foundation
- NestJS + Docker + PostgreSQL + Prisma

### ✅ Phase 2–5 — Core Modules
- Organizations, Users, Memberships, Products, Customers, Orders

### ✅ Phase 6 — Authorization
- JWT, multi-tenant guard, RBAC

### 🔜 Phase 7 — Quality
- Tests, Swagger docs, API improvements

### 🔜 Phase 8 — Intelligence
- AI natural language commands
- Analytics and reporting
- Third-party integrations

---

## 📁 Project Structure

```
commerce-platform/
├── backend-mmp/           # NestJS API
│   ├── prisma/            # Schema + migrations
│   └── src/               # Application source
├── frontend-mmp/          # Next.js frontend (coming soon)
├── docs/
│   └── project-context.md # Full architectural context
└── docker-compose.yml     # Local infrastructure
```

---

<div align="center">

Built with ❤️ by [devCarlosMonsalve](https://github.com/devCarlosMonsalve)

</div>

