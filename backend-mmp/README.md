# Commerce Platform API

NestJS API for the Commerce Platform multi-tenant SaaS.

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
| `CORS_ORIGIN` | Allowed frontend origin; normally `http://localhost:3000` |

The database URL password must be URL encoded. For example, write `%23` instead of `#`.

## API conventions

Protected endpoints require:

```http
Authorization: Bearer <access-token>
```

Successful responses use:

```json
{ "success": true, "data": {}, "message": "optional" }
```

Errors use:

```json
{ "success": false, "statusCode": 400, "message": "message", "path": "/api/...", "timestamp": "..." }
```

## Modules

| Module | Base path |
|---|---|
| Authentication | `/api/auth` |
| Organizations | `/api/organizations` |
| Products | `/api/organizations/:orgId/products` |
| Customers | `/api/organizations/:orgId/customers` |
| Orders | `/api/organizations/:orgId/orders` |

The application is a modular monolith using pragmatic Clean Architecture: `domain/`, `application/`, and `infrastructure/` within each business module.

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
