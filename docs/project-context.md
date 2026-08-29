# Commerce Platform: Project Context

## Project Vision

Commerce Platform is a multi-tenant SaaS application for centralized commerce
operations. It is not an e-commerce storefront; it is an internal Commerce
Command Center that helps organizations manage their commercial information and
workflows from one place:

> MANAGE -> MONITOR -> UNDERSTAND -> ACT

The platform prevents product catalogs, customer information, sales orders,
suppliers, and purchasing activity from being scattered across spreadsheets or
unconnected tools. Each organization owns and isolates its data.

## Target Users

The platform is intended for small and medium-sized commercial organizations,
distributors, and their sales, administration, and purchasing teams. Users can:

- Manage products and customers.
- Create and manage sales orders.
- Manage suppliers and purchase orders.
- Record partial and complete goods receipts.
- Work in one or more organizations according to their memberships.

## Current Scope

The current MVP contains these domains:

- Identity and authentication
- Organizations and memberships
- Product catalog
- Customers
- Sales orders
- Suppliers
- Purchase orders and goods receipts

The following remain out of scope unless explicitly requested:

- Public e-commerce storefronts
- Payments, invoices, shipping, and addresses
- Notifications
- Analytics and reporting
- Categories and brands
- Complex permissions beyond organization membership and roles
- AI features, chat, RAG, agents, microservices, CQRS, event sourcing, and
  message brokers

## Architecture Overview

The project is a modular monolith with independent frontend and backend
applications:

```text
commerce-platform/
├── frontend-mmp/    # Next.js web application
├── backend-mmp/     # NestJS REST API
├── docs/            # Project and development documentation
└── docker-compose.yml
```

The frontend communicates with the backend through a REST API. The backend owns
business workflows and persistence, while PostgreSQL stores application data.
The API is exposed under the `/api` prefix.

## Frontend

The frontend is a TypeScript application built with:

- Next.js 16 and React 19
- Material UI and Tailwind CSS
- `next-intl` for Spanish, English, and French localization
- Axios for API communication
- Playwright for end-to-end tests of public routes

It is responsible for:

- Rendering the public landing page and authenticated application screens.
- User registration, login, logout, and unauthorized-session handling.
- Selecting and retaining the active organization.
- Providing the dashboard and interfaces for products, customers, sales orders,
  suppliers, and purchase orders.
- Handling loading, error, empty, and not-found states.
- Sending credentialed API requests with Axios.

`NEXT_PUBLIC_API_URL` configures the API base URL. The Axios client uses
`withCredentials` so the browser sends the authentication cookie with requests.

## Backend

The backend is a NestJS 11 application written in TypeScript. Its main
technologies are:

- NestJS and its module system
- Prisma 6 as the persistence layer
- PostgreSQL 16
- Passport JWT, `@nestjs/jwt`, and `bcryptjs`
- `class-validator` and `class-transformer`
- Helmet, cookie-parser, CORS, and throttling
- Jest and Supertest

Main modules:

- `auth`
- `organizations`
- `products`
- `customers`
- `orders`
- `purchasing`
- `prisma`
- `health`

Cross-cutting API behavior includes:

- JWT authentication stored in an httpOnly cookie.
- Credentialed CORS restricted to configured frontend origins.
- Global DTO validation with whitelisting and transformation.
- A global exception filter and logging interceptor.
- Global request throttling.
- Guards for JWT authentication, organization membership, and roles.
- Consistent API envelopes:
  - Success: `{ success: true, data, message? }`
  - Error: `{ success: false, statusCode, message, path, timestamp }`

## Modular Design, DDD, and Clean Architecture

The backend applies DDD and Clean Architecture pragmatically inside the business
modules. It remains a single deployable application, but each module has a
clear business responsibility and avoids unnecessary coupling.

The preferred module structure is:

```text
module/
├── domain/
│   ├── entities/
│   ├── repositories/
│   └── errors/
├── application/
│   ├── dtos/
│   └── use-cases/
└── infrastructure/
    ├── persistence/
    └── controllers/
```

Dependency direction is:

```text
Presentation -> Application -> Domain
                     ^
                     |
              Infrastructure
```

- Controllers receive HTTP requests, validate DTOs, invoke use cases, and return
  responses. They do not contain business workflows or direct Prisma queries.
- Use cases coordinate application workflows, enforce tenant boundaries, and
  call repository contracts.
- Domain entities protect meaningful business invariants and state changes.
- Repository interfaces define persistence boundaries; Prisma repositories
  implement those contracts in infrastructure.
- Prisma models are not exposed as HTTP responses or used directly by
  controllers.

Avoid abstractions that do not solve a current problem. Do not introduce
microservices, generic base classes, factories, CQRS, events, or value objects
without a concrete need.

## Multi-Tenancy and Membership

`Organization` is the tenant boundary. Organization-owned data must always be
created, read, updated, and deleted in the context of an organization.

Organization-owned entities include:

- Products
- Customers
- Sales orders and their items
- Suppliers
- Purchase orders, their items, and receipts

A user may belong to multiple organizations through `Membership`. The available
roles are:

- `OWNER`
- `ADMIN`
- `MEMBER`

Every protected organization operation must follow this flow:

```text
Authenticated user
        ->
Resolve requested or active organization
        ->
Validate active membership and role when required
        ->
Execute use case
        ->
Access only data whose organizationId matches the organization
```

