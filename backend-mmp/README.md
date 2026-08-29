# Commerce Platform API

NestJS API for the Commerce Platform multi-tenant SaaS. It centralizes
organization-scoped products, customers, sales orders, suppliers, purchase
orders, and goods receipts; it is not a public e-commerce storefront.

## Setup

Start PostgreSQL from the repository root, then configure and run this service:

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run start:dev
```

The API runs at `http://localhost:3001/api`. The health check is `GET http://localhost:3001/api/health`.

## Environment

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `PORT` | API port; defaults to the local convention `3001` |
| `CORS_ORIGIN` | Allowed frontend origin(s); normally `http://localhost:3000` |

The database URL password must be URL encoded. For example, write `%23` instead of `#`.

## API conventions

Protected endpoints accept either:

```http
Cookie: access_token=...
```

or:

```http
Authorization: Bearer <jwt>
```

Successful responses use:

```json
{ "success": true, "data": {}, "message": "optional" }
```

Errors use:

```json
{ "success": false, "statusCode": 400, "message": "message", "path": "/api/...", "timestamp": "..." }
```

Organization routes require an active membership for the requested `:orgId`.
Create, update, delete, lifecycle, and receipt operations that need elevated
permissions are restricted to `OWNER` and `ADMIN`.

## Modules

| Module | Base path |
|---|---|
| Authentication | `/api/auth` |
| Organizations | `/api/organizations` |
| Products | `/api/organizations/:orgId/products` |
| Customers | `/api/organizations/:orgId/customers` |
| Orders | `/api/organizations/:orgId/orders` |
| Suppliers | `/api/organizations/:orgId/suppliers` |
| Purchase orders | `/api/organizations/:orgId/purchase-orders` |

## Business workflows

- **Sales orders:** validate that the customer and products belong to the
  organization, snapshot product information, calculate totals, and follow
  `DRAFT` -> `PENDING` -> `CONFIRMED` -> `COMPLETED`. Orders can be cancelled
  before completion.
- **Purchasing:** purchase orders reference organization suppliers and products.
  `POST /api/organizations/:orgId/purchase-orders/:purchaseOrderId/receipts`
  records partial or complete receipts and increases product stock.

## Architecture and persistence

The application is a modular monolith using pragmatic Clean Architecture. Each
business module separates:

```text
domain/          # Entities, domain errors, and repository contracts
application/     # DTOs and use cases
infrastructure/  # HTTP controllers and Prisma repositories
```

Controllers remain thin, use cases coordinate workflows, and Prisma access is
contained in infrastructure repositories. PostgreSQL 16 is accessed through
Prisma 6, which also manages migrations. Global validation, Helmet, an
exception filter, logging interceptor, and request throttling are enabled.

## Scripts

```bash
npm run start:dev  # Development server with hot reload
npm run build      # Production build
npm run start:prod # Production server
npm run test       # Unit tests
npm run test:e2e   # End-to-end tests
npx prisma studio  # Database GUI
```

For complete local setup, see [development documentation](../docs/development.md).
