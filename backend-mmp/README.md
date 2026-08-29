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
| `OPENAI_API_KEY` | API key for the OpenAI text-generation connector |
| `OPENAI_MODEL` | OpenAI model; defaults to `gpt-4.1-mini` |
| `GEMINI_API_KEY` | API key for the Google Gemini text-generation connector |
| `GEMINI_MODEL` | Gemini model; defaults to `gemini-3.6-flash` |

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

## AI connectors

The `ai` module provides independently configurable OpenAI and Google Gemini
text-generation connectors behind a provider-neutral application contract.
Gemini is the primary provider; OpenAI is invoked only when Gemini fails.
Missing provider configuration fails explicitly rather than silently masking a
configuration problem.

`GET /api/organizations/:orgId/ai/connectors/verify` is a restricted
connectivity check for `OWNER` and `ADMIN` memberships. It sends the fixed,
non-business prompt `Reply with exactly: CONNECTION_OK` to Gemini first. OpenAI
is called only as a fallback if Gemini fails. The response identifies the
provider that generated the text. If both providers fail, the API returns a
service-unavailable error and detailed provider errors are written to the
backend log rather than the HTTP response.

`GET /api/organizations/:orgId/ai/operations-summary` lets an `OWNER` or
`ADMIN` explicitly generate a read-only dashboard summary. It reads only
tenant-filtered aggregate counts for products, sales orders, and purchase
orders, then passes those metrics to the connector. It never sends customer
details, user data, order contents, IDs, or financial values. The response
identifies the provider and model used to produce the summary.

Section-specific summaries use the same authorization and provider strategy:
`GET /api/organizations/:orgId/ai/operations-summary/products`,
`GET /api/organizations/:orgId/ai/operations-summary/sales-orders`, and
`GET /api/organizations/:orgId/ai/operations-summary/purchase-orders`. Each
prompt receives only the aggregate metrics belonging to its requested section.

`POST /api/organizations/:orgId/ai/operations/search` lets an `OWNER` or
`ADMIN` explicitly search current operational data. The connector may classify
only three supported queries: out-of-stock products, sales orders in `PENDING`,
or purchase orders in `ORDERED` or `PARTIALLY_RECEIVED`. The backend maps the
classification to fixed Prisma queries, each filtered by `organizationId`; it
does not permit generated SQL, arbitrary filters, mutations, or access to
another tenant's data.

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