Tenant isolation is mandatory. A user from one organization must never be able
to access, infer, update, or delete data belonging to another organization.
Resources outside the active organization should behave as not found rather than
revealing cross-tenant data.

## Core Entities

The persistence model currently contains:

- `User`
- `Organization`
- `Membership`
- `Product`
- `Customer`
- `Order`
- `OrderItem`
- `Supplier`
- `PurchaseOrder`
- `PurchaseOrderItem`
- `PurchaseReceipt`
- `PurchaseReceiptItem`

PostgreSQL is run locally through Docker Compose. Prisma manages the schema,
migrations, and generated client. Financial values are stored as fixed-precision
decimal columns.

Important data constraints include:

- A user can hold only one membership per organization.
- A product SKU is unique within its organization.
- Organization-owned tables are indexed by `organizationId`.
- Orders and purchase orders are indexed by their customer or supplier and
  status where appropriate.

## Business Flows

### 1. Organization Onboarding

When a new user joins the platform:

1. The user registers.
2. A `User` account is created.
3. The user creates an `Organization`.
4. A `Membership` is created.
5. The user receives the `OWNER` role.

The organization then becomes the tenant context for its commercial operations.

### 2. Catalog and Customer Management

Members can create, list, retrieve, update, and deactivate products for their
organization. Products contain commercial details such as name, description,
SKU, price, stock, and status.

Members can also create, list, retrieve, update, and delete customers in their
organization. A customer can be used only by sales orders from that same
organization.

### 3. Sales Order Management

Sales order management is the primary commercial workflow:

```text
Select customer and products
        ->
Validate tenant ownership and business rules
        ->
Create order and item snapshots
        ->
Calculate total
        ->
Persist order
        ->
Manage its lifecycle
```

Before creating an order, the system must:

1. Resolve the current organization.
2. Confirm that the customer belongs to it.
3. Confirm that every selected product belongs to it.
4. Create the order and its items.
5. Preserve the product name, SKU, description, and unit price in each item.
6. Calculate totals from domain data.
7. Persist the order.

Historical item data is immutable from the perspective of future product
changes: editing a product must not alter existing orders.

### 4. Purchasing and Stock Reception

Members manage suppliers, then create purchase orders for products in the same
organization. Purchase orders preserve product information and the unit cost
for their items.

Goods can be received in one or more receipts. Each receipt validates that:

- It contains at least one line.
- Every quantity is positive.
- A purchase order item is included at most once per receipt.
- The item belongs to the purchase order.
- The accumulated quantity never exceeds the quantity ordered.

Recording a receipt increases the related product stock. A purchase order moves
to `PARTIALLY_RECEIVED` until all ordered quantities have been received, then to
`RECEIVED`.

## Sales Order Lifecycle

Sales orders use these statuses:

```text
DRAFT -> PENDING -> CONFIRMED -> COMPLETED
```

They can also transition to `CANCELLED` from `DRAFT`, `PENDING`, or
`CONFIRMED`.

Transitions must be expressed by domain behavior:

- `order.submit()`
- `order.confirm()`
- `order.complete()`
- `order.cancel()`

Controllers, DTOs, and direct persistence updates must not arbitrarily set order
status. An order cannot be confirmed without items. Completed and cancelled
orders cannot be deleted.

## Purchase Order Lifecycle

Purchase orders use these statuses:

```text
DRAFT -> ORDERED -> PARTIALLY_RECEIVED -> RECEIVED
```

They can be cancelled from `DRAFT` or `ORDERED`. A purchase order must contain
items before it can be ordered. It cannot receive goods while in `DRAFT`,
`CANCELLED`, or `RECEIVED`. Purchase orders with receipts or received
quantities cannot be deleted.

## Integration Boundaries

Current integrations are intentionally limited:

- The frontend consumes the backend REST API using Axios.
- Authentication is integrated through a JWT issued by the backend in an
  httpOnly cookie.
- The backend connects to PostgreSQL through Prisma and `DATABASE_URL`.
- Docker Compose provisions PostgreSQL for local development.
- The backend contains independently configurable OpenAI and Google Gemini
  text-generation connectors behind a provider-neutral contract. Gemini is
  primary and OpenAI is a fallback only after a Gemini failure. Restricted
  administrator-only endpoints provide a fixed-prompt connectivity check, an
  explicit operational-summary request, and guided operational search. The
  summary sends only tenant-filtered aggregate product, sales-order, and
  purchase-order metrics; it does not send personal data, IDs, order content,
  or financial values. Search is limited to a closed set of intents for
  out-of-stock products, pending sales orders, and open purchase orders; its
  connector output cannot generate arbitrary database queries or mutations.
  Product, sales-order, and purchase-order screens also offer explicit,
  section-scoped summaries that send metrics from only their own section.

There are no external payment, invoicing, shipping, notification, analytics, or
other active AI product integrations beyond the read-only dashboard assistance
described above.

## MVP User Journey

1. A user registers and creates an organization.
2. The user becomes its owner.
3. The organization manages products, customers, and suppliers.
4. The organization creates sales orders and manages their lifecycle.
5. The organization creates purchase orders and receives products.
6. Each operation remains scoped to the user's active organization.

The MVP goal is a maintainable, secure multi-tenant platform that centralizes
the operational lifecycle of commercial sales and purchasing.
